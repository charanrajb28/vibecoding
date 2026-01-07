
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

  const execPromise = new Promise<void>((resolve, reject) => {
    const ws = exec.exec(
        "default",
        podName,
        "runner",
        // Use tee to write content from stdin to the file
        ["bash","-c", `tee "${filePath}" > /dev/null`], 
        null, // stdout is not needed
        stderr,
        stdin,
        false
    );

    ws.onclose = () => {
        resolve();
    };
    ws.onerror = (err: any) => {
        reject(err);
    };
  });

  const timeoutPromise = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error("Exec write command timed out")), 5000)
  );
  
  try {
    await Promise.race([execPromise, timeoutPromise]);
    
    if (errorOutput) {
      return NextResponse.json({ ok: false, error: errorOutput }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });

  } catch (err: any) {
    if (err.message === "Exec write command timed out") {
        return NextResponse.json({ error: "Write operation timed out" }, { status: 504 });
    }
    return NextResponse.json({ ok: false, error: err.message || 'Failed to write to file' }, { status: 500 });
  }
}
