import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const executable = fileURLToPath(
  new URL(
    process.platform === 'win32'
      ? '../.venv/Scripts/python.exe'
      : '../.venv/bin/python',
    import.meta.url,
  ),
);
const child = spawn(executable, process.argv.slice(2), {
  stdio: 'inherit',
  windowsHide: true,
});
child.on('error', () => {
  process.stderr.write(
    'Crie o ambiente .venv e instale as dependências do pipeline.\n',
  );
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
