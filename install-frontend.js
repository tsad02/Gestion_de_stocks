const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const frontendDir = path.join(__dirname, 'frontend');

console.log('📦 Installation des dépendances du frontend...');
console.log(`📂 Répertoire: ${frontendDir}`);

try {
  // Change to frontend directory and run npm install
  const currentDir = process.cwd();
  process.chdir(frontendDir);
  
  console.log('🔄 Exécution de npm install...\n');
  execSync('npm install', { 
    stdio: 'inherit',
    shell: true 
  });
  
  process.chdir(currentDir);
  console.log('\n✅ Installation complétée avec succès!');
  console.log('🚀 Pour démarrer le serveur de développement:');
  console.log('   cd frontend');
  console.log('   npm run dev');
} catch (error) {
  console.error('❌ Erreur lors de l\'installation:', error.message);
  process.exit(1);
}
