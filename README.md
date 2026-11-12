# 🌍 MUNDO-IA — Generador de Mundos Imaginarios con IA

Aplicación de consola en **Node.js** que recibe una situación, la descripción de un mundo imaginario y cinco colores distintos; almacena el mundo en formato JSON con un identificador determinista, genera una descripción artística en inglés consultando la API de **Groq** y crea una ilustración a partir de esa descripción utilizando **Pollinations**.

---

## 👩‍💻 Autora

- **Nombre:** Salome Lopez Estrada
- **Usuario en Git / GitHub:** [Noe0001](https://github.com/Noe00001)
- **Repositorio:** [IA_MUNDO_AC](https://github.com/Noe00001/IA_MUNDO_AC)
- **Declaración de uso de IA:** Sí usé IA (ver detalle completo del proceso en [`PROMPT.md`](./PROMPT.md)).

---

## ✨ Características principales

1. **Validación estricta de entrada:** Verifica que se reciban exactamente 7 argumentos (1 situación, 1 mundo y 5 colores distintos sin importar mayúsculas/minúsculas ni espacios exteriores), mostrando un mensaje en español y un ejemplo de uso si falla.
2. **ID determinista con `object-hash`:** Calcula un identificador único de 8 caracteres a partir de `{ situacion, mundo, colores }` (sin incluir la fecha `creadoEn`), garantizando que los mismos datos produzcan siempre el mismo ID.
3. **Persistencia y caché por etapas:**
   - **Paso 1 (`data/`):** Guarda y vuelve a leer `data/mundo_<id>.json`.
   - **Paso 2 (`descripciones/`):** Solicita a **Groq** un párrafo visual de 80 a 120 palabras en inglés que integra los 5 colores y lo guarda en `descripciones/mundo_<id>.txt`.
   - **Paso 3 (`imagenes/`):** Solicita a **Pollinations** una imagen de `1024x1024` a partir de la descripción y guarda los bytes directamente en `imagenes/mundo_<id>.jpg`.
4. **Reutilización inteligente y ahorro de cuota:** Si un archivo de descripción o imagen ya existe para ese ID, el programa lo reutiliza sin repetir llamadas a la red ni gastar cuota adicional.

---

## 📋 Requisitos previos

- **Node.js 20.12 o superior** (utiliza `process.loadEnvFile` y `fetch` nativo).
- **npm** (incluido con Node.js).
- Una clave de API activa de **Groq** (`GROQ_API_KEY`).
- Conexión a Internet para las peticiones a Groq y Pollinations.

---

## 🚀 Instalación y configuración

1. **Clonar el repositorio y entrar a la carpeta del proyecto:**

   ```powershell
   git clone https://github.com/Noe00001/IA_MUNDO_AC.git
   cd MUNDO-IA
   ```

2. **Instalar las dependencias** (`object-hash` es la única dependencia externa):

   ```powershell
   npm install
   ```

3. **Configurar las variables de entorno:**

   Copia el archivo de plantilla `.env.example` a `.env`:

   ```powershell
   Copy-Item .env.example .env
   ```

   Edita el archivo `.env` y coloca tu clave real de Groq:

   ```dotenv
   GROQ_API_KEY=tu_clave_real_de_groq
   GROQ_MODEL=openai/gpt-oss-20b
   POLLINATIONS_IMAGE_URL=https://image.pollinations.ai/prompt
   ```

   > ⚠️ **Nota de seguridad:** El archivo `.env` está excluido en `.gitignore`. Nunca subas tu clave real al repositorio.

---

## 💻 Cómo usar el proyecto

Ejecuta el programa con `npm start --` seguido de los **7 argumentos entre comillas**:

```text
npm start -- "<situación>" "<mundo>" "<color1>" "<color2>" "<color3>" "<color4>" "<color5>"
```

### Ejemplo 1: Mundo flotante Aérpolis

```powershell
npm start -- "Una tormenta" "Aérpolis" "rojo" "azul" "verde" "dorado" "violeta"
```

**Salida:**

```text
Paso 1: mundo guardado en data/mundo_6c0eec56.json
Paso 2: descripción guardada en descripciones/mundo_6c0eec56.txt
Paso 3: imagen guardada en imagenes/mundo_6c0eec56.jpg
Listo. Revisa la carpeta imagenes/.
```

### Ejemplo 2: Reino submarino Nereida

```powershell
npm start -- "Un eclipse solar despierta a los guardianes de cristal" "Nereida, una ciudad submarina de arrecifes bioluminiscentes" "turquesa" "coral" "plata" "ámbar" "índigo"
```

**Salida:**

```text
Paso 1: mundo guardado en data/mundo_9ac1c2b8.json
Paso 2: descripción guardada en descripciones/mundo_9ac1c2b8.txt
Paso 3: imagen guardada en imagenes/mundo_9ac1c2b8.jpg
Listo. Revisa la carpeta imagenes/.
```

### Ejemplo de reutilización de caché (ahorro de cuota al repetir comando)

Al ejecutar por segunda vez el mismo comando, el programa detecta los archivos existentes y no vuelve a llamar a las APIs:

```text
Paso 1: mundo guardado en data/mundo_6c0eec56.json
Paso 2: descripción ya existe en descripciones/mundo_6c0eec56.txt.
Paso 3: imagen ya existe en imagenes/mundo_6c0eec56.jpg.
Listo. Revisa la carpeta imagenes/.
```

---

## 🖼️ Evidencia de mundos generados incluidos en el repositorio

| ID | Mundo y situación | Colores | Archivos generados | Vista previa |
|---|---|---|---|---|
| `6c0eec56` | **Aérpolis** — *"Una tormenta"* | `rojo`, `azul`, `verde`, `dorado`, `violeta` | [`data/mundo_6c0eec56.json`](./data/mundo_6c0eec56.json)<br>[`descripciones/mundo_6c0eec56.txt`](./descripciones/mundo_6c0eec56.txt)<br>[`imagenes/mundo_6c0eec56.jpg`](./imagenes/mundo_6c0eec56.jpg) | ![Mundo 6c0eec56](./imagenes/mundo_6c0eec56.jpg) |
| `9ac1c2b8` | **Nereida, ciudad submarina** — *"Un eclipse solar despierta a los guardianes de cristal"* | `turquesa`, `coral`, `plata`, `ámbar`, `índigo` | [`data/mundo_9ac1c2b8.json`](./data/mundo_9ac1c2b8.json)<br>[`descripciones/mundo_9ac1c2b8.txt`](./descripciones/mundo_9ac1c2b8.txt)<br>[`imagenes/mundo_9ac1c2b8.jpg`](./imagenes/mundo_9ac1c2b8.jpg) | ![Mundo 9ac1c2b8](./imagenes/mundo_9ac1c2b8.jpg) |
| `a4777339` | **Aérpolis, archipiélago flotante** — *"Una tormenta eléctrica amenaza la ciudad flotante"* | `rojo`, `azul`, `verde`, `dorado`, `violeta` | [`data/mundo_a4777339.json`](./data/mundo_a4777339.json)<br>[`descripciones/mundo_a4777339.txt`](./descripciones/mundo_a4777339.txt)<br>[`imagenes/mundo_a4777339.jpg`](./imagenes/mundo_a4777339.jpg) | ![Mundo a4777339](./imagenes/mundo_a4777339.jpg) |

---

## 📂 Estructura del proyecto

```text
MUNDO-IA/
├── data/                      # Archivos JSON con los datos de entrada y el ID del mundo
│   ├── mundo_6c0eec56.json
│   ├── mundo_9ac1c2b8.json
│   └── mundo_a4777339.json
├── descripciones/             # Descripciones visuales en inglés (80-120 palabras) con Groq
│   ├── mundo_6c0eec56.txt
│   ├── mundo_9ac1c2b8.txt
│   └── mundo_a4777339.txt
├── imagenes/                  # Imágenes JPEG (1024x1024) generadas con Pollinations
│   ├── mundo_6c0eec56.jpg
│   ├── mundo_9ac1c2b8.jpg
│   └── mundo_a4777339.jpg
├── src/
│   ├── index.js               # Módulo orquestador: coordina los 3 pasos y la caché en disco
│   ├── mundo.js               # Validación de los 7 argumentos, hash determinista y lectura/escritura JSON
│   ├── texto.js               # Petición POST a Groq y guardado de la descripción
│   └── imagen.js              # Petición GET a Pollinations y guardado binario de la imagen
├── test/
│   └── mundo.test.js          # Pruebas unitarias con node:test (sin llamadas de red)
├── .env.example               # Plantilla de variables de entorno sin credenciales reales
├── .gitignore                 # Excluye node_modules/ y .env
├── package.json               # Configuración del proyecto, scripts y dependencia object-hash
├── PROMPT.md                  # Parte 7: Documentación del proceso de construcción con IA (secciones A-H)
└── README.md                  # Documentación general, evidencias y guía de uso
```

---

## 🧪 Validaciones y evidencia de errores provocados

El programa valida todas las entradas antes de realizar llamadas a la red y termina con `process.exitCode = 1` cuando ocurre un error:

### Error provocado 1: Cantidad incorrecta de argumentos (menos de 7)

```powershell
npm start -- "Una tormenta" "Aérpolis" "rojo" "azul"
```

```text
Error: Deben llegar exactamente 7 argumentos: <situación> <mundo> <color1> <color2> <color3> <color4> <color5>.
Ejemplo de uso: npm start -- "Una tormenta" "Aérpolis" "rojo" "azul" "verde" "dorado" "violeta"
```

### Error provocado 2: Argumento vacío o con solo espacios

```powershell
npm start -- "   " "Aérpolis" "rojo" "azul" "verde" "dorado" "violeta"
```

```text
Error: Ningún argumento puede estar vacío ni contener solo espacios.
Ejemplo de uso: npm start -- "Una tormenta" "Aérpolis" "rojo" "azul" "verde" "dorado" "violeta"
```

### Error provocado 3: Colores repetidos (sin distinguir mayúsculas de minúsculas)

```powershell
npm start -- "Una tormenta" "Aérpolis" "rojo" "azul" "verde" "dorado" "ROJO"
```

```text
Error: Los 5 colores deben ser distintos (sin distinguir mayúsculas de minúsculas).
Ejemplo de uso: npm start -- "Una tormenta" "Aérpolis" "rojo" "azul" "verde" "dorado" "violeta"
```

### Error provocado 4: Falta de clave en `.env` o límite de cuota (`402` / `429`)

- Si no está configurada `GROQ_API_KEY`:
  ```text
  Paso 1: mundo guardado en data/mundo_a4777339.json
  Error: Falta GROQ_API_KEY en el archivo .env.
  ```
- Si Pollinations alcanza el límite gratuito (`HTTP 402` / `429`):
  ```text
  Paso 1: mundo guardado en data/mundo_a4777339.json
  Paso 2: descripción ya existe en descripciones/mundo_a4777339.txt.
  Error: Pollinations alcanzó el límite gratuito. Espera antes de volver a intentarlo.
  ```

### Ejecución de pruebas automatizadas (`npm test`)

```powershell
npm test
```

```text
✔ valida los siete argumentos y recorta espacios exteriores
✔ rechaza una cantidad de argumentos diferente de siete
✔ rechaza argumentos vacíos después de recortar espacios
✔ rechaza colores repetidos sin distinguir mayúsculas
✔ los mismos datos producen el mismo id aunque cambie la fecha
ℹ tests 5 | pass 5 | fail 0
```

---

## 📦 Experimento `npm publish --dry-run` (con y sin `.gitignore`) y seguridad

### 1. Con `.gitignore` presente (configuración segura)

Al ejecutar `npm publish --dry-run` cuando `.gitignore` incluye `.env`, npm respeta las reglas de exclusión de `.gitignore` y **no incluye `.env`** dentro del paquete que se subiría al registro público de npm:

```text
npm notice === Tarball Contents ===
npm notice 133B  .env.example
npm notice 12.9kB PROMPT.md
npm notice 8.4kB README.md
npm notice 205B  data/mundo_6c0eec56.json
npm notice 241B  data/mundo_9ac1c2b8.json
npm notice 297B  data/mundo_a4777339.json
npm notice 731B  descripciones/mundo_6c0eec56.txt
npm notice 742B  descripciones/mundo_9ac1c2b8.txt
npm notice 722B  descripciones/mundo_a4777339.txt
npm notice 58.8kB imagenes/mundo_6c0eec56.jpg
npm notice 52.7kB imagenes/mundo_9ac1c2b8.jpg
npm notice 75.0kB imagenes/mundo_a4777339.jpg
npm notice 494B  package.json
npm notice 2.1kB src/imagen.js
npm notice 2.0kB src/index.js
npm notice 2.6kB src/mundo.js
npm notice 3.1kB src/texto.js
npm notice 1.5kB test/mundo.test.js
```

### 2. Sin `.gitignore` (riesgo de filtración de credenciales)

Si se elimina `.gitignore` (o si se quita `.env` de `.gitignore`), al ejecutar `npm publish --dry-run` aparece **`npm notice 158B .env`** dentro de `=== Tarball Contents ===`.
**Explicación:** Cuando no existe `.npmignore`, npm utiliza `.gitignore` para decidir qué archivos excluir del paquete. Sin `.gitignore`, el archivo `.env` con la clave privada `GROQ_API_KEY` se empaquetaría y se publicaría públicamente en el registro de npm, permitiendo que cualquier persona descargue el paquete y robe la credencial.

### 3. Verificación con `git ls-files`

El comando `git ls-files` demuestra que `.env` y `node_modules/` **no están versionados** en Git:

```powershell
git ls-files
```

```text
.env.example
.gitignore
PROMPT.md
README.md
data/mundo_6c0eec56.json
data/mundo_9ac1c2b8.json
data/mundo_a4777339.json
descripciones/mundo_6c0eec56.txt
descripciones/mundo_9ac1c2b8.txt
descripciones/mundo_a4777339.txt
imagenes/mundo_6c0eec56.jpg
imagenes/mundo_9ac1c2b8.jpg
imagenes/mundo_a4777339.jpg
package-lock.json
package.json
src/imagen.js
src/index.js
src/mundo.js
src/texto.js
test/mundo.test.js
```

---

## 💡 Preguntas de reflexión

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
