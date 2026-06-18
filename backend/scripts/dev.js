import { spawn } from 'node:child_process';

const isRenderEnvironment = Boolean(
  process.env.RENDER ||
  process.env.RENDER_SERVICE_ID ||
  process.env.CI,
);

if (isRenderEnvironment) {
  console.log('Render environment detected; skipping nodemon and allowing the start command to run.');
  process.exit(0);
}

const child = spawn('nodemon', ['server.js'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});