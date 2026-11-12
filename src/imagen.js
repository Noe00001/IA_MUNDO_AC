const fs = require('node:fs');
const path = require('node:path');

const { IMAGENES_DIR } = require('./mundo');

// Paso 1: Traducir los códigos de estado HTTP de Pollinations a mensajes claros en español
function buildApiError(status) {
  if (status === 402 || status === 429) {
    return 'Pollinations alcanzó el límite gratuito. Espera antes de volver a intentarlo.';
  }
  if (status === 404 || status === 410) {
    return 'La ruta de generación de imágenes de Pollinations no está disponible.';
  }
  return `Pollinations devolvió un error HTTP ${status}. Inténtalo nuevamente más tarde.`;
}

// Paso 2: Solicitar la imagen a Pollinations a partir de la descripción en texto
async function generarImagen(descripcion) {
  // Paso 2.1: Construir la URL codificando la descripción y agregando parámetros de tamaño
  const imageBaseUrl = (process.env.POLLINATIONS_IMAGE_URL || 'https://image.pollinations.ai/prompt')
    .replace(/\/+$/, '');
  const imageUrl = new URL(`${imageBaseUrl}/${encodeURIComponent(descripcion)}`);
  imageUrl.searchParams.set('width', '1024');
  imageUrl.searchParams.set('height', '1024');
  imageUrl.searchParams.set('nologo', 'true');

  // Paso 2.2: Realizar la petición GET con un timeout de 60 segundos
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

  // Paso 2.3: Validar que la respuesta HTTP sea exitosa (response.ok)
  if (!response.ok) {
    throw new Error(buildApiError(response.status));
  }

  // Paso 2.4: Comprobar que la cabecera content-type corresponda a una imagen
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new Error('Pollinations no devolvió una imagen. Comprueba el servicio y vuelve a intentarlo.');
  }

  // Paso 2.5: Convertir el cuerpo de la respuesta a bytes binarios (Buffer) y verificar que no esté vacío
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) {
    throw new Error('Pollinations devolvió una imagen vacía.');
  }

  return bytes;
}

// Paso 3: Guardar los bytes binarios directamente en imagenes/mundo_<id>.jpg sin codificación de texto
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
