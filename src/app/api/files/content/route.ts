
import { NextResponse } from "next/server";
import { getKubeClient } from "@/lib/kube";
import k8s from "@kubernetes/client-node";

async function execCommand(podName: string, command: string[]) {
  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  let output = "";
  const stream = new (require("stream").Writable)({
    write(chunk: any, _: any, cb: any) {
      output += chunk.toString();
      cb();
    },
  });

  const streamErr = new (require("stream").Writable)({
    write(chunk: any, _: any, cb: any) {
      output += chunk.toString();
      cb();
    },
  });

  await exec.exec(
    "default",
    podName,
    "runner",
    command,
    stream,
    streamErr,
    null,
    false
  );

  return output;
}

export async function POST(req: Request) {
  const { userId, path, content } = await req.json();
  const podName = "user-" + userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50);

  if (content !== undefined) {
    // Write file content
    const command = ["/bin/sh", "-c", `echo '${content.replace(/'/g, "'\\''")}' > ${path}`];
    await execCommand(podName, command);
    return NextResponse.json({ success: true });
  } else {
    // Read file content
    const command = ["cat", path];
    const fileContent = await execCommand(podName, command);
    return NextResponse.json({ content: fileContent });
  }
}
