# Setline

PWA personal para ejecutar y registrar rutinas de hipertrofia desde iPhone o Mac. Funciona sin backend: pesos, repeticiones, referencias y series completadas permanecen en el almacenamiento local de cada dispositivo.

La app abre primero **Hipertrofia 3–4 días** e incluye cargas iniciales estimadas para 174 cm / 74,4 kg. El selector **Light / Normal / Heavy** actualiza solo los pesos sugeridos; cualquier carga editada a mano se conserva. No existe una carga universal por talla y peso: estos valores son orientativos y deben ajustarse para cumplir el RIR de cada ejercicio.

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
