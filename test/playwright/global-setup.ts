import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_RPC_URL = "http://127.0.0.1:8545";
const DEFAULT_PORT = 8545;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_STATE_PATH = "./tsender-deployed.json";

const PID_FILE = path.join(process.cwd(), "test-results", ".anvil.pid");

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function isAnvilUp(rpcUrl: string): Promise<boolean> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return typeof json?.result === "string";
  } catch {
    return false;
  }
}

export default async function globalSetup() {
  const rpcUrl = process.env.ANVIL_RPC_URL || DEFAULT_RPC_URL;
  const port = Number(process.env.ANVIL_PORT || DEFAULT_PORT);
  const host = process.env.ANVIL_HOST || DEFAULT_HOST;
  const statePath = process.env.ANVIL_STATE_PATH || DEFAULT_STATE_PATH;

  if (await isAnvilUp(rpcUrl)) {
    return;
  }

  fs.mkdirSync(path.dirname(PID_FILE), { recursive: true });

  const absoluteStatePath = path.isAbsolute(statePath)
    ? statePath
    : path.join(process.cwd(), statePath);

  const anvil = spawn(
    "anvil",
    ["--load-state", absoluteStatePath, "--port", String(port), "--host", host],
    {
      stdio: "inherit",
      env: process.env,
    },
  );

  if (!anvil.pid) {
    throw new Error("Failed to start Anvil (no pid). Is Foundry installed?");
  }

  fs.writeFileSync(PID_FILE, String(anvil.pid), "utf8");

  // Wait until JSON-RPC responds.
  const timeoutMs = 20_000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isAnvilUp(rpcUrl)) return;
    await sleep(250);
  }

  throw new Error(`Anvil did not start within ${timeoutMs}ms at ${rpcUrl}`);
}
