const fs = require('node:fs');
const path = require('node:path');

const {
  ROOT_DIR,
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

// Paso 1: Cargar las variables de entorno desde el archivo .env si existe
const envPath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

// Paso 2: Formatear rutas relativas para mostrarlas limpias en la consola
function displayPath(filePath) {
  return path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
}

// Paso 3: Orquestar el flujo completo (JSON -> descripción con Groq -> imagen con Pollinations)
async function main() {
  try {
    // Paso 3.1: Asegurar carpetas, validar argumentos, crear objeto y guardar el JSON
    ensureDirectories();
    const validated = validateArgs(process.argv);
    const world = createWorldObject(validated);
    const jsonPath = saveWorldJson(world);
    console.log(`Paso 1: mundo guardado en ${displayPath(jsonPath)}`);

    const descriptionPath = path.join(DESCRIPCIONES_DIR, `mundo_${world.id}.txt`);
    const imagePath = path.join(IMAGENES_DIR, `mundo_${world.id}.jpg`);

    // Paso 3.2: Reutilizar la descripción si ya existe; si no, leer el JSON y consultar a Groq
    if (fs.existsSync(descriptionPath)) {
      console.log(`Paso 2: descripción ya existe en ${displayPath(descriptionPath)}.`);
    } else {
      const savedWorld = readWorldJson(world.id);
      const description = await describirMundo(savedWorld);
      saveDescripcion(world.id, description);
      console.log(`Paso 2: descripción guardada en ${displayPath(descriptionPath)}`);
    }

    // Paso 3.3: Reutilizar la imagen si ya existe; si no, leer el .txt y consultar a Pollinations
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
    // Paso 3.4: Mostrar el error en español y terminar con código de salida 1
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
