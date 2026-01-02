
import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

function buildTree(paths: string[], root: string, projectId: string) {
  const rootNode = { name: projectId, type: "folder", path: root, children: [] as any[] };

  if (paths.length === 1 && paths[0] === root) {
    // This case handles an empty directory
    return [rootNode];
  }
  
  paths.forEach(p => {
    // Only process paths that are children of the root
    if (!p.startsWith(root + '/')) return;

    const parts = p.substring(root.length + 1).split("/");
    let current = rootNode;

    parts.forEach((part, i) => {
      const isLastPart = i === parts.length - 1;
      const fullPath = `${current.path}/${part}`;
      
      let node = current.children.find((c: any) => c.name === part);

      if (!node) {
        // A path is a folder if it's not the last part of its own path,
        // OR if another path exists that is a child of it.
        const isFolder = !isLastPart || paths.some(otherPath => otherPath.startsWith(`${p}/`));
        
        node = {
          name: part,
          path: p, // Use the full path for the node
          type: isFolder ? "folder" : "file",
        };
        if (isFolder) {
            node.children = [];
        }
        current.children.push(node);

        // Sort children: folders first, then by name
        current.children.sort((a,b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
      }
      
      if(node.type === 'folder') {
         current = node;
      }
    });
  });

  return [rootNode];
}

export async function POST(req: Request) {
  const { userId, projectId } = await req.json();
  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0,50)}`;
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

  await exec.exec(
    "default",
    podName,
    "runner",
    ["bash","-c",`
      mkdir -p ${root}
      if [ -z "$(ls -A ${root})" ]; then
        touch ${root}/README.md
      fi
      find ${root}
    `],
    writable,
    writable,
    null,
    false
  );

  const files = output.trim().split("\n").filter(Boolean);
  const tree = buildTree(files, root, projectId);

  return NextResponse.json(tree);
}
