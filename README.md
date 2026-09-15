# Setline

PWA personal para ejecutar y registrar rutinas de hipertrofia y calistenia desde iPhone o Mac. Funciona sin backend: pesos, repeticiones, series completadas y referencias automáticas de la sesión anterior permanecen en el almacenamiento local de cada dispositivo.

La sesión marca la siguiente serie pendiente, pliega cada ejercicio al completarlo y termina con un panel para guardar referencias. En móvil usa una barra compacta con selector de programa, sesiones desplazables y acceso directo al Watch. El temporizador se mantiene pequeño cuando está inactivo y se expande durante el descanso. La identidad instalada usa una mancuerna coral y menta.

La app abre primero **Hipertrofia 3–4 días** e incluye cargas iniciales estimadas para 174 cm / 74,4 kg. El selector **Light / Normal / Heavy** actualiza solo los pesos sugeridos; cualquier carga editada a mano se conserva. No existe una carga universal por talla y peso: estos valores son orientativos y deben ajustarse para cumplir el RIR de cada ejercicio.

**Calistenia 20 min** añade dos sesiones A/B de iniciación para alternar 2–3 veces por semana. Sus ejercicios se registran por repeticiones, sin pedir kilos ficticios, y comparan el total con la última sesión completa del mismo movimiento.

**Pecho · prioridad** añade dos sesiones A/B de 30–40 minutos, con 7 series cada una, descansos, demostraciones y registro de cargas. Haz cada sesión una vez por semana con 48–72 h entre ellas, sustituyendo el trabajo de pecho de los otros programas. Incluye press inclinado, press en máquina y aperturas, con 1–2 repeticiones en reserva y doble progresión. La navegación móvil muestra los cuatro programas en dos filas. Referencia general de programación: [guías ACSM 2026](https://acsm.org/resistance-training-guidelines-update-2026/).

## Instalar en iPhone

1. Abre la web publicada en Safari.
2. Toca **Compartir**.
3. Elige **Añadir a pantalla de inicio**.
4. Abre Setline desde el nuevo icono.

## Actualizaciones

Cada cambio enviado a `main` se publica automáticamente mediante GitHub Pages. La PWA detecta una nueva versión, muestra **Actualizar** y conserva los registros locales.

## Apple Watch y Salud

El botón **Watch** de la navegación ejecuta un atajo de iOS llamado `Setline Fuerza`. Usa `x-callback-url` para volver automáticamente a Setline cuando termina.

1. Crea el atajo `Setline Fuerza` en la app Atajos.
2. Añade **Iniciar entrenamiento**.
3. Selecciona **Fuerza tradicional**.

Por seguridad, iOS abre Atajos brevemente: una web/PWA no puede ejecutar un atajo de forma totalmente invisible. La web no lee HealthKit directamente; las métricas en vivo provienen del entrenamiento del Apple Watch.

## Desarrollo local

Sirve la carpeta por HTTP para probar el service worker:

```bash
python3 -m http.server 8080
```

Después abre `http://localhost:8080`.

## Estructura

- `index.html`: aplicación completa.
- `manifest.webmanifest`: metadatos de instalación.
- `sw.js`: modo offline y actualización.
- `assets/icons/`: iconos de la PWA.
- `.github/workflows/pages.yml`: publicación automática.
- `docs/`: definición de producto y sistema visual para futuras mejoras.

**Pecho en casa** es una alternativa de 7 series dentro de Pecho: press con mancuernas en el suelo (3×8–15), flexiones (1×6–15), flexiones con manos elevadas (1×10–20) y press sentado con elástico (2×12–20). Reemplaza A o B, conservando 14 series en el plan semanal. El press registra kg por mancuerna; flexiones y banda registran reps. No requiere banco ni anclaje externo. Selección de movimientos apoyada en la [guía de pecho de ACE](https://www.acefitness.org/resources/pros/expert-articles/8972/be-a-chest-day-champion-an-evidence-based-approach-to-training-the-chest/).

La variante con manos elevadas requiere un apoyo firme, sin desplazamiento ni hundimiento; si el asiento acolchado no cumple, se usa la pared. El press en el suelo incluye un [GIF de demostración de Make a GIF](https://makeagif.com/gif/how-to-dumbbell-floor-press-gF8Nwb), con ampliación dentro de la app.
