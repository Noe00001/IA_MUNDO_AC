# Prompt detallado y guía para construir `mundos-ia`

Este documento permite que otra persona recree el proyecto desde cero y entienda sus partes. Incluye un prompt reutilizable y una guía de implementación paso a paso. El proyecto utiliza exclusivamente **Groq para texto** y **Pollinations para imágenes**.

> **Seguridad:** nunca pegues una clave real en este documento, en un prompt, en una captura, en el código ni en Git. La clave de Groq solo se guarda en el archivo local `.env`, que debe estar excluido por `.gitignore`.

## 1. Prompt reutilizable

Copia este prompt en un asistente de programación. No agregues claves secretas al texto:

```text
Actúa como instructor de Node.js para una persona principiante. Ayúdame a construir paso a paso un programa de consola llamado "mundos-ia". Explícame cada archivo antes de pasar al siguiente y usa español claro.

OBJETIVO
El programa recibe por argumentos de consola:
1. Una situación imaginaria.
2. La descripción de un mundo.
3. Cinco colores distintos.

Crea un objeto con id, situacion, mundo, colores y creadoEn, y guárdalo como JSON en data/mundo_<id>.json. El id debe ser determinista: calcula los primeros ocho caracteres del hash de object-hash sobre solo situacion, mundo y colores. No incluyas creadoEn en el hash para que la misma entrada conserve el mismo id.

Después, vuelve a leer ese JSON desde el archivo, solicita a Groq una descripción visual, guarda la respuesta en descripciones/mundo_<id>.txt, y usa el contenido de ese archivo para pedir una imagen a Pollinations. Guarda los bytes recibidos en imagenes/mundo_<id>.jpg.

TECNOLOGÍAS Y RESTRICCIONES
- Usa JavaScript y CommonJS con require/module.exports.
- Usa process.argv, fs, path, object-hash, async/await, try/catch y el fetch nativo de Node.
- Usa process.loadEnvFile para cargar .env en Node.js 20.12 o posterior.
- object-hash debe ser la única dependencia externa.
- No uses dotenv, axios, SDK de proveedores, readline, commander, yargs, frameworks ni bases de datos.
- El código debe usar exclusivamente Groq para texto y Pollinations para imágenes. No agregues proveedores alternativos.
- Construye todas las rutas a partir de la ubicación de los archivos fuente, no del directorio desde donde se ejecuta el comando.
- Mantén el código sencillo y usa comentarios numerados en español cuando ayuden a entender los pasos.

ARGUMENTOS, ID Y ARCHIVOS
- Deben llegar exactamente siete argumentos: situación, mundo y cinco colores.
- Recorta los espacios exteriores. Rechaza argumentos vacíos y colores repetidos sin distinguir mayúsculas de minúsculas.
- Muestra errores claros en español, un ejemplo de uso y termina con process.exitCode = 1.
- Crea carpetas con fs.mkdirSync(..., { recursive: true }).
- Escribe JSON legible con JSON.stringify(objeto, null, 2).
- Usa nombres de archivo deterministas: data/mundo_<id>.json, descripciones/mundo_<id>.txt e imagenes/mundo_<id>.jpg.

CONFIGURACIÓN SEGURA
- Lee GROQ_API_KEY y GROQ_MODEL desde .env. Usa como endpoint de Groq https://api.groq.com/openai/v1/chat/completions.
- Usa como endpoint base de Pollinations https://image.pollinations.ai/prompt/; puede configurarse con POLLINATIONS_IMAGE_URL.
- Pollinations se consume sin clave en este proyecto. No inventes una variable de clave para imágenes.
- .env.example solo contiene nombres y valores de ejemplo no secretos. .env debe estar en .gitignore.
- Nunca imprimas claves ni devuelvas claves en mensajes de error.

GROQ: DESCRIPCIÓN DE TEXTO
- Envía un POST compatible con el formato de chat completions de Groq: Content-Type application/json, Authorization Bearer con GROQ_API_KEY y un cuerpo JSON con model y messages.
- Usa GROQ_MODEL para el modelo y establece un valor predeterminado si está vacío.
- El mensaje del usuario contiene el JSON del mundo guardado y leído desde disco.
- El mensaje de sistema pide un solo párrafo en inglés de 80 a 120 palabras que describa una imagen (escena, elementos, iluminación, composición y estilo), mencione los cinco colores y no incluya título, markdown ni texto dentro de la imagen.
- Usa AbortSignal.timeout(30000), verifica response.ok y valida que choices[0].message.content no esté vacío.
- Si la descripción supera 1500 caracteres, recórtala y avisa al usuario.

POLLINATIONS: IMAGEN
- Haz un GET al endpoint base concatenado con encodeURIComponent(descripcion), agregando width=1024, height=1024 y nologo=true como parámetros.
- No envíes una clave ni un cuerpo JSON.
- Usa AbortSignal.timeout(60000), comprueba response.ok y verifica que content-type corresponda a una imagen.
- Lee el resultado como bytes con response.arrayBuffer() y Buffer.from(...). No interpretes esos bytes como texto ni como JSON.
- Rechaza una respuesta vacía. Guarda los bytes sin codificación de texto. Usa extensión .jpg solo si la respuesta es JPEG; adapta la extensión si el formato devuelto es otro.

REUTILIZACIÓN Y ERRORES
- Si ya existe el .txt, léelo y no vuelvas a llamar a Groq.
- Si ya existe la imagen, no vuelvas a llamar a Pollinations.
- Si falla un paso, conserva los archivos de los pasos anteriores para que una ejecución posterior pueda continuar sin repetir llamadas exitosas.
- Distingue al menos errores de autenticación de Groq (401/403), límite de uso (402/429), modelo o ruta no disponibles (404/410), conexión y timeout.
- No imprimas el cuerpo técnico de un error si puede filtrar datos privados; explica en español qué puede revisar la persona.

ESTRUCTURA
src/index.js   coordina el flujo y presenta mensajes de estado.
src/mundo.js   valida argumentos, genera id, construye, guarda y lee el JSON.
src/texto.js   consulta Groq y guarda la descripción.
src/imagen.js  consulta Pollinations y guarda los bytes de la imagen.
test/          pruebas locales que no llaman a los servicios.
README.md      explica requisitos, configuración, comando de uso y carpetas.
.env.example  muestra las variables requeridas sin claves reales.
.gitignore    excluye node_modules/, .env, data/, descripciones/ e imagenes/.

FORMA DE TRABAJO
1. Presenta la estructura y un plan breve.
2. Implementa un archivo a la vez y explica en pocas líneas qué responsabilidad tiene.
3. No uses paquetes ni servicios fuera de los indicados.
4. Verifica las validaciones con entradas válidas e inválidas.
5. Si faltan credenciales, prueba solo lo que no requiere red y explica qué falta; nunca simules una respuesta de API como si fuera real.
6. Termina con los comandos para instalar, configurar y ejecutar el programa, además de una lista de comprobación de seguridad.
```

