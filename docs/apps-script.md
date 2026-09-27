# Apps Script — Newsletter YR Maison

El formulario de la sección _Cercle YR_ envía los emails a una hoja de cálculo de Google a través de un **Apps Script Web App**. Es la misma arquitectura usada en NorteCorp: sin backend propio, sin costo recurrente, sólo Google.

## Resumen del flujo

```
Visitante → <form> en /  → fetch POST (URLSearchParams)
                              ↓
                  Apps Script Web App (URL pública)
                              ↓
                ┌─────────────┴─────────────┐
                ↓                           ↓
           Sheet.appendRow            MailApp.sendEmail
        (registro en la hoja)        (notificación al dueño)
```

## Paso a paso

### 1. Crear la hoja de cálculo

1. Andá a [sheets.new](https://sheets.new) y creá un Google Sheet nuevo.
2. Nombralo, por ejemplo, **`YR Maison · Newsletter`**.
3. En la fila 1 escribí los encabezados:

   | A           | B     | C      |
   | ----------- | ----- | ------ |
   | Fecha (UTC) | Email | Origen |

### 2. Pegar el Apps Script

1. Desde la misma Sheet: **Extensiones → Apps Script**.
2. Reemplazá el contenido por el código de abajo.
3. Cambiá `OWNER_EMAIL` por la dirección que debe recibir las notificaciones.
4. Click en **Guardar** (💾).

```javascript
/**
 * YR Maison · Newsletter handler
 * Recibe POST con campos: email, website (honeypot).
 * Si "website" viene lleno → bot, descartamos sin escribir.
 * En éxito: appendRow + email al dueño + JSON {ok:true}.
 */
const OWNER_EMAIL = 'contacto@maisonyr.com'; // ← cambiá esto
const SHEET_NAME = 'Sheet1'; // ← o el nombre real de tu pestaña

function doPost(e) {
  try {
    const params = e.parameter || {};
    const email = (params.email || '').trim();
    const honeypot = (params.website || '').trim();

    // Bot: respondemos 200 pero no escribimos nada.
    if (honeypot) {
      return jsonResponse({ ok: true, ignored: true });
    }

    // Validación mínima de email.
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'invalid_email' });
    }

    const sheet =
      SpreadsheetApp.getActive().getSheetByName(SHEET_NAME) ||
      SpreadsheetApp.getActive().getSheets()[0];
    sheet.appendRow([new Date(), email, 'maisonyr.com']);

    // Notificación por email (comentá esta sección si no la querés).
    try {
      MailApp.sendEmail({
        to: OWNER_EMAIL,
        subject: '✦ Nueva suscripción · Cercle YR',
        htmlBody:
          '<p style="font-family:Georgia,serif;font-size:16px">' +
          '<strong>Nueva inscripción al Cercle YR:</strong><br>' +
          email +
          '</p><p style="color:#888;font-size:12px">Registro automático desde maisonyr.com</p>',
      });
    } catch (mailErr) {
      // Si MailApp queda sin cuota, igual seguimos: el dato ya está en la hoja.
      console.warn('MailApp failed:', mailErr);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, info: 'YR Maison newsletter endpoint' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
```

### 3. Publicar como Web App

1. Click en **Implementar → Nueva implementación**.
2. Icono ⚙️ junto a "Seleccionar tipo" → **Aplicación web**.
3. Configurá:
   - **Descripción**: `YR Maison newsletter v1`
   - **Ejecutar como**: _Yo_ (tu cuenta Google)
   - **Quién tiene acceso**: **Cualquier persona** (¡importante!, sin esto el `fetch` desde el sitio falla)
4. Click **Implementar** → autorizá los permisos cuando los pida.
5. Copiá la **URL del web app** (formato `https://script.google.com/macros/s/AKfy.../exec`).

### 4. Configurar la env var

#### En desarrollo local

Creá `.env` (ya está en `.gitignore`):

```env
PUBLIC_FORM_ENDPOINT=https://script.google.com/macros/s/TU_ID/exec
```

#### En Cloudflare Pages

Settings → **Environment variables** → Add:

| Variable               | Valor                                           | Scope                |
| ---------------------- | ----------------------------------------------- | -------------------- |
| `PUBLIC_FORM_ENDPOINT` | `https://script.google.com/macros/s/TU_ID/exec` | Production + Preview |

> El prefijo `PUBLIC_` es obligatorio — Astro sólo expone al cliente las env vars que empiecen con `PUBLIC_`.

### 5. Probar

```bash
npm run dev
```

Abrí http://localhost:4321, scrolleá hasta _Únete al Cercle YR_, mandá tu email. Si todo está bien:

- La fila aparece en la Sheet (puede tardar 1-2 segundos).
- Recibís un email en `OWNER_EMAIL`.
- El sitio muestra `Bienvenida al Círculo YR ✦` debajo del formulario.

Si la env var no está seteada, el form muestra `— Configuración pendiente. Escríbenos por WhatsApp` en su lugar.

## Mantenimiento

### Cambiar el destinatario del email

Editá `OWNER_EMAIL` en el script y volvé a implementar (**Implementar → Gestionar implementaciones → editar → Nueva versión → Implementar**). La URL no cambia.

### Desactivar la notificación por email

Comentá el bloque `try { MailApp.sendEmail(...) }` y volvé a implementar.

### Re-implementar tras cambios

Cada vez que edites el código tenés dos opciones:

- **Misma URL** (recomendado): Implementar → Gestionar implementaciones → ✏️ editar la activa → Nueva versión.
- **URL nueva**: Implementar → Nueva implementación. _Sólo úsalo si necesitás convivir dos versiones._

### Ver registros

Apps Script → menú izquierdo **Ejecuciones**: vas a ver cada `doPost` con duración y errores si los hay.

## Por qué `URLSearchParams` y no JSON

`fetch` con `Content-Type: application/x-www-form-urlencoded` (lo que produce `URLSearchParams`) es una _simple request_ — no dispara preflight CORS. Apps Script no envía los headers CORS que necesitaríamos para un POST con JSON, así que el body urlencoded es el camino que "simplemente funciona".

## Por qué el honeypot

Bots de spam atacan a ciegas todos los `<form>` que encuentran. El campo `website` está oculto vía CSS (`.hp-field { position:absolute; left:-10000px }`) — usuarios reales nunca lo ven, pero los bots lo rellenan. Si llega lleno, descartamos sin escribir y respondemos `200 OK` para no darle señal de que detectamos el ataque.
