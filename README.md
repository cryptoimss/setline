# Setline

PWA personal para ejecutar rutinas desde iPhone o Mac, sin backend ni cuenta. Cuatro programas de fuerza y doce sesiones completas de **30–45 minutos estimados**: Vóley + gym, Hipertrofia 3–4 días, Pecho · prioridad y Calistenia. El usuario puede cortar antes.

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

## Hombro · tendinitis

Quinta pestaña con los cinco ejercicios de [PhysioWods — 5 ejercicios para tendón hombro](https://www.youtube.com/watch?v=coXs4giH5F4): retracciones con pared (7:48), retracciones con goma (9:35), ángeles (13:03), flexión con pica (14:59) y halo con peso (16:59). Cada ejercicio incluye un GIF local extraído del video original (10–16 s, velocidad original y sin audio), vista ampliada y control para pausar/reproducir. Con movimiento reducido se muestra una imagen fija inicialmente. El enlace al capítulo permite escuchar la explicación completa. Permite registrar repeticiones, checks y descanso. Los archivos y sus tiempos de origen están en `assets/shoulder/` y `sources.json`.

La transcripción del cierre (19:42–20:27) indica comenzar con **una serie de 10** y considerar una segunda si la primera semana va bien; la descripción propone dos series. La app usa el inicio más gradual del cierre: goma por brazo, halo con 5 vueltas por sentido. Frecuencia indicada: 2–3 días semanales con un día de descanso entre sesiones. El minuto de descanso es una propuesta de la app. La duración se estima con el mismo cálculo y no se fuerza a 30–45 minutos.

La selección debe acordarse con el fisioterapeuta. No hay RIR, presets de kilos ni objetivos de volumen en esta pestaña; el halo requiere especial valoración si hay molestias. El panel explica detener los movimientos dolorosos y enlaza también la [guía general de AAOS](https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program). El registro no mide recuperación clínica.

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