## 2. Construcción paso a paso

### Paso 1: comprobar herramientas e inicializar el proyecto

Instala Node.js 20.12 o posterior, npm y Git. Desde la terminal crea el proyecto, inicializa Git/npm e instala `object-hash`, la única dependencia externa:

```powershell
mkdir mundos-ia
cd mundos-ia
git init
npm init -y
npm install object-hash
```

En `package.json`, establece `main` como `src/index.js`, usa CommonJS y crea los scripts:

```json
"scripts": {
  "start": "node src/index.js",
  "test": "node --test"
}
```

### Paso 2: preparar carpetas y variables privadas

Crea `src/`, `test/`, `data/`, `descripciones/` e `imagenes/`. Crea `.gitignore` con `node_modules/`, `.env`, `data/`, `descripciones/` e `imagenes/`.

Copia `.env.example` como `.env` y rellena únicamente `GROQ_API_KEY` con tu propia clave. `GROQ_MODEL` indica el modelo de Groq que esté habilitado en tu cuenta. `POLLINATIONS_IMAGE_URL` debe apuntar al endpoint de Pollinations. No se requiere clave de imagen en este proyecto.

### Paso 3: validar los argumentos

En `src/mundo.js`, obtiene los argumentos con `process.argv.slice(2)`. Verifica que sean exactamente siete. Recorta espacios exteriores y rechaza valores vacíos.

Compara los cinco colores en minúsculas para detectar duplicados aunque cambien las mayúsculas. Cuando una validación falla, informa en español cómo ejecutar el comando y usa `process.exitCode = 1`.

### Paso 4: crear el objeto y un id reproducible

Construye el objeto con `id`, `situacion`, `mundo`, `colores` y `creadoEn`. Calcula el id con `object-hash` sobre solo `{ situacion, mundo, colores }` y toma los primeros ocho caracteres del hash. Agrega la fecha ISO después del hash para que no cambie el id al repetir la misma entrada.

