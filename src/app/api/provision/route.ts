import { NextResponse } from "next/server";
import k8s from "@kubernetes/client-node";
import { GoogleAuth } from "google-auth-library";

async function getKubeClient() {
  const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT!),
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const token = await auth.getAccessToken();

  const kc = new k8s.KubeConfig();
  kc.loadFromOptions({
    clusters: [{
      name: "gke",
      server: process.env.GKE_ENDPOINT!,
      caData: process.env.GKE_CA!,
    }],
    users: [{ name: "codesail", token: token! }],
    contexts: [{
      name: "ctx",
      user: "codesail",
      cluster: "gke",
    }],
    currentContext: "ctx",
  });

  return kc.makeApiClient(k8s.CoreV1Api);
}

export async function POST(req: Request) {
  const { userId } = await req.json();
  const api = await getKubeClient();

  const pod = {
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name: `user-${userId}` },
    spec: {
      containers: [{
        name: "runner",
        image: "yourrepo/codesail-node:1.0",
        volumeMounts: [{
          name: "workspace",
          mountPath: "/workspace",
        }],
      }],
      volumes: [{
        name: "workspace",
        hostPath: {
          path: `/data/users/${userId}`,
          type: "DirectoryOrCreate",
        },
      }],
    },
  };

  await api.createNamespacedPod("default", pod);
  return NextResponse.json({ success: true });
}
