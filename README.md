# mundos-ia

Programa de consola en Node.js que toma una situación, un mundo imaginario y cinco colores; guarda sus datos, solicita una descripción visual a **Groq** y genera una imagen con **Pollinations**.

## Requisitos

- Node.js 20.12 o posterior (usa `process.loadEnvFile`).
- Una clave de API de Groq.
- Conexión a Internet para consultar Groq y Pollinations.
- Git es necesario solo si deseas versionar o publicar el proyecto.

## Instalación y configuración

Desde la carpeta del proyecto, instala la única dependencia externa:

```powershell
npm install
```

Copia la plantilla de variables a `.env` y añade tu clave real de Groq:

```powershell
Copy-Item .env.example .env
```

Configura estas variables en `.env`:

```dotenv
GROQ_API_KEY=tu_clave_real_de_groq
GROQ_MODEL=openai/gpt-oss-20b
POLLINATIONS_IMAGE_URL=https://image.pollinations.ai/prompt
```

`GROQ_MODEL` debe ser un modelo disponible en tu cuenta de Groq. Pollinations no requiere una clave en este proyecto; puede aplicar límites o disponibilidad variable. Nunca compartas `.env` ni subas sus claves a Git.

## Ejecución

El programa espera siete argumentos: situación, mundo y cinco colores diferentes.

```powershell
npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aérpolis, un archipiélago de islas que flotan sobre las nubes" "rojo" "azul" "verde" "dorado" "violeta"
```

Las comillas agrupan frases completas como un único argumento. El identificador se calcula a partir de los datos de entrada; al repetir exactamente el mismo comando, el programa reutiliza la descripción y la imagen ya guardadas, sin llamar de nuevo a los modelos.

## Flujo y carpetas

1. Valida los argumentos, calcula un id determinista y guarda el mundo en `data/mundo_<id>.json`.
2. Lee el JSON guardado, pide a Groq una descripción y la guarda en `descripciones/mundo_<id>.txt`.
3. Envía el texto guardado a Pollinations y guarda los bytes de imagen en `imagenes/mundo_<id>.jpg`.

| Ruta | Responsabilidad |
|---|---|
| `src/index.js` | Coordina los tres pasos y permite continuar con archivos existentes. |
| `src/mundo.js` | Valida entradas, calcula el id y guarda/lee el JSON. |
| `src/texto.js` | Consulta Groq y guarda la descripción. |
| `src/imagen.js` | Solicita y guarda la imagen de Pollinations. |
| `.env.example` | Plantilla pública sin credenciales reales. |
| `.env` | Configuración local privada, excluida por Git. |
| `PROMPT.md` | Prompt reutilizable y guía paso a paso para recrear el proyecto. |

Los archivos generados y `node_modules/` están excluidos por `.gitignore`.

## Pruebas

```powershell
npm test
```

Las pruebas validan los argumentos y el id sin consumir cuota de los servicios. Para comprobar la integración completa se necesita configurar una clave válida de Groq y conexión a Internet.

## Solución de problemas

- **Falta `GROQ_API_KEY`:** crea `.env` desde `.env.example` y agrega tu clave de Groq.
- **Error 401 o 403:** revisa que la clave sea válida y tenga permisos.
- **Error 402 o 429:** se alcanzó un límite de uso; espera y vuelve a intentar.
- **Error 404 o 410:** revisa `GROQ_MODEL` y usa un modelo vigente para tu cuenta.
- **No se pudo conectar o hubo timeout:** comprueba Internet, espera y vuelve a ejecutar.
- **La imagen no se generó:** Pollinations puede limitar solicitudes; intenta de nuevo más tarde.

El programa conserva los archivos de los pasos anteriores si una llamada posterior falla. No publiques capturas o commits donde aparezca una clave.
