const fs = require('node:fs');
const path = require('node:path');
const objectHash = require('object-hash');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DESCRIPCIONES_DIR = path.join(ROOT_DIR, 'descripciones');
const IMAGENES_DIR = path.join(ROOT_DIR, 'imagenes');

function ensureDirectories() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(DESCRIPCIONES_DIR, { recursive: true });
  fs.mkdirSync(IMAGENES_DIR, { recursive: true });
}

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

function validateArgs(argv) {
  const args = argv.slice(2).map(normalizeValue);

  if (args.length !== 7) {
    throw new Error('Deben llegar exactamente 7 argumentos: <situación> <mundo> <color1> <color2> <color3> <color4> <color5>.');
  }

  const [situacion, mundo, ...coloresRaw] = args;
  const colores = coloresRaw;

  if ([situacion, mundo, ...colores].some((value) => !value)) {
    throw new Error('Ningún argumento puede estar vacío ni contener solo espacios.');
  }

  const distintos = new Set(colores.map((color) => color.toLowerCase()));
  if (distintos.size !== 5) {
    throw new Error('Los 5 colores deben ser distintos (sin distinguir mayúsculas de minúsculas).');
  }

  return {
    situacion,
    mundo,
    colores,
  };
}

function createWorldId({ situacion, mundo, colores }) {
  const payload = { situacion, mundo, colores };
  const hash = objectHash(payload, { algorithm: 'md5', encoding: 'hex' });
  return hash.slice(0, 8);
}

function createWorldObject({ situacion, mundo, colores }) {
  const id = createWorldId({ situacion, mundo, colores });

  return {
    id,
    situacion,
    mundo,
    colores,
    creadoEn: new Date().toISOString(),
  };
}

function saveWorldJson(world) {
  ensureDirectories();
  const filePath = path.join(DATA_DIR, `mundo_${world.id}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(world, null, 2)}\n`, 'utf8');
  return filePath;
}

function readWorldJson(id) {
  const filePath = path.join(DATA_DIR, `mundo_${id}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = {
  ROOT_DIR,
  DATA_DIR,
  DESCRIPCIONES_DIR,
  IMAGENES_DIR,
  ensureDirectories,
  validateArgs,
  createWorldObject,
  saveWorldJson,
  readWorldJson,
};
