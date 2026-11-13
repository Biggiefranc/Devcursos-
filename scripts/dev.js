const { spawn } = require("node:child_process");
const path = require("node:path");

const backendDir = path.resolve(__dirname, "../Back-End");
const frontendDir = path.resolve(__dirname, "../Front-End");

function startProcess(label, cwd, args) {
  const child = spawn("npm", args, {
    cwd,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      FORCE_COLOR: "1"
    }
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`\n[${label}] saiu com código ${code}.`);
    }
  });

  return child;
}

const backend = startProcess("backend", backendDir, ["run", "dev"]);
const frontend = startProcess("frontend", frontendDir, ["run", "dev"]);

const shutdown = () => {
  backend.kill("SIGINT");
  frontend.kill("SIGINT");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

backend.on("exit", (code) => {
  if (code !== 0) process.exit(code ?? 1);
});

frontend.on("exit", (code) => {
  if (code !== 0) process.exit(code ?? 1);
});
