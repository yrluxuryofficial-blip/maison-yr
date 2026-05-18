# Carrito de cotización · setup del Google Sheet + Apps Script

El carrito del sitio envía las solicitudes a un **Google Apps Script Web App** que escribe una fila en un **Google Sheet** y te manda un email de notificación.

Este flujo es **independiente del formulario del newsletter** (que vive en otro Sheet + otro deployment). Si más adelante querés unificar, se puede hacer.

---

## 1. Crear el Google Sheet

1. Andá a [sheets.new](https://sheets.new) y creá una hoja nueva.
2. Renombrala a `YR Maison · Cotizaciones`.
3. En la primera fila pegá estas columnas (la primera fila es el header):

   | Fecha | Nombre | Email | Teléfono | Ciudad | Dirección | Notas | Items | Subtotal USD | Cantidad items |
   | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

4. Anotá el ID del Sheet (lo necesitás más adelante). Está en la URL:
   `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`

---

## 2. Crear el Apps Script

1. Desde el Sheet, ir a `Extensiones → Apps Script`.
2. Borrar todo el código que viene por default.
3. Pegar exactamente este código:

```javascript
// ============================================================
// YR Maison · Cotizaciones
// Recibe POST desde el carrito del sitio, escribe en el Sheet,
// y manda un email de notificación.
// ============================================================

// CONFIG · completá estos 2 valores antes de hacer el deploy
const SHEET_ID = 'PEGAR_EL_ID_DEL_SHEET_ACA';
const NOTIFY_EMAIL = 'PEGAR_TU_EMAIL_ACA';

function doPost(e) {
  try {
    const params = e.parameter || {};

    // Honeypot anti-bot — si está lleno, descartamos sin escribir
    if ((params.website || '').trim()) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true, skipped: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Parsear items (vienen como JSON stringificado)
    let items = [];
    try {
      items = JSON.parse(params.items || '[]');
    } catch (err) {
      items = [];
    }

    // Formatear items para celda legible
    const itemsHuman = items
      .map(it => `${it.qty}× ${it.name} ($${it.price} c/u)`)
      .join('\n');

    // Escribir fila en el Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const now = new Date();
    sheet.appendRow([
      now,
      params.name || '',
      params.email || '',
      params.phone || '',
      params.city || '',
      params.address || '',
      params.notes || '',
      itemsHuman,
      params.subtotal || '0',
      params.itemsCount || '0',
    ]);

    // Enviar email de notificación
    if (NOTIFY_EMAIL) {
      const subject = `🎀 Nueva cotización YR · ${params.name || 'Cliente'} · $${params.subtotal || '0'} USD`;
      const body = [
        `Nueva solicitud de cotización en Maison YR`,
        ``,
        `── Cliente ──`,
        `Nombre: ${params.name || '—'}`,
        `Email: ${params.email || '—'}`,
        `Teléfono: ${params.phone || '—'}`,
        `Ciudad: ${params.city || '—'}`,
        `Dirección: ${params.address || '—'}`,
        ``,
        `── Notas ──`,
        params.notes || '(sin notas)',
        ``,
        `── Items (${params.itemsCount || '0'} unidades) ──`,
        itemsHuman || '(sin items)',
        ``,
        `── Subtotal referencial ──`,
        `$${params.subtotal || '0'} USD`,
        ``,
        `── Acción ──`,
        `Contactá a ${params.name || 'el cliente'} por WhatsApp al ${params.phone || '—'} en menos de 24 horas hábiles.`,
      ].join('\n');

      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject,
        body,
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Endpoint para healthcheck — abrir la URL en el browser debe devolver "YR Cotizaciones OK"
function doGet() {
  return ContentService.createTextOutput('YR Cotizaciones OK');
}
```

4. Completar los 2 valores arriba de todo:
   - `SHEET_ID` — el ID que copiaste del Sheet.
   - `NOTIFY_EMAIL` — el email donde querés recibir las notificaciones (puede ser el mismo email asociado al Google).

5. Guardar (Ctrl+S). Cuando pida nombre del proyecto, ponerle `YR Maison · Carrito`.

---

## 3. Deploy como Web App

1. En el editor de Apps Script: botón azul arriba a la derecha **`Implementar` / `Deploy`** → **`Nueva implementación`**.
2. Tipo: **`Aplicación web`** (el ícono del engranaje, elegí "Aplicación web").
3. Configuración:
   - **Descripción**: `YR Maison · Carrito v1`
   - **Ejecutar como**: `Yo (tu email)`
   - **Quién tiene acceso**: `Cualquier usuario`
4. Click `Implementar`.
5. La primera vez te pide autorizar — aceptá los permisos (Apps Script necesita acceso al Sheet y a MailApp).
6. Te muestra una URL que termina en `/exec`. **Esa es la URL del endpoint.** Copiala.

> Importante: cada vez que cambies el código del Apps Script, hay que hacer `Implementar → Administrar implementaciones → Editar → Nueva versión` para que los cambios entren en producción.

---

## 4. Configurar la env var en Cloudflare Pages

1. En el dashboard de Cloudflare Pages, ir a tu proyecto `yr-maison` (o el nombre que tenga).
2. `Settings` → `Environment variables` → `Production` (y opcionalmente `Preview`).
3. Agregar:
   - **Variable name**: `PUBLIC_QUOTE_FORM_ENDPOINT`
   - **Value**: la URL `/exec` del paso anterior.
4. Guardar y hacer un **re-deploy** del sitio para que tome el cambio.

### Para probar localmente

Crear o editar `.env` en la raíz del proyecto (NO commit):

```
PUBLIC_QUOTE_FORM_ENDPOINT=https://script.google.com/macros/s/AKfycb.../exec
```

Reiniciar `npm run dev`.

---

## 5. Probar el flujo end-to-end

1. Abrir el sitio (local o producción).
2. Agregar 2-3 productos al carrito desde `/lenceria`, `/belleza`, etc.
3. Abrir el drawer del carrito (ícono arriba a la derecha del nav).
4. Llenar el formulario con datos de prueba.
5. Click `Solicitar cotización →`.
6. Verificar:
   - Drawer cambia a estado "Cotización enviada ✓".
   - El Sheet tiene una nueva fila con los datos correctos.
   - Llega un email a `NOTIFY_EMAIL` con el detalle.

---

## 6. Troubleshooting

### El drawer dice "Configuración pendiente"
- La env var `PUBLIC_QUOTE_FORM_ENDPOINT` no está seteada. Verificá en Cloudflare Pages y re-deploy.

### El submit responde error
- Abrir la URL `/exec` del Apps Script directamente en el browser: tiene que devolver `YR Cotizaciones OK`. Si no, revisá el deploy.
- Revisar permisos del Apps Script: tiene que poder leer/escribir el Sheet y mandar email.

### No me llega el email
- Verificar que `NOTIFY_EMAIL` esté completo en el Apps Script.
- MailApp en Apps Script tiene cuota diaria (~100 emails para cuenta gratis). Si superás eso, revisá el quota en https://developers.google.com/apps-script/guides/services/quotas

### Los items se ven raros en el Sheet
- En el código del Apps Script ajustá `itemsHuman` — actualmente es una línea por item con formato `qty× nombre ($price c/u)`.

### Bots están spammeando
- El honeypot ya descarta el 99%. Si llegara spam genuino, agregar verificación adicional en `doPost` (ej. validar email format con regex, rate-limiting por IP via Cache Service).

---

## Mantenimiento

- **Cambios al código del Apps Script**: edit + `Implementar → Administrar implementaciones → Editar → Nueva versión`.
- **Cambios al header del Sheet**: el código usa `sheet.appendRow([...])` que agrega al final. No depende del header. Si reordenás columnas en el Sheet, ajustá el orden del array en `appendRow`.
- **Agregar más campos al formulario**: editar `Cart.astro` (agregar `<input name="X">`) y agregar `params.X || ''` al `appendRow` en el Apps Script.
