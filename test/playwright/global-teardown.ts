import fs from "node:fs";
import path from "node:path";

const PID_FILE = path.join(process.cwd(), "test-results", ".anvil.pid");

export default async function globalTeardown() {
  if (!fs.existsSync(PID_FILE)) return;

  const pidStr = fs.readFileSync(PID_FILE, "utf8").trim();
  fs.rmSync(PID_FILE, { force: true });

  const pid = Number(pidStr);
  if (!Number.isFinite(pid)) return;

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // ignore
  }
}
