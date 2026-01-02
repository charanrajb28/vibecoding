
import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";

function buildTree(paths: string[], root: string) {
    const rootNode = { name: projectId, type: 'folder', path: root, children: [] };
    const map: { [key: string]: any } = { [root]: rootNode };

    // Handle empty find output
    if (paths.length === 1 && paths[0] === '') {
        return [rootNode];
    }

    paths.forEach(path => {
        const parts = path.substring(root.length + 1).split('/');
        let currentPath = root;
        let parent = rootNode.children;

        parts.forEach((part, index) => {
            currentPath += `/${part}`;
            let node = parent.find(child => child.name === part);

            if (!node) {
                const isDirectory = index < parts.length - 1 || path.endsWith('/');
                node = {
                    name: part,
                    path: currentPath,
                    type: isDirectory ? 'folder' : 'file',
                    children: isDirectory ? [] : undefined,
                };
                parent.push(node);
            }

            if (node.type === 'folder') {
                parent = node.children!;
            }
        });
    });

    return [rootNode];
}


let projectId = "";

export async function POST(req: Request) {
  const { userId, projectId: pId } = await req.json();
  projectId = pId;
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

  // Using find to list both files and directories
  await exec.exec(
    "default",
    podName,
    "runner",
    // Find all files and directories, then strip leading './'
    ["bash", "-c", `find ${root} -mindepth 1 | sed 's|^./||'`],
    stream,
    streamErr,
    null,
    false
  );

  const filesAndDirs = output.trim().split("\n").filter(p => p); // Filter out empty strings
  const tree = buildTree(filesAndDirs, root);
  
  return NextResponse.json(tree);
}
