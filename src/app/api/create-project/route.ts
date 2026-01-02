import { NextResponse } from "next/server";
import { getKubeClient } from "@/lib/kube";
import k8s from "@kubernetes/client-node";

export async function POST(req: Request) {
  const { userId, projectId } = await req.json();

  const podName = "user-" + userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50);

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  await exec.exec(
    "default",
    podName,
    "runner",
    ["bash","-c",`mkdir -p /workspace/${projectId}`],
    process.stdout,
    process.stderr,
    null,
    false
  );

  return NextResponse.json({ ok: true });
}
