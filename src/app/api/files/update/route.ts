
import { NextResponse } from "next/server";
import { getKubeClient } from "@/lib/kube";
import k8s from "@kubernetes/client-node";

export async function POST(req: Request) {
  const { userId, action, path, newPath } = await req.json();
  const podName = "user-" + userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50);

  let command: string[] = [];

  switch (action) {
    case "new-file":
      command = ["touch", path];
      break;
    case "new-folder":
      command = ["mkdir", "-p", path];
      break;

    case "rename":
      command = ["mv", path, newPath];
      break;
    case "delete":
      command = ["rm", "-rf", path];
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  let output = "";
  const stream = new (require("stream").Writable)({
    write(chunk: any, _: any, cb: any) {
        output += chunk.toString();
        cb();
    }
  });

  await exec.exec(
    "default",
    podName,
    "runner",
    command,
    stream,
    stream, // Also capture stderr
    null,
    false
  );

  if (output) {
      // If there was any output, it's likely an error from the shell command
      return NextResponse.json({ success: false, error: output }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
