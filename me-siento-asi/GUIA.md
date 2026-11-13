# Me siento así… · Guía de publicación

El sitio es estático (HTML + CSS + JS). Como GitHub Pages no tiene servidor, el correo lo envía el servicio gratuito **Web3Forms** (250 envíos/mes gratis, sin instalar nada). Ella solo toca "Enviar".

## 1. Obtener la access key (2 min)
1. Entra a https://web3forms.com y escribe `durbinacastle@gmail.com` en "Create your Access Key".
2. Llegará un correo a esa dirección con la **access key** (un código largo). Revisa spam.
3. Abre `js/config.js` y reemplaza `PEGA_AQUI_TU_ACCESS_KEY` por ese código (déjalo entre comillas).

> La key es pública por diseño: solo permite enviar correos a tu dirección, nada más.

### Cómo llega el correo
Llega directo a `durbincastle@gmail.com` (la dirección con la que creaste la key). Cada pregunta viaja como un campo aparte, numerado y en orden (`01 · ¿Ya comió?` → respuesta), así que Web3Forms lo arma como tabla Pregunta / Respuesta. El asunto lleva fecha y hora. Si quieres plantillas HTML con más espacio y diseño propio, Web3Forms las ofrece en su plan de pago.

## 2. Probar en tu computadora
En la carpeta del proyecto ejecuta `python3 -m http.server 8000` y abre http://localhost:8000. Llena el formulario, envía y revisa tu bandeja.

## 3. Publicar en GitHub Pages
1. Crea cuenta en https://github.com y pulsa **New repository**. Nómbralo, por ejemplo, `me-siento-asi` y déjalo **Public** (Pages gratis lo requiere).
2. Pulsa **uploading an existing file**, arrastra el contenido de la carpeta (`index.html`, `css/`, `js/`) y haz **Commit changes**. Sube la carpeta con las subcarpetas, no el .zip.
3. Ve a **Settings → Pages**. En *Source* elige **Deploy from a branch**, rama **main**, carpeta **/ (root)** y **Save**.
4. En 1–2 minutos aparece la dirección: `https://TU-USUARIO.github.io/me-siento-asi/`. Envíasela a ella; puede agregarla a su pantalla de inicio desde el menú del navegador.

## 4. Cambiar algo después
Edita el archivo en GitHub (icono del lápiz) → Commit. Se actualiza solo en ~1 minuto.

## Problemas comunes
- **"Falta configurar la access key"**: no pegaste la key en `js/config.js`.
- **No llega el correo**: revisa spam; busca "Me siento así…". Marca como "No es spam".
- **Error al enviar**: revisa que la key esté completa y sin espacios. Sus respuestas no se pierden mientras no cierre la página.
- **Página en blanco/sin estilos**: subiste el .zip o los archivos sin las carpetas `css/` y `js/`.

## Notas de diseño
- Si responde "No" a "¿Hay algo que me quiera contar?", se ocultan periodo, relato, sentimiento, puntaje y latidos (los latidos dependen del periodo). Si responde "No" a "¿Ya comió?" o "¿Ya tomó agua?", se ocultan sus preguntas de seguimiento.
- Los latidos se ofrecen como 5 rangos (60–100 pulsaciones/min × duración del periodo).
- El código usa JSDoc con `// @ts-check` para tipado estricto sin necesitar compilar nada.
