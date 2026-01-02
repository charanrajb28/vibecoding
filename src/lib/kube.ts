import k8s from "@kubernetes/client-node";
import fs from "fs";
import path from "path";
import { GoogleAuth } from "google-auth-library";

export async function getKubeClient() {
  const creds = JSON.parse(fs.readFileSync(path.join(process.cwd(), "key.json"), "utf8"));

  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  const token = (await client.getAccessToken()).token!;

  const kc = new k8s.KubeConfig();
  kc.loadFromOptions({
    clusters: [{
      name: "gke",
      server: process.env.GKE_ENDPOINT!,
      caData: process.env.GKE_CA!,
    }],
    users: [{ name: "codesail", token }],
    contexts: [{ name: "ctx", user: "codesail", cluster: "gke" }],
    currentContext: "ctx",
  });

  return { api: kc.makeApiClient(k8s.CoreV1Api), kc };
}
