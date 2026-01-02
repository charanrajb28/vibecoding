
import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";

function buildTree(paths: string[], root: string) {
    const rootNode = { name: 'workspace', type: 'folder', path: root, children: [] as any[] };
    const map: { [key: string]: any } = { [root]: rootNode };

    // Handle empty find output
    if (paths.length === 1 && paths[0] === '') {
        return [rootNode];
    }
    
    // Sort paths to ensure parent directories are created before children
    paths.sort();

    paths.forEach(path => {
        const parts = path.substring(root.length + 1).split('/');
        let currentParent = rootNode;
        let currentPath = root;

        parts.forEach((part, index) => {
            currentPath += `/${part}`;
            let node = currentParent.children.find(child => child.name === part);

            if (!node) {
                const isDirectory = path.endsWith('/') || index < parts.length - 1;
                node = {
                    name: part,
                    path: currentPath,
                    type: isDirectory ? 'folder' : 'file',
                };
                if (isDirectory) {
                    node.children = [];
                }
                currentParent.children.push(node);
            }
            
            if (node.type === 'folder') {
                currentParent = node;
            }
        });
    });

    return [rootNode];
}


export async function POST(req: Request) {
  const { userId, projectId } = await req.json();
  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 50)}`;
  const root = `/workspace/${projectId}`;

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  let output = "";
  const stream = new (require("stream").Writable)({
    write(chunk: any, _: any, cb: any) {
      output += chunk.toString();
      cb();
    }
  });

   const streamErr = new (require("stream").Writable)({
    write(chunk: any, _: any, cb: any) {
      // For now, let's log errors from find, but not fail the request
      // This can happen if the directory is empty
      console.log('stderr from find:', chunk.toString());
      cb();
    }
  });

  // Using find to list all files and directories that exist
  await exec.exec(
    "default",
    podName,
    "runner",
    // Find all files and directories, then strip leading './'
    ["bash", "-c", `cd ${root} && find . -mindepth 1 | sed 's|^./||'`],
    stream,
    streamErr,
    null,
    false
  );

  const relativePaths = output.trim().split("\n").filter(p => p); // Filter out empty strings
  const absolutePaths = relativePaths.map(p => `${root}/${p}`);
  const tree = buildTree(absolutePaths, root);
  
  return NextResponse.json(tree);
}
