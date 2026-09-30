# Setline

PWA personal para ejecutar rutinas desde iPhone o Mac, sin backend ni cuenta. Cuatro programas y doce sesiones completas de **30–45 minutos estimados**: Vóley + gym, Hipertrofia 3–4 días, Pecho · prioridad y Calistenia. El usuario puede cortar antes.

La duración se calcula con las series reales, los descansos entre series, 6–8 minutos de calentamiento y un minuto por cambio de ejercicio. Incluye preparación y registro de cada serie, y ambos lados en los ejercicios unilaterales. No incluye esperas por máquinas; es una estimación, no una medición del entrenamiento. Consulta [la revisión de programación](docs/PROGRAMMING.md).

## Sesión actual y RESET

Pesos, repeticiones y checks se conservan automáticamente en `localStorage`, junto con programa/día seleccionado, filtro, preset, objetivos manuales y referencias previas. No hay IndexedDB, backend, historial cronológico ni sincronización entre dispositivos. El service worker almacena la interfaz y GIFs en Cache Storage; no registra entrenamientos.

**RESET**, visible arriba y al pie de una sesión iniciada, vacía solo los pesos, reps y checks del día actual y detiene el temporizador. Pide confirmación, permite cancelar y conserva los demás días, los objetivos manuales y las referencias de volumen previas. No crea ni reemplaza referencias al resetear. Las cargas sugeridas vuelven a aparecer como valores iniciales; no son datos de una sesión completada.

La app marca la siguiente serie, pliega los ejercicios completos y permite desplegarlos. El panel final indica **Sesión completa** con la misma acción **RESET**. Los accesos para iniciar Apple Watch fueron retirados.

## Programas

- **Vóley + gym:** A/B de torso, C opcional según recuperación. 14–15 series por sesión. El press disponible puede reemplazar el inclinado siguiendo la pauta y ajustando su carga.
- **Hipertrofia 3–4 días:** 14–15 series por sesión, con cuarto día complementario opcional. Para semanas sin vóley; no se acumula encima del plan Vóley.
- **Pecho · prioridad:** A/B de gimnasio o Casa como sustitución. Cada sesión tiene 7 series de pecho, 3 de espalda y 2 de hombros. Dos por semana suman 14 series directas de pecho; no se duplican con otros planes.
- **Calistenia:** A/B de 15 series, movimientos de cuerpo completo y descansos de 60–90 segundos. Se registran reps, sin kilos ficticios.

La progresión conserva el RIR prescrito: sube reps, y tras alcanzar el máximo con buena técnica en dos sesiones, aumenta el menor salto de carga disponible o la dificultad de la variante. Las alternativas sustituyen ejercicios, no añaden series. No compares cargas o referencias entre máquinas/variantes distintas.

La app abre primero Hipertrofia. Light / Normal / Heavy son sugerencias orientativas; las cargas manuales prevalecen y el RIR calibra el peso. No existe una carga universal por talla o peso.

## Instalar en iPhone

Abre la web en Safari → Compartir → Añadir a pantalla de inicio. La PWA ofrece **Actualizar** cuando detecta una nueva versión y conserva los registros locales.

## Desarrollo y pruebas

```bash
python3 -m http.server 8080
node --test tests/session.test.cjs
```

Abre `http://localhost:8080`. Las pruebas usan datos sintéticos y no acceden al almacenamiento del usuario. El flujo de publicación existente despliega GitHub Pages al enviar cambios a `main`; no publiques sin autorización.

## Estructura

- `index.html`: aplicación completa, programación y cálculo de duración.
- `tests/session.test.cjs`: aislamiento de RESET, cancelar, recarga, repetición, navegación y límites de duración.
- `manifest.webmanifest`, `sw.js`, `assets/icons/`: instalación y modo offline.
- `.github/workflows/pages.yml`: publicación automática.
- `docs/`: producto, diseño y justificación de programación.
