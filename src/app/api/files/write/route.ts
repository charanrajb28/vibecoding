import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

export async function POST(req: Request) {
  const { userId, filePath, content } = await req.json();
  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50)}`;

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  const stdin = new stream.PassThrough();
  stdin.write(content);
  stdin.end();

  await exec.exec(
    "default",
    podName,
    "runner",
    ["bash","-c",`cat > "${filePath}"`],
    process.stdout,
    process.stderr,
    stdin,
    false
  );

  return NextResponse.json({ ok: true });
}
