
import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";

function buildTree(paths: string[], root: string) {
    const rootNode = { name: 'workspace', type: 'folder', path: root, children: [] as any[] };
    const map: { [key: string]: any } = { [root]: rootNode };

    if (paths.length === 1 && paths[0] === '') {
        return [rootNode];
    }
    
    paths.sort((a, b) => a.localeCompare(b));

    paths.forEach(path => {
        const parts = path.substring(root.length + 1).split('/');
        let currentParent = rootNode;
        let currentPath = root;

        parts.forEach((part, index) => {
            currentPath += `/${part}`;
            let node = currentParent.children.find(child => child.path === currentPath);

            if (!node) {
                const isDirectory = index < parts.length - 1 || paths.some(p => p.startsWith(currentPath + '/'));
                 // A path is a directory if it's not the last part of a path OR
                 // if other paths exist that are children of it. This is not perfect,
                 // as it can't represent empty directories not found by `find`. We will fix this.
                
                 node = {
                    name: part,
                    path: currentPath,
                    type: 'file', // Assume file initially
                };

                if (isDirectory) {
                   node.type = 'folder';
                   node.children = [];
                }
                
                currentParent.children.push(node);

                currentParent.children.sort((a, b) => {
                    if (a.type === 'folder' && b.type === 'file') return -1;
                    if (a.type === 'file' && b.type === 'folder') return 1;
                    return a.name.localeCompare(b.name);
                });
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
      console.log('stderr from find:', chunk.toString());
      cb();
    }
  });

  // Using find to list all files AND directories
  await exec.exec(
    "default",
    podName,
    "runner",
    // Find all files and directories, then strip leading './'
    ["bash", "-c", `cd ${root} >/dev/null 2>&1 && find . -not -path '.' | sed 's|^./||'`],
    stream,
    streamErr,
    null,
    false
  );

  const relativePaths = output.trim().split("\n").filter(p => p); 
  const absolutePaths = relativePaths.map(p => `${root}/${p}`);
  
  // This function now expects absolute paths
  const tree = buildTree(absolutePaths, root);
  
  return NextResponse.json(tree);
}
