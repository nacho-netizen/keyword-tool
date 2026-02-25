# KeywordAI — Guía de instalación en Vercel

## Estructura del proyecto
```
keyword-tool/
├── api/
│   └── research.js       ← Backend seguro (guarda tu API key acá)
├── public/
│   └── index.html        ← Frontend de la herramienta
├── vercel.json           ← Configuración de Vercel
└── README.md
```

---

## PASO 1 — Obtener tu API key de Anthropic

1. Entrá a https://console.anthropic.com
2. Creá una cuenta (podés usar Google)
3. En el menú lateral, hacé clic en **"API Keys"**
4. Clic en **"Create Key"**, ponele un nombre (ej: "keyword-tool")
5. **Copiá la key** — empieza con `sk-ant-...`
6. Guardala en un lugar seguro

> Anthropic da **$5 de crédito gratis** al registrarte. Alcanza para miles de búsquedas.

---

## PASO 2 — Crear cuenta en Vercel

1. Entrá a https://vercel.com
2. Hacé clic en **"Sign Up"**
3. Elegí **"Continue with GitHub"** (necesitás una cuenta de GitHub, también gratis)
4. Si no tenés GitHub: https://github.com → "Sign up" → volvé a Vercel

---

## PASO 3 — Subir el proyecto a GitHub

1. Entrá a https://github.com
2. Clic en el **"+"** (arriba a la derecha) → **"New repository"**
3. Nombre: `keyword-tool` → clic en **"Create repository"**
4. En la página del repo, hacé clic en **"uploading an existing file"**
5. Subí todos los archivos manteniendo la estructura de carpetas:
   - `api/research.js`
   - `public/index.html`
   - `vercel.json`
6. Clic en **"Commit changes"**

---

## PASO 4 — Desplegar en Vercel

1. Entrá a https://vercel.com/dashboard
2. Clic en **"Add New Project"**
3. Buscá tu repo `keyword-tool` y hacé clic en **"Import"**
4. Dejá todo por defecto y hacé clic en **"Deploy"**

---

## PASO 5 — Agregar tu API key (¡IMPORTANTE!)

Sin este paso la herramienta no funciona.

1. En Vercel, entrá a tu proyecto
2. Andá a **"Settings"** → **"Environment Variables"**
3. Agregá esta variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** tu key que empieza con `sk-ant-...`
4. Clic en **"Save"**
5. Andá a **"Deployments"** → hacé clic en los tres puntos del último deploy → **"Redeploy"**

---

## PASO 6 — ¡Listo!

Vercel te da una URL del estilo:
`https://keyword-tool-tuusuario.vercel.app`

Esa es tu herramienta online, funciona desde cualquier dispositivo.

---

## Costos estimados

| Uso | Costo Anthropic estimado |
|-----|--------------------------|
| 10 búsquedas/día | ~$0.03/día |
| 50 búsquedas/día | ~$0.15/día |
| 200 búsquedas/día | ~$0.60/día |

Vercel es **100% gratis** para este tipo de proyecto.

---

## ¿Problemas?

Si ves el error "Failed to fetch" o similar:
- Verificá que la variable `ANTHROPIC_API_KEY` esté bien configurada en Vercel
- Asegurate de haber hecho Redeploy después de agregar la variable
