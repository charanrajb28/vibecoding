
import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

export async function POST(req: Request) {
  const { userId, filePath, content } = await req.json();
  if (!userId || !filePath || content === undefined) {
    return NextResponse.json({ error: 'Missing userId, filePath, or content' }, { status: 400 });
  }
  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50)}`;

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  const stdin = new stream.PassThrough();
  stdin.write(content);
  stdin.end();

  let errorOutput = "";
  const stderr = new stream.PassThrough();
  stderr.on("data", d => errorOutput += d.toString());

  try {
    const ws = await exec.exec(
        "default",
        podName,
        "runner",
        ["bash","-c", `tee "${filePath}" > /dev/null`], // Use tee to handle stdin
        null, // stdout is not needed
        stderr, // Capture stderr
        stdin,
        true // TTY - might not be necessary but can help with some commands
    );

    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Exec write command timed out"));
        }, 5000);
        
        ws.onclose = () => {
            clearTimeout(timeout);
            resolve();
        };
        ws.onerror = (err: any) => {
            clearTimeout(timeout);
            reject(err);
        };
    });
    
    if (errorOutput) {
      return NextResponse.json({ ok: false, error: errorOutput }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Failed to write to file' }, { status: 500 });
  }
}
