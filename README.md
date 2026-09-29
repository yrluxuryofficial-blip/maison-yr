# YR Maison

> _Sensualidad en su forma más elegante._

Landing inmersiva de **Maison YR**, casa de lujo con cuatro universos: **Pour Elle** (lencería), **YR Men**, **Eau de Parfum** y **Golden Kiss** (lipgloss). Hecha en Astro 6 con CSS vanilla, JS vanilla, y un formulario conectado a Google Sheets.

---

## Stack

- **[Astro 6](https://astro.build)** en modo static — salida HTML pura, JS sólo donde es necesario
- **TypeScript strict** (extiende `astro/tsconfigs/strict`)
- **Node.js 22.12+** (testeado con 24.x)
- **CSS vanilla** con custom properties (`src/styles/global.css`)
- **Google Fonts**: Forum · Tenor Sans · Cormorant Garamond · Manrope
- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** → `/sitemap-index.xml`
- **Google Apps Script + Google Sheet** para el formulario del newsletter
- **Prettier** + `prettier-plugin-astro`
- **Sharp** + `to-ico` para generación de imágenes/iconos
- **Deploy**: Cloudflare Pages

### Lo que NO hay (a propósito)

- Sin Tailwind, sin Sass, sin CSS-in-JS.
- Sin React/Vue/Svelte/Solid.
- Sin librerías de animación (Framer Motion, GSAP, AnimeJS). Todo es CSS `@keyframes` + `IntersectionObserver` + eventos vanilla.
- Sin carrito real (los botones _Añadir →_ son decorativos con feedback inline).
- Sin sistema de "toast" — feedback inline en el mismo botón.

---

## Requisitos

- Node.js **22.12.0 o superior** (recomendado: 22.x LTS o 24.x)
- npm **10+**

---

## Comandos

| Comando                | Acción                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `npm install`          | Instala las dependencias.                                                          |
| `npm run dev`          | Servidor de desarrollo en `http://localhost:4321`.                                 |
| `npm run build`        | Build estático en `dist/`.                                                         |
| `npm run preview`      | Sirve la build para inspeccionar antes del deploy.                                 |
| `npm run icons`        | Regenera `favicon.ico` + PNGs del manifest desde `public/favicon.svg`.             |
| `npm run og`           | Regenera `public/og/default.png` (1200×630) desde `public/og/default.svg`.         |
| `npm run webp`         | Convierte a WebP los JPGs de `public/img/` que pesen más de 200 KB. Ver §Imágenes. |
| `npm run format`       | Formatea con Prettier todos los archivos.                                          |
| `npm run format:check` | Verifica formato sin escribir cambios (útil para CI).                              |

---

## Estructura

```
yr_maison/
├── astro.config.mjs          ← config Astro: site URL, sitemap
├── tsconfig.json
├── package.json
├── .prettierrc.json
├── .env.example              ← plantilla — copiar a .env y completar
├── README.md
├── public/
│   ├── _headers              ← Cache-Control + security headers (Cloudflare Pages)
│   ├── _redirects            ← typos y variantes inglesas → URL canónica
│   ├── favicon.svg / .ico    ← favicons (regenerados con `npm run icons`)
│   ├── apple-touch-icon.png
│   ├── icon-192.png / icon-512.png
│   ├── site.webmanifest      ← PWA manifest
│   ├── robots.txt
│   ├── og/
│   │   ├── default.svg       ← fuente editable
│   │   └── default.png       ← 1200×630, regenerado con `npm run og`
│   └── img/                  ← 6 placeholders SVG/JPG (REEMPLAZAR antes de prod)
├── scripts/
│   ├── generate-icons.mjs
│   ├── generate-og.mjs
│   ├── generate-placeholders.mjs   ← re-genera placeholders si los necesitás
│   └── convert-to-webp.mjs
├── docs/
│   ├── apps-script.md        ← código + paso a paso del Apps Script
│   └── legacy/
│       └── yr_maison_complete.html ← HTML monolítico original (referencia histórica)
└── src/
    ├── layouts/
    │   └── BaseLayout.astro  ← <head>, JSON-LD, skip-link, JS global
    ├── components/           ← 18 componentes (uno por sección)
    ├── data/                 ← 12 archivos JSON con todo el copy editable
    ├── pages/
    │   └── index.astro       ← compone los componentes en orden
    └── styles/
        └── global.css        ← paleta + tipografía + animaciones + 4 breakpoints
```

---

## Editar contenido

**Regla de oro**: todo lo que el visitante lee vive en `src/data/*.json`. Para cambiar copy, precios, tonos o tallas, **no toques los componentes** — editá el JSON y listo.

> Los campos que contienen `<em>...</em>` o `<strong>...</strong>` permiten HTML mínimo para la tipografía itálica dorada (el componente los renderiza con `set:html`). Manteneé el balance de tags.

### `src/data/site.json` — datos globales

Email, teléfono, WhatsApp, dirección, redes sociales, datos de la fundadora. Estos campos alimentan el JSON-LD para SEO y se reutilizan en footer y WhatsApp float.

```json
"contact": {
  "email": "[COMPLETAR]",        ← reemplazar antes de prod
  "phone": "[COMPLETAR]",        ← reemplazar antes de prod
  "whatsapp": "573000000000",    ← número sin +
  "whatsappMessage": "..."
}
```

### `src/data/nav.json`

Enlaces del nav superior (`primary`), de la zona derecha (`secondary`, ej: Buscar/Cuenta) y los dots del side-nav (`sideNav` — con `target` apuntando al `id` de la sección).

### `src/data/hero.json`

Prefijo, título principal (con `<em>` para las palabras doradas), subtítulo y los dos CTAs.

### `src/data/perfume-pinned.json`

Los 3 capítulos que aparecen mientras el frasco rota 720°. Cada uno con `prefix`, `h2`, `body`, y `meta[]` (los 2 datos de la línea inferior).

### `src/data/universes.json`

Array de 4 universos del scroll horizontal. Cada uno: `roman`, `name`, `description`, `features[]`, `cta`. El orden del array es el orden visual.

### `src/data/tilt-cards.json`

Las 3 tarjetas 3D ("Toca, inclina, descubre"). El `cssClass` (`tc-1`, `tc-2`, `tc-3`) determina qué imagen usa.

### `src/data/shades.json` — Golden Kiss

```json
"shades": [
  { "slug": "golden", "name": "Golden Kiss",
    "color": "#E6C49B", "colorDeep": "#A87445", "active": true }
]
```

**Para agregar un nuevo tono**: copiá el bloque, dale un `slug` único, ponele un `name` y dos hex. El primer item con `"active": true` arranca seleccionado.

**Para cambiar el precio base**: editá `"basePrice": 32`.

### `src/data/lingerie.json`

Los 3 colorways (`noir`, `chocolat`, `blanc`) y las tallas. El swatch de cada colorway está hardcodeado en CSS (`.colorway-opt[data-color="noir"] .swatch`) — si agregás un nuevo colorway tenés que añadir su regla CSS también.

**Para agregar/quitar una talla**: editá el array `"sizes": ["XS", "S", "M", "L", "XL"]`.

### `src/data/parfum-notes.json`

Las 3 capas olfativas del perfume con `label`, `summary` y `detail` (lo que se ve al abrir el acordeón).

### `src/data/philosophy.json` y `footer.json`

Manifiesto y columnas del footer + textos del newsletter (placeholder, mensaje de éxito, mensaje de fallback si Apps Script no está configurado).

---

## Reemplazar imágenes

`public/img/` arranca con **6 placeholders SVG/JPG** que dicen `PLACEHOLDER · REEMPLAZAR`. Esto es por diseño — el build funciona, pero el sitio luce con los placeholders hasta que reemplacés los archivos.

### Dimensiones esperadas

| Archivo                    | Dimensiones | Uso                                                          |
| -------------------------- | ----------- | ------------------------------------------------------------ |
| `yr_parfum_green.jpg`      | ~1200×1600  | Pinned section (LCP — frasco principal)                      |
| `yr_parfum_pink.jpg`       | ~1200×1500  | Configurator de perfume                                      |
| `yr_lingerie_noir.png`     | ~1200×1500  | Lencería · colorway Noir (default), universo I, tilt card #1 — PNG con fondo transparente, se ve sobre el background-color del CSS |
| `yr_lingerie_chocolat.png` | ~1200×1500  | Lencería · colorway Chocolat (configurador) — PNG con transparencia                                                              |
| `yr_lingerie_blanc.png`    | ~1200×1500  | Lencería · colorway Blanc (configurador) — PNG con transparencia                                                                 |
| `yr_men_logo.jpg`          | ~1200×1600  | Universo II en scroll horizontal                             |
| `yr_men_collection.jpg`    | ~1200×1600  | Tilt card #2                                                 |
| `yr_golden_kiss.jpg`       | ~1200×1200  | Configurator de lipgloss + universo IV                       |

> Las 3 imágenes de lencería se intercambian al hacer click en los swatches Noir/Chocolat/Blanc del configurador. Para cambiar el default, editá `"active": true` en `src/data/lingerie.json → colorways`.

### Optimización

Una vez reemplazadas con la sesión definitiva:

```bash
npm run webp
```

Convierte a WebP las imágenes que pesen más de 200 KB. **No borra los JPGs** automáticamente — el script imprime los próximos pasos manuales para que actualices los paths en JSON/CSS antes de eliminar los originales.

---

## Imagen Open Graph

La imagen que aparece al compartir el sitio (1200×630) se genera desde un SVG editable:

```bash
# Editar public/og/default.svg con tu editor favorito
npm run og   # → regenera public/og/default.png
```

El SVG ya contiene el emblema YR con la paleta esmeralda + dorado. Cambiá texto/colores ahí.

---

## Formulario del newsletter (Google Sheets via Apps Script)

El formulario de _Únete al Cercle YR_ no usa backend propio: envía cada email a un Google Sheet a través de un Apps Script Web App.

**Documentación completa con código de ejemplo y paso a paso**: [docs/apps-script.md](docs/apps-script.md).

Resumen del flujo:

1. Creás un Google Sheet.
2. **Extensiones → Apps Script**, pegás el código de `docs/apps-script.md`.
3. **Implementar → Aplicación web** con acceso _Cualquier persona_. Te da una URL `script.google.com/macros/s/.../exec`.
4. Esa URL va en la env var `PUBLIC_FORM_ENDPOINT`.

### Variables de entorno

#### `.env` local

```env
PUBLIC_FORM_ENDPOINT=https://script.google.com/macros/s/TU_ID/exec
```

#### Cloudflare Pages

Settings → Environment variables → Add:

| Nombre                 | Valor                          | Scope                |
| ---------------------- | ------------------------------ | -------------------- |
| `PUBLIC_FORM_ENDPOINT` | URL del Apps Script `.../exec` | Production + Preview |

> El prefijo `PUBLIC_` es obligatorio — Astro sólo expone al cliente las variables que empiecen con `PUBLIC_`.

### Comportamiento sin endpoint

Si `PUBLIC_FORM_ENDPOINT` está vacío al hacer build, el formulario **no falla silencioso**. Muestra:

```
— Configuración pendiente. Escríbenos por WhatsApp
```

durante 5 segundos al enviarse. Así nunca queda gente pensando que se inscribió cuando en realidad el dato no llegó a ningún lado.

### Honeypot

El form incluye un campo oculto `<input name="website">`. Usuarios reales nunca lo ven (CSS lo posiciona fuera de pantalla); los bots de spam lo rellenan automáticamente. Si llega lleno, el cliente JS descarta y el Apps Script también responde `200 OK` sin escribir (para no darle señal al atacante).

---

## Deploy a Cloudflare Pages

1. Push del repo a GitHub.
2. Cloudflare Dashboard → **Workers & Pages → Create application → Pages → Connect to Git**.
3. Elegí el repo.
4. Build settings:
   - **Framework preset**: _Astro_
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (vacío)
5. Environment variables:
   - `NODE_VERSION` = `22.12.0` (o más alto)
   - `PUBLIC_FORM_ENDPOINT` = URL del Apps Script
6. **Save and Deploy**.
7. Cuando deployee, conectá el dominio custom en _Custom domains_ → `maisonyr.com`. Cloudflare se encarga del SSL automáticamente.

`public/_headers` y `public/_redirects` se aplican automáticamente.

---

## Performance, SEO, Accesibilidad

### Targets

| Métrica         | Objetivo |
| --------------- | -------- |
| Lighthouse Perf | **85+**  |
| Accessibility   | **100**  |
| SEO             | **100**  |
| Best Practices  | **100**  |

### Cómo se llega ahí

- **Sitemap**: generado por `@astrojs/sitemap` en `/sitemap-index.xml`.
- **JSON-LD `Organization`**: en `BaseLayout.astro` con datos de `site.json` (nombre, URL, logo, sameAs con Instagram/TikTok, founder).
- **Open Graph + Twitter Cards**: sincronizados con `<title>` y `<meta description>`.
- **Canonical**: sin trailing slash (`trailingSlash: 'never'` en `astro.config.mjs`), coincide con sitemap.
- **`prefers-reduced-motion`**: respetado — todas las animaciones se acortan a `0.001ms` y el reveal queda visible directo.
- **Heading hierarchy**: `<h1>` único en el hero, `<h2>` en cada sección, sin saltos.
- **Skip-to-content** link al inicio del body.
- **Imágenes**: la del LCP (frasco pinned) lleva `loading="eager"` + `fetchpriority="high"`; el resto, `loading="lazy"`.
- **Cache headers**: assets en `/_astro/*` y `/img/*` con `max-age=31536000, immutable`.

---

## Infraestructura

| Servicio         | Proveedor                  | Notas                                 |
| ---------------- | -------------------------- | ------------------------------------- |
| Dominio          | _completar_                | Apuntar A/CNAME a Cloudflare Pages    |
| Hosting          | Cloudflare Pages           | Static. CDN global incluido.          |
| Formulario       | Google Apps Script + Sheet | Ver `docs/apps-script.md`             |
| SEO sitemap      | @astrojs/sitemap           | Build-time → `dist/sitemap-index.xml` |
| Analytics        | _por definir_              | Plausible recomendado (privacy-first) |
| Caching          | Cloudflare + `_headers`    | 1 año immutable para assets           |
| Redirects        | `public/_redirects`        | Cloudflare lo lee automáticamente     |
| Security headers | `public/_headers`          | nosniff · SAMEORIGIN · strict-origin  |

---

## TODO del cliente antes de salir a producción

- [ ] **Apps Script publicado** y URL pegada en `PUBLIC_FORM_ENDPOINT` (Cloudflare Pages).
- [ ] **Imágenes reales** en `public/img/` reemplazando los placeholders.
- [ ] Correr `npm run webp` y actualizar paths a `.webp` si las imágenes finales pesan mucho.
- [ ] Completar `email`, `phone` y `addressLine` en `src/data/site.json` (hoy dicen `[COMPLETAR]`).
- [ ] Confirmar número de WhatsApp en `site.json` → `contact.whatsapp` (sin `+`).
- [ ] Confirmar handles de Instagram/TikTok (ya están cargados pero verificar).
- [ ] Definir si necesita política de privacidad / cookies y agregar página separada si aplica.
- [ ] Configurar dominio custom en Cloudflare Pages y verificar SSL.
- [ ] (Opcional) Sumar analytics — recomendamos Plausible o Fathom.
- [ ] Una pasada de Lighthouse en producción contra los targets de arriba.

---

## Decisiones técnicas notables

- **Sin Tailwind**: el sitio tiene un visual muy específico, y mantener un CSS vanilla en `global.css` permite que un diseñador edite la paleta o tipografía sin entender utilities. La curva de mantenimiento queda baja.
- **Sin librerías de animación**: las animaciones son simples (CSS `@keyframes`, `IntersectionObserver`, scroll events con `transform`). Agregar GSAP/Framer sumaría ~30–80 KB sin ganar nada — y bloquearía el FCP.
- **Mode atelier**: el cursor custom dorado y el side-nav lateral aparecen sólo después de que el visitante se compromete (click en "Descubrir la maison" o scroll del 50% del hero). Es una decisión de UX: una landing fría se siente menos invasiva.
- **Toast removido a propósito**: los botones _Añadir →_ muestran `✓ Añadido` por 1.8s en el mismo botón. Es más sutil que un toast flotante y no necesita librería.
- **Newsletter con `URLSearchParams` (no JSON)**: el fetch a Apps Script tiene que ser una _simple request_ para evitar preflight CORS. JSON dispararía el preflight y Apps Script no responde los headers necesarios. Form-encoded "simplemente funciona".
- **WebP sólo para imágenes pesadas**: convertir todo a WebP es exceso. El script `npm run webp` filtra por >200 KB, que es donde el ahorro vale la pena.
- **HTML embebido en JSON**: campos como `hero.h1` o `philosophy.quote` contienen `<em>` / `<strong>`. Es la forma más directa de permitir que un copywriter (no developer) controle qué palabras quedan en itálica dorada sin tocar componentes.

---

## Licencia / Crédito

© MMXXVI Maison YR · Tenerife. Todos los derechos reservados.

Sitio diseñado y construido siguiendo la dirección creativa de Yesenia Rodríguez (Fondatrice). El HTML monolítico original se conserva como referencia histórica en `docs/legacy/`.
