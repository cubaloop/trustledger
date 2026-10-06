# TrustLedger — Plan Técnico

**Tema elegido (provisional, validado por F1):** motor de integridad de reputación para negocios locales de EAU.
**Por qué:** el problema de reseñas falsas sigue sin resolver; Fakespot/ReviewMeta ya no existen; Google retiene las señales fiables, así que una herramienta externa no puede *probar* fraude. El hueco real es la **evidencia verificable**: reseñas ligadas a clientes reales + rastro a prueba de manipulación + paquete de apelación listo para Google.

> Límite honesto: el sistema produce puntuaciones probabilísticas y evidencia, nunca "veredictos" sobre una reseña de Google.

## Módulos
1. **Ingesta**: importación de reseñas públicas (scraping educado de la ficha o carga CSV/JSON) + registros de reservas/clientes del negocio.
2. **Detector de anomalías** (puro código, determinista y testeable):
   - Ráfagas temporales (z-score / CUSUM sobre reseñas por día).
   - Similitud textual (MinHash/Jaccard + n-gramas) entre reseñas.
   - Heurísticas de perfil (cuentas sin historial, rating polarizado).
   - Estilometría opcional con LLM (Groq) como señal secundaria, nunca única.
3. **Cruce con reservas**: coincidencia nombre/fecha/servicio (fuzzy) → "reseña verificable" vs "sin respaldo".
4. **Ledger a prueba de manipulación**: cadena de hashes SHA-256 + árbol Merkle; raíz publicada periódicamente (commit en GitHub / fila en Supabase). Cualquiera puede verificar la integridad.
5. **Reseñas verificadas propias**: tras la visita, enlace único (token firmado HMAC, un solo uso) vía WhatsApp (solo ícono) para dejar reseña ligada a una reserva real.
6. **Paquete de apelación**: PDF/JSON con evidencia ordenada por reseña sospechosa y política de Google infringida.
7. **Widget embebible** "Verified by TrustLedger" con calificación real y enlace a Maps (sin inventar testimonios).
8. **Panel admin móvil** (5 pestañas obligatorias): Reseñas/Catálogo, Anuncios, Categorías/Reglas, Historial de reservas, Config + Supabase + backup JSON 1 clic.

## Arquitectura
- Frontend: HTML/JS + Vite, light-first (#F6F1E7 / #14201B / #7A5A1E), dark toggle, EN/AR con RTL, mobile-first 390×844, footer "Developed by Tecnoemprende".
- Backend: Node 22 + Express (`/healthz`, `/api/*`), núcleo de análisis como librería pura (`core/`) para testear sin red.
- Persistencia dual-layer: localStorage (arranque instantáneo) + `syncFromSupabase()` en segundo plano; IDs siempre `String(id)`.
- Despliegue: GitHub `cubaloop/trustledger` → Render, con pulso wake-lock cada ≤ 9 min a `/healthz`.
- Credenciales: solo vía `.env` (nunca en código ni commits; `.gitignore` obligatorio).

## Estructura
```
golden/
  app/{core,server,web}
  tests/{unit,property,e2e,fixtures}
  docs/{TECHNICAL_PLAN.md,HANDOFF_GEMINI.md,whitepaper.md,visa_dossier.md}
  research/  evolution_log.md  learning_notes.md
```

## Pruebas ("miles")
- **Property-based** (fast-check): 5.000+ casos generados por propiedad (ledger inmutable, Merkle correcto, detector sin falsos positivos en datos sintéticos limpios).
- **Dataset sintético**: generador con inyección controlada de fraude (precision/recall medidos y reportados).
- **Fuzz** de parsers CSV/JSON; **E2E** Playwright en 390×844 y 430×932, light/dark, EN/AR.
- **Seguridad**: tokens de un solo uso, rate-limit, validación de entrada, `npm audit`.
- Lighthouse ≥ 90, axe sin violaciones críticas.

## Hitos (8 h)
| Tramo | Entrega |
|---|---|
| 0:00–1:00 | Cierre de F1: arte previo, matriz de tema |
| 1:00–2:30 | `core/` + tests (detector, ledger, cruce) |
| 2:30–4:00 | Servidor, Supabase, tokens de reseña verificada |
| 4:00–5:15 | UI + panel admin + widget |
| 5:15–7:15 | Hardening, métricas, autocrítica en ciclos |
| 7:15–8:00 | Despliegue, dossier visa, entrega a David |

## Visa (realista)
Ruta "proyecto innovador": nominación de incubadora acreditada (Hub71/AREA 2071) + valoración ≥ AED 500.000 por auditor licenciado. El dossier prepara el caso (demo, métricas, mercado), pero esos dos pasos requieren acción humana de David.
