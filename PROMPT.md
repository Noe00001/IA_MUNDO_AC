# Parte 7 — `PROMPT.md`: Cómo construí el programa `mundos-ia`

**Autora:** Salome Lopez Estrada (`Noe0001` en Git/GitHub)

---

## A. Declaración

**Usé IA: sí**

---

## B. Herramienta y modelo utilizados

- **Herramienta:** Google Antigravity IDE (asistente de programación agéntico integrado en el editor).
- **Modelo:** Gemini (configuración **Gemini 4 Argon (High)**).
- **APIs de IA consumidas por el propio programa:**
  - **Groq API** (`openai/gpt-oss-20b` vía `https://api.groq.com/openai/v1/chat/completions`) para generar las descripciones visuales.
  - **Pollinations API** (`https://image.pollinations.ai/prompt`) para generar las imágenes a partir del texto.

---

## C. El prompt inicial completo (copiado literal, sin resumir)

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

---

## D. Los prompts siguientes más importantes, qué respondió la IA y qué hice con esa respuesta

### 1. Primer prompt de seguimiento
- **Prompt enviado:**
  > `"Usa el proyecto que acabamos de crear y genera una imagen"`
- **Qué respondió la IA:**
  Revisó la estructura del proyecto y ejecutó el comando `npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aérpolis, un archipiélago de islas que flotan sobre las nubes" "rojo" "azul" "verde" "dorado" "violeta"`. Me informó que el **Paso 1** se completó guardando `data/mundo_a4777339.json`, pero que el **Paso 2** se detuvo con `Error: Falta GROQ_API_KEY en el archivo .env.` porque aún no existía el archivo `.env`.
- **Qué hice con esa respuesta:**
  Conseguí mi clave de API de Groq y le pedí crear el archivo `.env` con las variables `GROQ_API_KEY`, `GROQ_MODEL=openai/gpt-oss-20b` y `POLLINATIONS_IMAGE_URL=https://image.pollinations.ai/prompt`.

### 2. Segundo prompt de seguimiento
- **Prompt enviado:**
  > `"Ahora ayudame con las imagenes que puede generar usando GROQ y Pollinations, guarda las imagenes en la carpeta de imagenes y descripciones en la caparte de descripciones"`
- **Qué respondió la IA:**
  Ejecutó el proyecto para los dos mundos (`mundo_6c0eec56` y `mundo_a4777339`). Con Groq generó las descripciones en inglés en `descripciones/mundo_6c0eec56.txt` y `descripciones/mundo_a4777339.txt`. Al consultar Pollinations, detectó que el servicio gratuito devolvía temporalmente errores `HTTP 503` y `402/429`, por lo que reintentó la generación aprovechando los archivos guardados hasta descargar y guardar ambas imágenes en `imagenes/mundo_6c0eec56.jpg` (58.8 KB) e `imagenes/mundo_a4777339.jpg` (75.0 KB).
- **Qué hice con esa respuesta:**
  Revisé las carpetas `data/`, `descripciones/` e `imagenes/` y abrí ambas imágenes `.jpg` para comprobar que se habían guardado como archivos binarios válidos y que correspondían a las descripciones de Aérpolis.

### 3. Tercer prompt de seguimiento
- **Prompt enviado:**
  > `"Crea otro commit donde se aprecien las imagenes generadas y las descripciones"` y posteriormente `"Subelo a Github"`
- **Qué respondió la IA:**
  Observó que `.gitignore` estaba ignorando `data/`, `descripciones/` e `imagenes/`, por lo que actualizó `.gitignore` (manteniendo ocultos `.env` y `node_modules/`), agregó los archivos generados al área de preparación (`git add`), creó el commit `feat: add generated world descriptions and images` y ejecutó `git push` hacia la rama `main` de mi repositorio en GitHub.
- **Qué hice con esa respuesta:**
  Verifiqué en mi repositorio de GitHub (`https://github.com/Noe00001/IA_MUNDO_AC`) que las carpetas `data/`, `descripciones/` e `imagenes/` fueran visibles y que el archivo `.env` no se hubiera subido.

### 4. Cuarto prompt de seguimiento
- **Prompt enviado:**
  > `"Cambia el readme y hazlo de nuevo cambiando la informacion dentro, Autor, Salome Lopez Estrada en git como Noe0001, explica como usar el proyecto y lo que deberia tener un readme, Si use IA — Parte 7 — PROMPT.md: cuéntanos cómo construiste el programa..."`
