
import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

function buildTree(items: any[], root: string, projectId: string) {
  const rootNode = { name: projectId, path: root, type: "folder", children: [] as any[] };
  const nodeMap: { [path: string]: any } = { [root]: rootNode };

  // First, create a map of all nodes
  items.forEach(item => {
    if (item.path !== root) { // Don't re-add the root
      nodeMap[item.path] = { ...item, children: item.type === 'folder' ? [] : undefined };
    }
  });
  console.log('--- Initial Node Map ---');
  console.log(JSON.stringify(nodeMap, null, 2));


  // Then, build the hierarchy
  console.log('--- Building Hierarchy ---');
  Object.values(nodeMap).forEach(node => {
    if (node.path === root) return; // Skip root node

    const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
    const parent = nodeMap[parentPath];

    if (parent && parent.children) {
      console.log(`Attaching node '${node.name}' to parent '${parent.name}'`);
      parent.children.push(node);
    } else {
      console.log(`Could not find parent for node '${node.name}' at path '${parentPath}'`);
    }
  });
  console.log('--- Hierarchy Built ---');


  // Recursively sort children
  const sortChildren = (node: any) => {
    if (node.children) {
      node.children.sort((a: any, b: any) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortChildren);
    }
  };

  sortChildren(rootNode);

  return [rootNode];
}

export async function POST(req: Request) {
  const { userId, projectId } = await req.json();
  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50)}`;
  const root = `/workspace/${projectId}`;

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
    if [ ! -d ${root} ] || [ -z "$(ls -A ${root})" ]; then
      mkdir -p ${root}
      touch ${root}/README.md
    fi
    find ${root} -printf "%p|%s|%y\\n"
  `;

  await exec.exec(
    "default",
    podName,
    "runner",
    ["bash", "-c", command],
    writable,
    writable, // Also capture stderr
    null,
    false
  );
  
  if (output.trim() === '') {
    return NextResponse.json([{ name: projectId, path: root, type: "folder", children: [] }]);
  }

  const rows = output.trim().split("\n").map(r => {
    const [path, size, type] = r.split("|");
    return {
      path,
      name: path.split('/').pop(),
      size: Number(size),
      type: type === "d" ? "folder" : "file"
    };
  });

  const tree = buildTree(rows, root, projectId);
  
  console.log('--- Final buildTree output: ---');
  console.log(JSON.stringify(tree, null, 2));

  return NextResponse.json(tree);
}
