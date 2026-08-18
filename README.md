# Setline

PWA personal para ejecutar y registrar rutinas de hipertrofia desde iPhone o Mac. Funciona sin backend: pesos, repeticiones, referencias y series completadas permanecen en el almacenamiento local de cada dispositivo.

## Instalar en iPhone

1. Abre la web publicada en Safari.
2. Toca **Compartir**.
3. Elige **Añadir a pantalla de inicio**.
4. Abre Setline desde el nuevo icono.

## Actualizaciones

Cada cambio enviado a `main` se publica automáticamente mediante GitHub Pages. La PWA detecta una nueva versión, muestra **Actualizar** y conserva los registros locales.

## Apple Watch y Salud

El botón **Iniciar en Apple Watch** ejecuta un atajo de iOS llamado `Setline Fuerza`.

1. Crea el atajo `Setline Fuerza` en la app Atajos.
2. Añade **Iniciar entrenamiento**.
3. Selecciona **Fuerza tradicional**.

La web no lee HealthKit directamente. Las métricas en vivo provienen del entrenamiento del Apple Watch.

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
