
import { NextResponse } from "next/server";
import { getKubeClient } from "@/lib/kube";
import k8s from "@kubernetes/client-node";

async function execCommand(podName: string, command: string[], projectId: string) {
  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  let output = "";
  const stream = new (require("stream").Writable)({
    write(chunk: any, _: any, cb: any) {
        output += chunk.toString();
        cb();
    }
  });

  const fullCommand = ["bash", "-c", `cd /workspace/${projectId} && ${command.join(' ')}`];

  try {
    await exec.exec(
        "default",
        podName,
        "runner",
        fullCommand,
        stream,
        stream, // Also capture stderr
        null,
        false
    );
  } catch (e: any) {
    return { success: false, error: e.message || "Exec command failed" };
  }

  if (output) {
      return { success: false, error: output };
  }

  return { success: true };
}


export async function POST(req: Request) {
  const { userId, projectId, action, path, newPath } = await req.json();
  if (!userId || !projectId || !action || !path) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }
  const podName = "user-" + userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50);

  let command: string[] = [];

  // Make paths relative to the project root for safety
  const projectRoot = `/workspace/${projectId}`;
  const safePath = path.startsWith(projectRoot) ? path.substring(projectRoot.length + 1) : path;
  const safeNewPath = newPath && (newPath.startsWith(projectRoot) ? newPath.substring(projectRoot.length + 1) : newPath);

  switch (action) {
    case "new-file":
      command = ["touch", `"${safePath}"`];
      break;
    case "new-folder":
      command = ["mkdir", "-p", `"${safePath}"`];
      break;
    case "rename":
      if (!safeNewPath) {
        return NextResponse.json({ error: "Missing newPath for rename action" }, { status: 400 });
      }
      command = ["mv", `"${safePath}"`, `"${safeNewPath}"`];
      break;
    case "delete":
      command = ["rm", "-rf", `"${safePath}"`];
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const result = await execCommand(podName, command, projectId);

  if (!result.success) {
      return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
