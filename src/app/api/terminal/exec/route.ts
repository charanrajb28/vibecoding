import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { getKubeClient } from "@/lib/kube";
import stream from "stream";

export async function POST(req: Request) {
  const { userId, command, cwd } = await req.json();
  const podName = `user-${userId.toLowerCase().replace(/[^a-z0-9]/g,"-").slice(0,50)}`;

  const { kc } = await getKubeClient();
  const exec = new k8s.Exec(kc);

  const stdout = new stream.PassThrough();
  const stderr = new stream.PassThrough();

  let output = "";

  stdout.on("data", d => output += d.toString());
  stderr.on("data", d => output += d.toString());

  // Use a promise to wait for the exec to finish, but handle streams ending
  const execPromise = new Promise<void>((resolve, reject) => {
    exec.exec(
      "default",
      podName,
      "runner",
      // IMPORTANT: Use `cd` and `&&` to ensure the command runs in the correct directory.
      // The `|| exit` part is a safety measure to stop if `cd` fails.
      ["bash","-c",`cd "${cwd || "/workspace"}" && ${command}`],
      stdout,
      stderr,
      null, // No stdin for now
      false, // tty
      (status) => {
        // The status callback is the most reliable way to know when the command is done.
        if (status.status === 'Success' || status.status === 'Failure') {
            // Wait just a moment for any final stream data to be flushed.
            setTimeout(resolve, 100);
        }
      }
    ).catch(reject);
  });

  const timeoutPromise = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error("Terminal command timed out after 30 seconds")), 30000)
  );

  try {
    await Promise.race([execPromise, timeoutPromise]);
  } catch (err: any) {
    // If the error is from k8s exec itself (e.g., command not found), it often comes through stderr.
    // We will already have the output, so we can just return it.
    // If it's a timeout or connection error, the output might be empty but we should still return.
     if (!output) {
      output = err.message || "An unknown error occurred during command execution.";
    }
  }

  return NextResponse.json({ output: output.trim() });
}
