const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/PC/Documents/Hiver 2026/Gestion_de_stocks';

function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file, index) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
         deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
};

try {
  // 1. Delete .venv
  console.log("Deleting .venv...");
  deleteFolderRecursive(path.join(rootDir, '.venv'));

  // 2. Delete root package files
  console.log("Deleting root package files...");
  if (fs.existsSync(path.join(rootDir, 'package.json'))) fs.unlinkSync(path.join(rootDir, 'package.json'));
  if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) fs.unlinkSync(path.join(rootDir, 'package-lock.json'));

  // 3. Move backend scripts to archive
  const backendDir = path.join(rootDir, 'backend');
  const archiveDir = path.join(backendDir, 'scripts', 'archive');
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

  const backendFiles = fs.readdirSync(backendDir);
  backendFiles.forEach(file => {
    if (file.endsWith('.js') && (
      file.startsWith('test') || 
      file.startsWith('check') || 
      file.startsWith('diag') || 
      file.startsWith('run') || 
      file.startsWith('verify') || 
      file === 'create_admin.js' || 
      file === 'fix_views.js'
    )) {
      console.log(`Archiving backend script: ${file}`);
      fs.renameSync(path.join(backendDir, file), path.join(archiveDir, file));
    }
  });

  // 4. Move database migrations
  const databaseDir = path.join(rootDir, 'database');
  const migrationsDir = path.join(databaseDir, 'migrations');
  if (!fs.existsSync(migrationsDir)) fs.mkdirSync(migrationsDir, { recursive: true });

  const databaseFiles = fs.readdirSync(databaseDir);
  databaseFiles.forEach(file => {
    if (file.endsWith('.sql') || file.startsWith('schema_render.sql')) {
      console.log(`Moving DB file to migrations: ${file}`);
      fs.renameSync(path.join(databaseDir, file), path.join(migrationsDir, file));
    }
  });

  console.log("✅ File cleanup completed successfully!");
} catch (err) {
  console.error("❌ Error during file cleanup:", err.message);
}
