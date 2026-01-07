
import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

export async function POST(req: Request) {
  const { userId, filePath } = await req.json();
  if (!userId || !filePath) {
    return NextResponse.json({ error: 'Missing userId or filePath' }, { status: 400 });
  }
  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50)}`;

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  const stdout = new stream.PassThrough();
  let content = "";
  let errorOutput = "";

  stdout.on("data", d => content += d.toString());

  const stderr = new stream.PassThrough();
  stderr.on("data", d => errorOutput += d.toString());


  const execPromise = new Promise<void>((resolve, reject) => {
      const stream = exec.exec(
          "default",
          podName,
          "runner",
          ["cat", filePath],
          stdout,
          stderr,
          null,
          false,
          (status) => {
              if (status.status === 'Failure') {
                  reject(new Error(`Exec failed with status: ${status.message}`));
              }
          }
      );
      
      stream.onclose = () => {
          resolve();
      };

      stream.onerror = (err) => {
          reject(err);
      };
  });

  const timeoutPromise = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error("Exec command timed out")), 5000)
  );

  try {
    await Promise.race([execPromise, timeoutPromise]);

    if (errorOutput) {
        return NextResponse.json({ error: errorOutput }, { status: 500 });
    }

    return NextResponse.json({ content });

  } catch (err: any) {
    // Check if the error message is from our timeout
    if (err.message === "Exec command timed out") {
        return NextResponse.json({ error: "Read operation timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: err.message || 'Failed to read file' }, { status: 500 });
  }
}
