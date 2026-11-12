const fs = require('node:fs');
const path = require('node:path');

const { IMAGENES_DIR } = require('./mundo');

function buildApiError(status) {
  if (status === 402 || status === 429) {
    return 'Pollinations alcanzó el límite gratuito. Espera antes de volver a intentarlo.';
  }
  if (status === 404 || status === 410) {
    return 'La ruta de generación de imágenes de Pollinations no está disponible.';
  }
  return `Pollinations devolvió un error HTTP ${status}. Inténtalo nuevamente más tarde.`;
}

async function generarImagen(descripcion) {
  const imageBaseUrl = (process.env.POLLINATIONS_IMAGE_URL || 'https://image.pollinations.ai/prompt')
    .replace(/\/+$/, '');
  const imageUrl = new URL(`${imageBaseUrl}/${encodeURIComponent(descripcion)}`);
  imageUrl.searchParams.set('width', '1024');
  imageUrl.searchParams.set('height', '1024');
  imageUrl.searchParams.set('nologo', 'true');

  let response;
  try {
    response = await fetch(imageUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(60000),
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('Pollinations tardó demasiado en generar la imagen. Inténtalo nuevamente.');
    }
    if (error.name === 'TypeError') {
      throw new Error('No se pudo conectar con Pollinations. Revisa tu conexión a internet.');
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(buildApiError(response.status));
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new Error('Pollinations no devolvió una imagen. Comprueba el servicio y vuelve a intentarlo.');
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) {
    throw new Error('Pollinations devolvió una imagen vacía.');
  }

  return bytes;
}

function saveImagen(id, bytes) {
  fs.mkdirSync(IMAGENES_DIR, { recursive: true });
  const filePath = path.join(IMAGENES_DIR, `mundo_${id}.jpg`);
  fs.writeFileSync(filePath, bytes);
  return filePath;
}

module.exports = {
  generarImagen,
  saveImagen,
};
