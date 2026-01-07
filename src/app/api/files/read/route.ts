import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

export async function POST(req: Request) {
  const { userId, filePath } = await req.json();
  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50)}`;

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  const stdout = new stream.PassThrough();
  let content = "";

  stdout.on("data", d => content += d.toString());

  const execPromise = new Promise<void>((resolve, reject) => {
    exec.exec(
      "default",
      podName,
      "runner",
      ["bash","-c",`cat "${filePath}"`],
      stdout,
      process.stderr,
      null,
      false
    );
    stdout.on("end", resolve);
    stdout.on("error", reject);
  });

  const timeoutPromise = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error("Exec timed out")), 8000)
  );

  try {
    await Promise.race([execPromise, timeoutPromise]);
  } catch {
    return NextResponse.json({ error: "Read timeout" }, { status: 500 });
  }

  return NextResponse.json({ content });
}
