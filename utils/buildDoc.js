import { spawn } from 'child_process';

// don't know why process doesn't exit after vitepress builds complete, so use this script to stop it

const child = spawn('pnpm', ['vitepress', 'build', 'src/docs']);

child.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('build complete')) {
    console.log('Build complete, stopping all processes...');
    process.exit(0);
  } else console.log(output)
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('error', (error) => {
  console.error('Failed to start subprocess.', error);
});
