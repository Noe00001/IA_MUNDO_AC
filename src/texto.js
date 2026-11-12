const fs = require('node:fs');
const path = require('node:path');

const { DESCRIPCIONES_DIR } = require('./mundo');

// Paso 1: Construir el mensaje de sistema pidiendo un párrafo en inglés (80-120 palabras) con los 5 colores
function buildSystemMessage() {
  return [
    'Eres un asistente experto en arte visual y mundos imaginarios.',
    'Escribe un único párrafo en inglés de entre 80 y 120 palabras.',
    'Describe una imagen, incluyendo escena, elementos, iluminación, composición y estilo artístico; no escribas una historia.',
    'Menciona explícitamente los cinco colores del mundo en inglés.',
    'No incluyas título, formato markdown ni texto escrito dentro de la imagen.',
  ].join(' ');
}

// Paso 2: Traducir los códigos de estado HTTP de Groq a mensajes claros en español
function buildApiError(status) {
  if (status === 401 || status === 403) {
    return 'La clave de Groq no es válida o no tiene permisos. Revisa GROQ_API_KEY en .env.';
  }
  if (status === 402 || status === 429) {
    return 'Se alcanzó el límite de uso de Groq. Espera antes de volver a intentarlo.';
  }
  if (status === 404 || status === 410) {
    return 'El modelo de Groq no está disponible. Revisa GROQ_MODEL.';
  }
  return `Groq devolvió un error HTTP ${status}. Revisa la configuración y vuelve a intentarlo.`;
}

// Paso 3: Consultar la API de Groq enviando el JSON leído desde disco
async function describirMundo(mundo) {
  const { GROQ_API_KEY, GROQ_MODEL } = process.env;

  // Paso 3.1: Verificar que exista la clave de API antes de llamar a la red
  if (!GROQ_API_KEY) {
    throw new Error('Falta GROQ_API_KEY en el archivo .env.');
  }

  // Paso 3.2: Enviar la petición POST con cabeceras, cuerpo JSON y timeout de 30 segundos
  let response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL || 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: buildSystemMessage() },
          { role: 'user', content: JSON.stringify(mundo) },
        ],
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('Groq tardó demasiado en responder. Inténtalo nuevamente.');
    }
    if (error.name === 'TypeError') {
      throw new Error('No se pudo conectar con Groq. Revisa tu conexión a internet.');
    }
    throw error;
  }

  // Paso 3.3: Comprobar el estado HTTP de la respuesta
  if (!response.ok) {
    throw new Error(buildApiError(response.status));
  }

  // Paso 3.4: Interpretar el JSON devuelto y validar que el contenido de texto no esté vacío
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Groq respondió con un formato que no se pudo interpretar.');
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('La respuesta de Groq no contiene una descripción.');
  }

  // Paso 3.5: Verificar la longitud de la descripción y recortar si supera 1500 caracteres
  const description = content.trim();
  if (description.length > 1500) {
    console.warn('Aviso: la descripción superó 1500 caracteres y se recortó.');
    return description.slice(0, 1500);
  }

  return description;
}

// Paso 4: Guardar la descripción generada en descripciones/mundo_<id>.txt
function saveDescripcion(id, texto) {
  fs.mkdirSync(DESCRIPCIONES_DIR, { recursive: true });
  const filePath = path.join(DESCRIPCIONES_DIR, `mundo_${id}.txt`);
  fs.writeFileSync(filePath, texto, 'utf8');
  return filePath;
}

module.exports = {
  describirMundo,
  saveDescripcion,
  buildSystemMessage,
};