### Paso 5: guardar y volver a leer el JSON

Usa `path.join` con la ruta raíz derivada de `__dirname`; así el comando también funciona si se ejecuta desde otra carpeta. Crea `data/` si hace falta y guarda JSON legible con `JSON.stringify(mundo, null, 2)`.

Vuelve a leer el archivo con `fs.readFileSync` y `JSON.parse`. El contenido enviado a Groq debe proceder de este JSON leído.

### Paso 6: generar la descripción con Groq

En `src/texto.js`, lee `GROQ_API_KEY` y `GROQ_MODEL` desde `process.env`. El endpoint de chat completions es:

```text
https://api.groq.com/openai/v1/chat/completions
```

Envía el JSON leído en el mensaje `user` y las condiciones de la descripción en el mensaje `system`. La petición es `POST`, lleva `Content-Type: application/json` y `Authorization: Bearer <GROQ_API_KEY>`. Usa `AbortSignal.timeout(30000)`.

Comprueba `response.ok`, lee el texto en `choices[0].message.content` y rechaza respuestas vacías. Recorta a 1500 caracteres con un aviso si hace falta. Guarda la respuesta en `descripciones/mundo_<id>.txt`. Si ya existe, reutilízala sin llamar a Groq.

### Paso 7: generar la imagen con Pollinations

En `src/imagen.js`, lee el texto guardado y construye una solicitud GET al endpoint base:

```text
https://image.pollinations.ai/prompt/<descripción codificada>?width=1024&height=1024&nologo=true
```

Codifica la descripción con `encodeURIComponent`. No se envía API key ni cuerpo JSON. Usa `AbortSignal.timeout(60000)`, valida el estado HTTP y que `content-type` sea una imagen. Recupera los bytes con `Buffer.from(await response.arrayBuffer())` y guárdalos directamente; no uses codificación `utf8`.

Pollinations puede aplicar límites o cambiar su disponibilidad. Si la imagen ya existe, omite la llamada.

### Paso 8: coordinar los pasos y conservar resultados parciales

En `src/index.js`, carga `.env` usando `process.loadEnvFile` si está presente. Ejecuta las tareas en orden dentro de una función `async` y `try/catch`, e imprime mensajes en español para los pasos 1, 2 y 3.

Al fallar una llamada, conserva el JSON y cualquier descripción ya guardada. En la siguiente ejecución, detecta los archivos existentes y continúa sin repetir solicitudes exitosas.

### Paso 9: probar y documentar

Crea pruebas con el módulo integrado `node:test` para validar cantidad de argumentos, espacios, colores repetidos y estabilidad del id. No llames a los proveedores en las pruebas unitarias, porque las solicitudes consumen cuotas y requieren conexión.

Ejecuta:

```powershell
npm install
npm test
npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aérpolis, un archipiélago de islas que flotan sobre las nubes" "rojo" "azul" "verde" "dorado" "violeta"
```

Documenta en `README.md` los requisitos, variables `.env`, comando, estructura, manejo de errores y los proveedores elegidos.

## 3. Responsabilidad de cada archivo

| Archivo | Responsabilidad |
|---|---|
| `src/index.js` | Carga configuración y coordina las etapas de JSON, texto e imagen. |
| `src/mundo.js` | Valida entradas, crea un id, guarda y vuelve a leer el JSON. |
| `src/texto.js` | Consulta Groq y guarda o valida la descripción. |
| `src/imagen.js` | Consulta Pollinations y guarda la respuesta como bytes. |
| `test/mundo.test.js` | Comprueba validaciones e id sin hacer llamadas de red. |
| `.env` | Clave privada de Groq y opciones locales; no se versiona. |
| `.env.example` | Plantilla pública sin claves reales. |
| `README.md` | Instrucciones de instalación, configuración y uso. |

## 4. Lista antes de entregar

- [ ] `.env` está en `.gitignore` y no aparece en `git ls-files`.
- [ ] No hay claves en código, commits, capturas, README ni `PROMPT.md`.
- [ ] `.env.example` solo tiene una clave de ejemplo claramente ficticia.
- [ ] Solo se usan Groq para texto y Pollinations para imagen.
- [ ] Se comprueban `response.ok`, respuestas vacías y errores de timeout.
- [ ] Repetir el comando reutiliza los archivos existentes.
- [ ] Si falla la imagen, se conservan el JSON y la descripción.
- [ ] La imagen guardada se abre correctamente.
