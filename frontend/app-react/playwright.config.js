import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el path de node_modules a partir del ejecutable de npx que corre el proceso
const mainScript = process.argv[1];
let playwrightCachePath = '';

if (mainScript && mainScript.includes('_npx')) {
  const nodeModulesIndex = mainScript.indexOf('node_modules');
  if (nodeModulesIndex !== -1) {
    playwrightCachePath = mainScript.substring(0, nodeModulesIndex + 'node_modules'.length);
  }
}

// Fallback por si acaso
if (!playwrightCachePath) {
  const npxDir = '/home/bladimir/.npm/_npx';
  if (fs.existsSync(npxDir)) {
    const hashes = fs.readdirSync(npxDir);
    for (const hash of hashes) {
      const candidate = path.join(npxDir, hash, 'node_modules', '@playwright');
      if (fs.existsSync(candidate)) {
        playwrightCachePath = path.join(npxDir, hash, 'node_modules');
        break;
      }
    }
  }
}

if (playwrightCachePath) {
  // Obtener la ruta absoluta del directorio del archivo de configuracion decodificando correctamente los espacios
  const configDir = path.dirname(fileURLToPath(import.meta.url));
  const targetNodeModules = path.resolve(configDir, 'node_modules');
  
  if (!fs.existsSync(targetNodeModules)) {
    fs.mkdirSync(targetNodeModules, { recursive: true });
  }

  // Crear o actualizar enlaces simbolicos para los modulos requeridos de Playwright
  const modulesToLink = ['@playwright', 'playwright', 'playwright-core'];
  for (const mod of modulesToLink) {
    const src = path.join(playwrightCachePath, mod);
    const dest = path.join(targetNodeModules, mod);
    
    // Si ya existe algo en la ruta destino, lo eliminamos recursivamente
    let exists = false;
    try {
      fs.lstatSync(dest);
      exists = true;
    } catch (e) {
      // No existe
    }

    if (exists) {
      try {
        fs.rmSync(dest, { recursive: true, force: true });
        console.log(`Destino anterior removido: ${dest}`);
      } catch (rmErr) {
        console.error(`Error al remover destino existente ${dest}:`, rmErr);
      }
    }
    
    if (fs.existsSync(src)) {
      try {
        fs.symlinkSync(src, dest, 'dir');
        console.log(`Enlace simbolico creado con exito: ${dest} -> ${src}`);
      } catch (err) {
        console.error(`Error al crear enlace simbolico para ${mod}:`, err);
      }
    }
  }
}

/**
 * Configuracion de Playwright para pruebas E2E
 */
export default {
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
};
