const fs = require('fs');

const TARGET_PORT = process.argv[2] || '';
const PATTERNS = ['src/server.js', 'nodemon src/server.js', 'vite', 'node_modules/.bin/vite'];
const SELF_PIDS = new Set([process.pid, process.ppid]);

function shouldKill(cmd) {
    if (cmd.includes('src/server.js') || cmd.includes('nodemon src/server.js')) {
        return true;
    }

    if (cmd.includes('vite')) {
        return !TARGET_PORT || cmd.includes(String(TARGET_PORT));
    }

    return false;
}

const pids = [];
for (const entry of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;

    const cmdlinePath = `/proc/${entry}/cmdline`;
    try {
        const raw = fs.readFileSync(cmdlinePath);
        const cmd = raw.toString().replace(/\0/g, ' ').trim();
        if (!cmd) continue;

        if (SELF_PIDS.has(Number(entry))) continue;

        if (PATTERNS.some((pattern) => cmd.includes(pattern)) && shouldKill(cmd)) {
            pids.push(Number(entry));
        }
    } catch {
        // processo já encerrou
    }
}

for (const pid of [...new Set(pids)]) {
    try {
        process.kill(pid, 'SIGTERM');
    } catch {
        // ignora processos já encerrados
    }
}

setTimeout(() => {
    for (const pid of [...new Set(pids)]) {
        try {
            process.kill(pid, 'SIGKILL');
        } catch {
            // ignora processos já encerrados
        }
    }
}, 750);
