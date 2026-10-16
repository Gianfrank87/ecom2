import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '.local', 'entregas');
if (process.platform !== 'win32') {
  throw new Error('El empaquetado ZIP usa PowerShell en Windows. En otros sistemas ejecutar npm run build y comprimir client/dist con rutas ZIP separadas por /.');
}

const build = spawnSync(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build'], {
  cwd: path.join(root, 'client'), stdio: 'inherit', windowsHide: true,
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status || 1);

const filesIn = (directory, prefix = '') => fs.readdirSync(directory, { withFileTypes: true })
  .sort((a, b) => a.name.localeCompare(b.name))
  .flatMap(item => {
    const source = path.join(directory, item.name);
    const entry = prefix + item.name;
    if (item.isSymbolicLink()) throw new Error(`No se empaquetan enlaces: ${entry}`);
    return item.isDirectory() ? filesIn(source, entry + '/') : [{ source, entry }];
  });

const serverFiles = [
  'passenger.cjs', 'index.js', 'db.js', 'schema.js', 'logger.js',
  'check-db.js', 'bootstrap-mariadb.js', 'package.json', 'package-lock.json', '.env.example',
].map(entry => ({ source: path.join(root, 'server', entry), entry }));
const packages = [
  { archive: path.join(output, 'frontend.zip'), files: filesIn(path.join(root, 'client/dist')) },
  { archive: path.join(output, 'backend.zip'), files: [
    ...serverFiles,
    ...filesIn(path.join(root, 'server/config'), 'config/'),
    ...filesIn(path.join(root, 'server/services'), 'services/'),
  ] },
];
for (const { files } of packages) {
  for (const { source, entry } of files) {
    if (!fs.statSync(source).isFile()) throw new Error(`Falta el archivo ${entry}`);
    if (entry.includes('\\') || /(^|\/)(node_modules|uploads|\.git|\.local)(\/|$)/.test(entry)
      || (path.basename(entry).startsWith('.env') && path.basename(entry) !== '.env.example')) {
      throw new Error(`Archivo excluido de entregas: ${entry}`);
    }
  }
}
for (const entry of ['index.html', '.htaccess']) {
  if (!packages[0].files.some(file => file.entry === entry)) throw new Error(`Falta ${entry} en el frontend.`);
}
fs.mkdirSync(output, { recursive: true });

// .NET on Windows can otherwise write backslashes into ZIP names. Always use /.
// Paths travel as JSON in an environment variable, never as shell source code.
const command = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskPackages = ConvertFrom-Json $env:NIGDIZ_PACKAGE_MANIFEST
foreach ($taskPackage in $taskPackages) {
  $taskStream = [IO.File]::Open($taskPackage.archive, [IO.FileMode]::Create)
  $taskZip = [IO.Compression.ZipArchive]::new($taskStream, [IO.Compression.ZipArchiveMode]::Create)
  try {
    foreach ($taskFile in $taskPackage.files) {
      $taskName = $taskFile.entry.Replace([char]92, [char]47)
      [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskZip, $taskFile.source, $taskName, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  } finally { $taskZip.Dispose(); $taskStream.Dispose() }
  $taskCheck = [IO.Compression.ZipFile]::OpenRead($taskPackage.archive)
  try {
    if ($taskCheck.Entries.Count -ne $taskPackage.files.Count) { throw 'ZIP incompleto' }
    foreach ($taskEntry in $taskCheck.Entries) {
      if ($taskEntry.FullName.Contains([char]92)) { throw 'Separador Windows en ZIP' }
    }
  } finally { $taskCheck.Dispose() }
}
`;
const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], {
  cwd: root, stdio: 'inherit', windowsHide: true,
  env: { ...process.env, NIGDIZ_PACKAGE_MANIFEST: JSON.stringify(packages) },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
for (const { archive, files } of packages) {
  console.log(`${path.relative(root, archive)}: ${files.length} archivos, ${fs.statSync(archive).size} bytes; rutas ZIP verificadas.`);
}
