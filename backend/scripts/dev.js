import { spawn } from 'node:child_process';

const isRenderEnvironment = Boolean(
  process.env.RENDER ||
  process.env.RENDER_SERVICE_ID ||
  process.env.CI,
);

if (isRenderEnvironment) {
  console.log('Render environment detected; installing dependencies for the start command.');

  const install = spawn('npm', ['install', '--omit=dev'], {
    stdio: 'inherit',
    shell: true,
  });

  install.on('exit', (code) => {
    if (code !== 0) {
      process.exit(code ?? 1);
      return;
    }

    console.log('Dependencies installed; allowing the start command to run.');
    process.exit(0);
  });

  install.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  const child = spawn('nodemon', ['server.js'], {
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}