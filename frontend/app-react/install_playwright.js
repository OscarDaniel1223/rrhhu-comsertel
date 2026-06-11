import { execSync } from 'child_process';

try {
  console.log('Ejecutando npm install desde el script auxiliar de Node...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('Instalacion completada con exito.');
} catch (error) {
  console.error('Error durante la instalacion:', error);
  process.exit(1);
}
