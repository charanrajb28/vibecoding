
import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

function buildTree(items: any[], root: string, projectId: string) {
  const rootNode = { name: projectId, path: root, type: "folder", children: [] as any[] };

  const itemMap: { [key: string]: any } = {};
  items.forEach(item => itemMap[item.path] = { ...item, children: item.type === 'folder' ? [] : undefined });

  const sortedItems = Object.values(itemMap).sort((a, b) => a.path.localeCompare(b.path));

  sortedItems.forEach(item => {
    if (item.path === root) {
      // This is the root item itself, we can ignore it as we've already created rootNode
      return;
    }

    const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
    const parent = itemMap[parentPath];

    if (parent && parent.children) {
      parent.children.push(item);
      // Sort children: folders first, then alphabetically
      parent.children.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    } else if (parentPath === root) {
        rootNode.children.push(item);
        // Sort children: folders first, then alphabetically
        rootNode.children.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    }
  });

  // Assign the collected children to the root node
  rootNode.children = itemMap[root]?.children || rootNode.children;

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
  
  console.log('buildTree output:', JSON.stringify(tree, null, 2));

  return NextResponse.json(tree);
}