- **Qué respondió la IA:**
  Reescribió `README.md` incluyendo mi autoría (`Salome Lopez Estrada`, usuario `Noe0001`), guía paso a paso, galería de imágenes generadas y tabla de estructura, y actualizó `PROMPT.md` con las secciones A a la G completas.
- **Qué hice con esa respuesta:**
  Revisé ambos archivos Markdown antes de realizar el commit final de documentación.

---

## E. Tres cambios que hice sobre lo que entregó la IA y por qué

1. **Modificación de `.gitignore` para publicar las descripciones e imágenes generadas:**
   - **Cambio:** Quité las líneas `data/`, `descripciones/` e `imagenes/` de `.gitignore`, dejando únicamente `node_modules/`, `.env` y `.DS_Store`.
   - **Por qué:** La versión inicial de la IA ignoraba las carpetas de salida, pero para la entrega necesitaba que en el repositorio de GitHub se pudieran apreciar tanto las descripciones `.txt` generadas con Groq como las imágenes `.jpg` generadas con Pollinations, sin exponer jamás el archivo `.env`.

2. **Regeneración de la descripción de `mundo_a4777339` cuando Pollinations bloqueaba la solicitud:**
   - **Cambio:** Se eliminó la primera versión en caché de `descripciones/mundo_a4777339.txt` para que Groq redactara una variación nueva del párrafo descriptivo antes de volver a llamar a Pollinations.
   - **Por qué:** Como Pollinations asocia la URL exacta del prompt en su caché interna, el texto original seguía devolviendo `HTTP 503` aunque el servidor ya estuviera activo para otros mundos (`mundo_6c0eec56`). Con la nueva descripción de Groq, Pollinations generó `imagenes/mundo_a4777339.jpg` al primer intento.

3. **Reestructuración de `README.md` y `PROMPT.md` con datos de autoría y formato de entrega (Parte 7):**
   - **Cambio:** Reemplacé el `README.md` genérico y el `PROMPT.md` anterior (que solo tenía instrucciones teóricas) por un `README.md` completo con mi nombre (**Salome Lopez Estrada**, GitHub **Noe0001**), ejemplos reales con vista previa de las imágenes generadas, y este `PROMPT.md` estructurado exactamente en los apartados **A, B, C, D, E, F y G**.
   - **Por qué:** El documento inicial que había generado la IA no incluía mi información de autora ni respondía directamente a las preguntas reflexivas exigidas en la Parte 7 de la actividad.

---

## F. Una línea de código que no entendía al principio, explicada con mis palabras

En `src/imagen.js` (línea 49):

```javascript
const bytes = Buffer.from(await response.arrayBuffer());
```

**Explicación con mis palabras:**
Al principio estaba acostumbrada a usar `await response.json()` o `await response.text()` cuando hacía peticiones con `fetch`. Sin embargo, una imagen JPEG no es texto sino una secuencia de bytes binarios: si intentamos leerla como texto UTF-8, los datos se corrompen y el archivo `.jpg` no se puede abrir.
Lo que hace esta línea es:
1. `await response.arrayBuffer()` espera a que termine de descargarse el cuerpo de la respuesta de Pollinations y lo entrega como un bloque de memoria binaria cruda (`ArrayBuffer`).
2. `Buffer.from(...)` convierte ese bloque de memoria en un objeto `Buffer` de Node.js, que es el formato que necesita `fs.writeFileSync(filePath, bytes)` para guardar los bytes exactos de la imagen en el disco duro sin alterar ningún byte.

---

## G. Un error ocurrido durante el desarrollo: mensaje y solución

### Error 1: Falta de configuración inicial de `.env`
- **Mensaje de error en consola:**
  ```text
  Paso 1: mundo guardado en data/mundo_a4777339.json
  Error: Falta GROQ_API_KEY en el archivo .env.
  ```
- **Cómo lo resolví:**
  El programa únicamente tenía la plantilla `.env.example`, pero `src/index.js` busca el archivo `.env` mediante `process.loadEnvFile(envPath)` y `src/texto.js` valida que `process.env.GROQ_API_KEY` exista antes de hacer la petición HTTP. Lo resolví creando el archivo `.env` en la raíz del proyecto con mi clave real de Groq (`GROQ_API_KEY`), el modelo (`GROQ_MODEL=openai/gpt-oss-20b`) y la URL de Pollinations (`POLLINATIONS_IMAGE_URL=https://image.pollinations.ai/prompt`).

