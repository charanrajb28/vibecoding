
import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

function buildTree(items: any[], root: string, projectId: string) {
  console.log("====== buildTree START ======");
  console.log("Root:", root);
  console.log("ProjectId:", projectId);
  console.log("Items count:", items.length);
  console.log("Items sample:", items.slice(0, 5));

  const rootNode = { name: projectId, path: root, type: "folder", children: [] as any[] };
  const nodeMap: { [path: string]: any } = { [root]: rootNode };

  items.forEach(item => {
    if (item.path !== root) {
      nodeMap[item.path] = { ...item, children: item.type === "folder" ? [] : undefined };
    }
  });

  console.log("NodeMap keys:", Object.keys(nodeMap));

  Object.values(nodeMap).forEach((node: any) => {
    if (node.path === root) return;

    const parentPath = node.path.substring(0, node.path.lastIndexOf("/"));
    const parent = nodeMap[parentPath];

    if (!parent) {
      console.error("❌ Parent NOT FOUND");
      console.log("Node:", node.path);
      console.log("Computed parentPath:", parentPath);
      console.log("Available keys:", Object.keys(nodeMap));
    } else if (!parent.children) {
      console.error("❌ Parent has no children array:", parentPath);
    } else {
      console.log(`✅ Attaching ${node.path} -> ${parent.path}`);
      parent.children.push(node);
    }
  });

  const sortChildren = (node: any) => {
    if (!node.children) return;
    node.children.sort((a: any, b: any) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortChildren);
  };

  sortChildren(rootNode);

  console.log("====== buildTree RESULT ======");
  console.log(JSON.stringify(rootNode, null, 2));
  return [rootNode];
}

export async function POST(req: Request) {
  console.log("====== FILE TREE API HIT ======");

  const { userId, projectId } = await req.json();
  console.log("userId:", userId);
  console.log("projectId:", projectId);

  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50)}`;
  const root = `/workspace/${projectId}`;

  console.log("podName:", podName);
  console.log("root path:", root);

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  let output = "";
  const writable = new stream.Writable({
    write(chunk, _, next) {
      output += chunk.toString();
      next();
    }
  });

  const command = `
    echo "ROOT_EXISTS=$(test -d ${root} && echo yes || echo no)";
    echo "ROOT_CONTENTS=$(ls -A ${root} 2>/dev/null | wc -l)";
    if [ ! -d ${root} ] || [ -z "$(ls -A ${root} 2>/dev/null)" ]; then
      echo "CREATING ROOT AND README";
      mkdir -p ${root};
      touch ${root}/README.md;
    fi
    find ${root} -printf "%p|%s|%y\\n"
  `;

  console.log("Executing command in pod...");
  console.log(command);

  await exec.exec(
    "default",
    podName,
    "runner",
    ["bash", "-c", command],
    writable,
    writable,
    null,
    false
  );

  console.log("====== RAW POD OUTPUT ======");
  console.log(output);

  if (output.trim() === "") {
    console.warn("⚠️ EMPTY OUTPUT FROM POD");
    return NextResponse.json([{ name: projectId, path: root, type: "folder", children: [] }]);
  }

  const rows = output
    .trim()
    .split("\n")
    .filter(r => r.includes("|"))
    .map(r => {
      const [path, size, type] = r.split("|");
      return {
        path,
        name: path.split("/").pop(),
        size: Number(size),
        type: type === "d" ? "folder" : "file"
      };
    });

  console.log("====== PARSED ROWS ======");
  console.log(rows);

  const tree = buildTree(rows, root, projectId);

  console.log("====== FINAL TREE JSON ======");
  console.log(JSON.stringify(tree, null, 2));

  return NextResponse.json(tree);
}
