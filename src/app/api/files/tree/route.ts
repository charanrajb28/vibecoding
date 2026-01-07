import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

function buildTree(items: any[], root: string, projectId: string) {
  const rootNode = { name: projectId, path: root, type: "folder", children: [] as any[] };
  const map: any = { [root]: rootNode };

  // Pass 1 — register ALL folders first
  items
    .filter(i => i.type === "folder")
    .sort((a,b) => a.path.length - b.path.length)
    .forEach(item => {
      if (item.path !== root) {
        map[item.path] = { ...item, children: [] };
      }
    });

  // Pass 2 — register files
  items.filter(i => i.type === "file").forEach(item => {
    map[item.path] = { ...item };
  });

  // Pass 3 — attach children
  Object.values(map).forEach((node: any) => {
    if (node.path === root) return;
    const parentPath = node.path.substring(0, node.path.lastIndexOf("/"));
    const parent = map[parentPath];
    if (parent && parent.children) parent.children.push(node);
  });

  return [rootNode];
}


export async function POST(req: Request) {
  const { userId, projectId } = await req.json();
  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50)}`;
  const root = `/workspace/${projectId}`;

  console.log("====== FILE TREE API HIT ======");
  console.log("podName:", podName);
  console.log("root:", root);

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  const stdoutStream = new stream.PassThrough();
  const stderrStream = new stream.PassThrough();

  let output = "";

  stdoutStream.on("data", chunk => {
    const text = chunk.toString();
    console.log("📤 STDOUT:", text);
    output += text;
  });

  stderrStream.on("data", chunk => {
    console.error("📕 STDERR:", chunk.toString());
  });

  const cmd = `
  mkdir -p ${root}
  [ -z "$(ls -A ${root})" ] && touch ${root}/README.md
  find ${root} -path "*/node_modules" -prune -o -printf "%p|%s|%y\\n"
`;

  console.log("▶ Executing command in pod:\n", cmd);
  stdoutStream.setEncoding("utf8");
  stderrStream.setEncoding("utf8");
  
  await new Promise<void>((resolve, reject) => {
    exec.exec(
      "default",
      podName,
      "runner",
      ["bash","-c", cmd],
      stdoutStream,
      stderrStream,
      null,
      false
    );
  
    stdoutStream.on("end", () => resolve());
    stderrStream.on("error", reject);
  });
  

  console.log("▶ RAW OUTPUT:\n", output);

  if (!output.trim()) {
    console.log("⚠️ No output from pod");
    return NextResponse.json([{ name: projectId, path: root, type: "folder", children: [] }]);
  }

  const rows = output.trim().split("\n").map(r => {
    const [path,size,type] = r.split("|");
    return {
      path,
      name: path.split("/").pop(),
      size: Number(size),
      type: type === "d" ? "folder" : "file"
    };
  });

  const tree = buildTree(rows, root, projectId);

  console.log("▶ FINAL TREE:", JSON.stringify(tree, null, 2));

  return NextResponse.json(tree);
}
