const fs = require('node:fs');
const path = require('node:path');

const {
  ROOT_DIR,
  DATA_DIR,
  DESCRIPCIONES_DIR,
  IMAGENES_DIR,
  ensureDirectories,
  validateArgs,
  createWorldObject,
  saveWorldJson,
  readWorldJson,
} = require('./mundo');
const { describirMundo, saveDescripcion } = require('./texto');
const { generarImagen, saveImagen } = require('./imagen');

const envPath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

function displayPath(filePath) {
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
}

async function main() {
  try {
    ensureDirectories();
    const validated = validateArgs(process.argv);
    const world = createWorldObject(validated);
    const jsonPath = saveWorldJson(world);
    console.log(`Paso 1: mundo guardado en ${displayPath(jsonPath)}`);

    const descriptionPath = path.join(DESCRIPCIONES_DIR, `mundo_${world.id}.txt`);
    const imagePath = path.join(IMAGENES_DIR, `mundo_${world.id}.jpg`);

    if (fs.existsSync(descriptionPath)) {
      console.log(`Paso 2: descripción ya existe en ${displayPath(descriptionPath)}.`);
    } else {
      const savedWorld = readWorldJson(world.id);
      const description = await describirMundo(savedWorld);
      saveDescripcion(world.id, description);
      console.log(`Paso 2: descripción guardada en ${displayPath(descriptionPath)}`);
    }

    if (fs.existsSync(imagePath)) {
      console.log(`Paso 3: imagen ya existe en ${displayPath(imagePath)}.`);
    } else {
      const description = fs.readFileSync(descriptionPath, 'utf8');
      const imageBytes = await generarImagen(description);
      saveImagen(world.id, imageBytes);
      console.log(`Paso 3: imagen guardada en ${displayPath(imagePath)}`);
    }

    console.log('Listo. Revisa la carpeta imagenes/.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
