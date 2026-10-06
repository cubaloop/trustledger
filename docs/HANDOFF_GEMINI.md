# HANDOFF para Gemini — Proyecto TrustLedger (Golden Visa)

Eres el agente sucesor. David aprobó el plan de 8 h; el reloj empezó **2026-10-07 ~00:46 (GST, UTC+4)** y termina ~**08:46**. Trabaja de forma autónoma, sin consultar a David, hasta ese momento o hasta que él te detenga. No detengas la autocrítica sin su permiso.

## Lee primero
1. `docs/TECHNICAL_PLAN.md` — arquitectura, módulos, hitos, pruebas.
2. `evolution_log.md` — registra aquí cada ciclo (qué falló, qué corregiste, resultado de tests).
3. Reglas del usuario (resumen): ver sección "Reglas".

## Estado al traspaso
- Hecho: estructura de carpetas, `.env` local con credenciales, búsqueda inicial de requisitos de visa y arte previo.
- **No hecho**: ningún código de `app/`, ni repo en GitHub, ni despliegue. Empieza en "Siguiente paso".
- Credenciales: `.env` en la raíz de `golden/` (GITHUB_TOKEN, SUPABASE_*, GROQ_API_KEY, RENDER_API_KEY). **Nunca** las imprimas en chat, las commitees ni las pongas en el frontend (solo la ANON key puede ir en cliente). Crea `.gitignore` con `.env` antes del primer commit.
- Entorno: Node 22, Python 3.11, Git 2.48, Windows/PowerShell (no uses `<<<`; usa `cmd /c` o Node para stdin).

## Siguiente paso
1. Cierra F1 en ≤ 45 min: busca arte previo (GitHub, Reddit, HN) y escribe `research/prior_art.md`. Si el tema no se sostiene, documenta por qué y cambia con justificación.
2. Implementa `app/core` (detector, Merkle ledger, cruce con reservas) **con tests primero**.
3. Continúa según la tabla de hitos del plan técnico.

## Reglas obligatorias del usuario
- GitHub bajo `cubaloop`; despliegue en Render con pulso a `/healthz` cada ≤ 9 min; commits y push automáticos.
- Light-first (#F6F1E7/#FFFDF8/#14201B/#7A5A1E), dark (#09100D/#121D18/#F2EDE0/#D9B76F); EN + AR (RTL); mobile-first 390×844.
- Botones de WhatsApp: **solo ícono**, enlazado a `https://wa.me/<número>`. Sin texto ni número visible.
- Footer: "Developed by Tecnoemprende". Sin testimonios inventados; calificación real de Google con enlace.
- Panel admin móvil con 5 pestañas; compresión de fotos con canvas (≤ 800×800, ~40–60 KB); persistencia localStorage + Supabase; IDs siempre `String`.
- Imágenes/video con Nano Banana 2 (`generate_image`): **cero texto** en las imágenes.
- **Gatekeeper**: no contactes a ningún cliente ni envíes nada a terceros. La entrega va solo a David (WhatsApp +971 508379080 si lo autoriza); sin su aprobación explícita no se hace propuesta comercial.
- Un solo proyecto a la vez; mensajes a clientes (si algún día se autorizan) siempre en inglés.

## Honestidad (no negociable)
- No afirmes que el sistema "detecta reseñas falsas con certeza" ni que "garantiza" la Golden Visa. Reporta precision/recall reales sobre datos sintéticos y di que lo son.
- Si falla algo, regístralo en `evolution_log.md`; no maquilles resultados de tests.
- La visa requiere nominación de incubadora y valoración ≥ AED 500.000: déjalo claro en `docs/visa_dossier.md`.

## Criterios de "terminado"
Tests verdes (incluyendo ≥ 5.000 casos property-based), E2E móvil, Lighthouse ≥ 90, URL desplegada con `/healthz` activo, repo en GitHub, `visa_dossier.md` y `learning_notes.md`. Entrega final: resumen a David con enlace, métricas y limitaciones.
