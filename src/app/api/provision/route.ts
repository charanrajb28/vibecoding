import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { GoogleAuth } from "google-auth-library";

async function getKubeClient() {
  const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT!),
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) throw new Error("Failed to fetch GCP access token");

  const kc = new k8s.KubeConfig();
  kc.loadFromOptions({
    clusters: [{
      name: "gke",
      server: process.env.GKE_ENDPOINT!,
      caData: process.env.GKE_CA!,
    }],
    users: [{ name: "codesail", token: tokenResponse.token }],
    contexts: [{
      name: "ctx",
      user: "codesail",
      cluster: "gke",
    }],
    currentContext: "ctx",
  });

  return kc.makeApiClient(k8s.CoreV1Api);
}

async function waitForPod(api: k8s.CoreV1Api, name: string) {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await api.readNamespacedPod(name, "default");
      if (res.body.status?.phase === "Running") return res.body;
    } catch {}
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error("Pod creation timeout");
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    console.log("Provision start:", userId);

    const api = await getKubeClient();

    const res = await api.createNamespacedPod("default", {
      apiVersion: "v1",
      kind: "Pod",
      metadata: { name: `user-${userId}` },
      spec: {
        containers: [{
          name: "runner",
          image: "node:20",
          command: ["bash","-c","sleep infinity"],
        }],
      },
    });

    console.log("K8S response:", res.response?.statusCode);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PROVISION ERROR:", err?.body || err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