### Error 2: Saturación temporal en Pollinations (`HTTP 503` y límite gratuito)
- **Mensaje de error en consola:**
  ```text
  Paso 1: mundo guardado en data/mundo_a4777339.json
  Paso 2: descripción guardada en descripciones/mundo_a4777339.txt
  Error: Pollinations devolvió un error HTTP 503. Inténtalo nuevamente más tarde.
  ```
- **Cómo lo resolví:**
  El endpoint gratuito de Pollinations (`https://image.pollinations.ai/prompt/...`) aplica límites de tráfico y en horas de alta demanda devuelve `503` o `402/429`. Gracias a que `src/index.js` verifica con `fs.existsSync` si los archivos de pasos anteriores ya existen, no se perdió el JSON guardado en `data/` y pude reintentar la ejecución y regenerar la descripción de `mundo_a4777339` hasta que Pollinations respondió con `200 OK` (`content-type: image/jpeg`) y se guardaron correctamente `imagenes/mundo_6c0eec56.jpg` e `imagenes/mundo_a4777339.jpg`.

---

## H. Preguntas de reflexión

1. **¿Por qué el `id` se calcula sin la fecha? ¿Qué pasaría si la incluyeras?**  
   El `id` se calcula solo con `situacion`, `mundo` y `colores` para que sea **determinista**: los mismos datos de entrada siempre producen el mismo identificador. Si incluyéramos `creadoEn` (`new Date().toISOString()`), el hash cambiaría en cada milisegundo y cada ejecución generaría un `id` distinto, haciendo imposible detectar y reutilizar los archivos ya guardados en caché.

2. **¿Por qué se le pide al modelo de texto la descripción en inglés? Si puedes, prueba con una en español y compara las imágenes.**  
   Los modelos de difusión de imágenes (como los que usa Pollinations) fueron entrenados mayoritariamente con bancos de imágenes etiquetados en inglés, por lo que entienden con mucha mayor precisión estilos artísticos, iluminación y composición en ese idioma. Al probar prompts en español, el generador suele omitir detalles secundarios o interpretar de forma más literal y menos detallada algunos elementos visuales.

3. **¿Qué diferencia hay entre una respuesta JSON de texto y una respuesta con los bytes de una imagen? ¿Qué es `base64`?**  
   Una respuesta JSON es texto estructurado legible por humanos (codificado en UTF-8) que representa pares clave-valor, mientras que la respuesta de una imagen contiene bytes binarios crudos (`image/jpeg`) que representan píxeles comprimidos. `Base64` es un esquema de codificación que traduce datos binarios a caracteres de texto ASCII seguros para poder transportar imágenes dentro de un JSON o texto plano, aunque aumenta su tamaño en aproximadamente un 33%.

4. **¿Qué pasaría si guardas la imagen con `'utf-8'`? ¿Por qué?**  
   El archivo `.jpg` se corrompería y ningún visor de imágenes podría abrirlo. Esto ocurre porque `utf-8` intenta interpretar cada secuencia de bytes como caracteres de texto y reemplaza cualquier byte que no coincida con un carácter válido por el símbolo de reemplazo Unicode (`U+FFFD`), alterando irreversiblemente la cabecera y los datos binarios del JPEG.

5. **¿Qué pasos consumen cuota gratuita y cómo evitaste repetirlos?**  
   Consumen cuota el **Paso 2** (la petición `POST` a la API de Groq para generar la descripción) y el **Paso 3** (la petición `GET` a Pollinations para generar la imagen). Evité repetirlos calculando primero el `id` determinista y comprobando con `fs.existsSync` si `descripciones/mundo_<id>.txt` e `imagenes/mundo_<id>.jpg` ya existen en disco antes de hacer cualquier llamada a la red.

6. **Si usaste IA: ¿qué fue lo más difícil de pedirle y qué parte tuviste que corregir tú?**  
   Hacer exactamente lo que quisiera de forma detallada donde la IA no usara las herramientas que no conocía, y donde siguiera paso a paso lo que decía en el Prompt con base en lo leído en las especificaciones de MRD2. Como con NVIDIA no generaba imágenes de forma eficiente, lo cambié por **Groq** y **Pollinations**.

