import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [
  spawn(npmCommand, ['run', 'dev:server'], { stdio: 'inherit', shell: process.platform === 'win32' }),
  spawn(npmCommand, ['run', 'dev', '--', '--host', '127.0.0.1'], { stdio: 'inherit', shell: process.platform === 'win32' }),
]; 

let shuttingDown = false;

const shutdown = (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(exitCode), 250);
};

for (const child of children) {
  child.on('exit', (code, signal) => {
    if (!shuttingDown && (code !== 0 || signal)) {
      shutdown(code || 1);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
