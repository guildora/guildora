/**
 * Pre-dev port check: 3000 (Web), 3003 (Hub) und 3050 (Bot).
 * Sind Ports belegt, werden die Prozesse automatisch beendet, danach startet dev.
 */
const { execSync } = require("node:child_process");

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...opts });
  } catch {
    return "";
  }
}

const ports = [
  [3000, "Web"],
  [3003, "Hub"],
  [3050, "Bot"]
].map(([port, name]) => ({
  port,
  name,
  pids: (run(`lsof -i :${port} -t 2>/dev/null`) || "").trim() || "none"
}));

const used = ports.filter((p) => p.pids !== "none");
if (used.length > 0) {
  const allPids = new Set();
  used.forEach((p) => p.pids.split(/\s+/).filter(Boolean).forEach((pid) => allPids.add(pid)));
  console.warn("\n⚠️  Port(s) belegt – beende Prozess(e): " + [...allPids].join(", "));
  for (const pid of allPids) {
    run(`kill ${pid} 2>/dev/null`, { stdio: "inherit" });
  }
  run("sleep 0.5 2>/dev/null || true");
  const stillUsedPorts = ports.filter((p) => (run(`lsof -i :${p.port} -t 2>/dev/null`) || "").trim());
  if (stillUsedPorts.length > 0) {
    for (const p of stillUsedPorts) {
      const pids = (run(`lsof -i :${p.port} -t 2>/dev/null`) || "").trim().split(/\s+/).filter(Boolean);
      pids.forEach((pid) => run(`kill -9 ${pid} 2>/dev/null`, { stdio: "inherit" }));
    }
  }
  console.warn("   Ports freigegeben, starte dev …\n");
}
