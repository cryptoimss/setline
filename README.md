# Setline

PWA personal para ejecutar rutinas desde iPhone o Mac, sin backend ni cuenta. Tres programas de fuerza y diez sesiones completas de **30–45 minutos estimados**: Hipertrofia 3–4 días, Pecho · prioridad y Calistenia. El usuario puede cortar antes.

La duración se calcula con las series reales, los descansos entre series, 6–8 minutos de calentamiento y un minuto por cambio de ejercicio. Incluye preparación y registro de cada serie, y ambos lados en los ejercicios unilaterales. No incluye esperas por máquinas; es una estimación, no una medición del entrenamiento. Consulta [la revisión de programación](docs/PROGRAMMING.md).

## Sesión actual y RESET

Pesos, repeticiones y checks se conservan automáticamente en `localStorage`, junto con programa/día seleccionado, filtro, preset, objetivos manuales, referencias previas, el descanso en curso y **Última vez**. No hay IndexedDB, backend, historial cronológico ni sincronización entre dispositivos. El service worker almacena la interfaz y GIFs en Cache Storage; no registra entrenamientos.

**RESET** vacía solo los pesos, reps y checks del día actual y detiene el temporizador. En escritorio está junto a los filtros; en el móvil, en la hoja de **Cambiar sesión** y en **Ajustes**; y en ambos, en la consola al terminar. Pide confirmación, permite cancelar y conserva los demás días, los objetivos manuales y las referencias de volumen previas. No crea ni reemplaza referencias al resetear. Los pesos de **Última vez** o, si no los hay, las cargas sugeridas vuelven a aparecer como valores iniciales.

**Última vez** recuerda el peso y las reps de cada serie marcada, al marcarla y no al resetear: guarda la última y la anterior; mientras una serie está marcada hoy, muestra la anterior, y al resetear pasa a mostrar la de hoy. Desmarcar o **Deshacer** la deja como estaba antes de marcar. Con ella, la app propone el punto de partida de la sesión y calcula la referencia de volumen solo si el ejercicio se completó entero. Las series marcadas antes de esta función se incorporan al abrir la app. Lo que se marcó y después se resetea sigue contando como última vez.

La sesión se puede registrar entera desde la **consola**, sin teclado ni desplazarse: al pie en el móvil, fija en la columna derecha en escritorio. Muestra la serie actual con pasos de peso (1 kg hasta 10 kg, 2,5 kg después) y reps, y **Hecha** la registra y arranca el descanso. Lo que se ve es lo que se guarda. En móvil, tocar kilos o reps de una fila lleva esa serie a la misma barra inferior de **kg, reps y Hecha**, sin modal ni teclado. Los botones −/+ actualizan sus valores al instante; **Cerrar** o Escape vuelve a la serie en curso o al descanso sin marcarla como hecha. El botón aparece tanto al tocar una fila como un número de la propia barra. Para una serie ya hecha, **Listo** termina la corrección sin volver a marcarla. En escritorio se mantiene la edición directa. El descanso ofrece −15/+15, pausa, **Saltar** y **Deshacer**; sobrevive a recargas y no se inicia tras la última serie. Al acabar, la consola se vuelve coral y vuelve a la siguiente serie. Mientras dura la sesión la pantalla se mantiene encendida si el navegador lo permite (hasta 10 minutos desde la última acción).

Solo el ejercicio actual está desplegado; los demás se abren con un toque. **Hacer ahora** está visible en la cabecera de cada ejercicio pendiente, incluso plegado: permite empezar por cualquiera si una máquina está ocupada, termina el descanso anterior y conserva pesos, reps y series hechas al cambiar o recargar. Cambiar el peso de una serie lo traslada a las siguientes sin terminar, salvo las que tengan un peso propio; corregir una serie ya hecha no traslada nada. Marcar directamente una fila conserva los datos conocidos; si es un rango sin dato previo, queda marcada sin inventar reps y mantiene la fila disponible para editar. Completar desde una fila o la consola cierra cualquier editor activo y no enfoca campos ni abre el teclado. Para editar, se toca explícitamente el número; la barra trabaja sobre esa serie, aunque ya esté hecha, sin cambiar el ejercicio en curso. El tiempo de descanso sigue visible y contando durante la corrección; si está pausado, se indica. Al cerrar vuelven los controles del descanso y los cambios de kilos/reps se conservan. **Hecha** registra la serie seleccionada; cambiar de sesión o marcar una fila libera la selección. Cada ejercicio muestra siempre su GIF: grande en el ejercicio abierto y en miniatura en los demás, y un toque lo amplía. La explicación, el enlace al video y el objetivo opcional quedan en **Técnica**, cerrada de entrada. La interfaz no incluye textos explicativos: es una herramienta personal, y las pautas viven en este documento y en `docs/`. Al terminar, la consola indica **Sesión completa**, el resumen, **Próxima** sesión y **RESET**. Una sesión registrada otro día se avisa arriba. Los accesos para iniciar Apple Watch fueron retirados.

## Programas

- **Hipertrofia 3–4 días:** 14–15 series por sesión, con cuarto día complementario opcional. Se elige como programa de la semana, sin acumular otros planes encima.
- **Pecho · prioridad:** A/B de gimnasio o Casa como sustitución. Cada sesión tiene 7 series de pecho, 3 de espalda y 2 de hombros. Dos por semana suman 14 series directas de pecho; no se duplican con otros planes.
  - **Pecho + hombro · fuerza (H):** alternativa a A/B, con 6 series de pecho, 3 de remo, 2 de rotación externa con mancuerna y 2 de curl con los brazos al costado. Son 13 series, unos 37–42 minutos, con registro de kilos y GIFs. Deja 48–72 h entre sesiones de torso; esta sesión sustituye una existente y cuenta también el trabajo de otras rutinas de hombro/bíceps. Las cargas se calibran manualmente y se recuperan de **Última vez**: no se asigna un peso genérico ni se muestran Light/Normal/Heavy. Mantén 3 reps en reserva en presses/remo y 3–4 en rotación/curl. Sube reps antes que kilos, y el menor salto de peso solo tras dos sesiones en el máximo sin empeorar esa noche ni al día siguiente. Detén el movimiento si duele y reduce carga, recorrido o series si empeoran los síntomas. La selección y dosis son una propuesta general para revisar con el fisioterapeuta, no un tratamiento individual de la tendinopatía del bíceps proximal. [Criterios y fuentes](docs/PROGRAMMING.md#pecho--hombro-con-carga).
  - **Pecho · extra (EX):** sesión opcional con 30 variantes de presses, aperturas, flexiones y fondos, cada una con GIF y registro independiente. Usa **Hacer ahora** para elegir movimientos; es un repertorio de alternativas, no una indicación de hacerlos todos juntos ni de sumar sus 60 series a A/B. La duración muestra el cálculo del repertorio completo y queda fuera del objetivo de 30–45 minutos y de la rotación automática A/B. No pretende enumerar todas las variantes posibles.
- **Calistenia:** A/B de 15 series, movimientos de cuerpo completo y descansos de 60–90 segundos. Se registran reps, sin kilos ficticios.

La progresión conserva el RIR prescrito: sube reps, y tras alcanzar el máximo con buena técnica en dos sesiones, aumenta el menor salto de carga disponible o la dificultad de la variante. Las alternativas sustituyen ejercicios, no añaden series. No compares cargas o referencias entre máquinas/variantes distintas.

La app abre primero Hipertrofia. Light / Normal / Heavy son sugerencias orientativas; las cargas manuales prevalecen y el RIR calibra el peso. No existe una carga universal por talla o peso. Los movimientos con presets, incluido Pecho · extra, tienen una sugerencia inicial acorde a ejercicios equivalentes del plan: no es un promedio poblacional. En mancuernas se registra kg por mancuerna y en poleas bilaterales kg por lado; barra y Smith usan el total según Técnica. El ejercicio mixto de dominada asistida/lastrada o jalón mantiene la carga manual porque asistencia, lastre y jalón no comparten el mismo significado de kg.

Vóley + gym se retiró del selector. Al abrir un estado que tenía ese programa seleccionado, la app pasa a Hipertrofia; conserva entradas, referencias y **Última vez** antiguas sin mezclarlas con sesiones nuevas.

## Hombro · tendinitis

Programa con los cinco ejercicios de [PhysioWods — 5 ejercicios para tendón hombro](https://www.youtube.com/watch?v=coXs4giH5F4): retracciones con pared (7:48), retracciones con goma (9:35), ángeles (13:03), flexión con pica (14:59) y halo con peso (16:59). Cada ejercicio incluye un GIF local extraído del video original (10–16 s, velocidad original y sin audio), vista ampliada y control para pausar/reproducir. Con movimiento reducido se muestra una imagen fija inicialmente. El enlace al capítulo permite escuchar la explicación completa. Permite registrar repeticiones, checks y descanso. Los archivos y sus tiempos de origen están en `assets/shoulder/` y `sources.json`.

La transcripción del cierre (19:42–20:27) indica comenzar con **una serie de 10** y considerar una segunda si la primera semana va bien; la descripción propone dos series. La app usa el inicio más gradual del cierre: goma por brazo, halo con 5 vueltas por sentido. Frecuencia indicada: 2–3 días semanales con un día de descanso entre sesiones. El minuto de descanso es una propuesta de la app. La duración se estima con el mismo cálculo y no se fuerza a 30–45 minutos.

La selección debe acordarse con el fisioterapeuta. No hay RIR, presets de kilos ni objetivos de volumen en esta pestaña; el halo requiere especial valoración si hay molestias, y su nota está en **Técnica**. Ante un movimiento doloroso, detenerlo. Referencia general: [guía de AAOS](https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program). El registro no mide recuperación clínica.

## Fotos de consulta · catálogo de referencia

El acceso **Referencias de hombro** abre `catalog.html` desde escritorio o móvil. Contiene 19 referencias identificadas en las tres fotos aportadas por el usuario, con página/figura, búsqueda, filtros, visor de la página original y enlaces a demostraciones cuando se verificó el movimiento. Las figuras 9.39a–c se marcan como avanzadas para confirmar con el deportólogo. Pantorrilla queda pendiente: no aparece en estas fotos.

Este catálogo es de consulta: no crea rutinas, no asigna dosis y no lee ni escribe el estado de entrenamiento. Conserva los programas, sus IDs y la clave de almacenamiento. Las fotos y el catálogo están disponibles offline tras la primera carga con conexión; los enlaces externos requieren conexión. Las variantes relacionadas se identifican sin fusionarlas. Consulta [procedencia y revisión](docs/CONSULTATION.md).

## Instalar en iPhone

Abre la web en Safari → Compartir → Añadir a pantalla de inicio. La opción **Instalar Setline** está en **Cambiar sesión**, y nunca aparece un aviso sin pedirlo. La PWA ofrece **Actualizar** cuando detecta una nueva versión y conserva los registros locales y el descanso en curso.

## Desarrollo y pruebas

```bash
python3 -m http.server 8080
node --test tests/*.test.cjs
SETLINE_URL=http://localhost:8080 node tests/session.browser.cjs
```

Abre `http://localhost:8080`. `tests/session.browser.cjs` requiere Playwright con WebKit y admite `SETLINE_QA_DIR`, `SETLINE_WEBKIT_EXECUTABLE` y `SETLINE_ONLY`. Las pruebas usan datos sintéticos y no acceden al almacenamiento del usuario. El flujo de publicación existente despliega GitHub Pages al enviar cambios a `main`; no publiques sin autorización.

## Estructura

- `index.html`: aplicación completa, programación y cálculo de duración.
- `tests/session.test.cjs`: aislamiento de RESET, cancelar, recarga, repetición, navegación, límites de duración, Última vez y pasos de la consola.
- `tests/session.browser.cjs`: flujos de gimnasio en WebKit con tamaño de iPhone (sesión completa desde la consola, descanso, RESET y Última vez, datos anteriores, máquina ocupada, anchos y objetivos táctiles).
- `manifest.webmanifest`, `sw.js`, `assets/icons/`: instalación y modo offline.
- `.github/workflows/pages.yml`: publicación automática.
- `docs/`: producto, diseño y justificación de programación.

## Video de movilidad · referencias, sin rutina añadida

La biblioteca **Referencias de hombro** incorpora seis movimientos suaves del video https://www.youtube.com/watch?v=UFuQ2SYwt68, identificados mediante su transcripción automática: elevaciones lateral (1:36) y frontal (2:50), brazo hacia atrás (3:28), retracción (3:55) y protracción escapular (5:00), y rotación cervical suave (7:15). Cada ficha abre su momento del original. Son referencias sin dosis y no reemplazan ni amplían automáticamente la sesión de PhysioWods/Ana Galeote. La selección requiere valoración individual. No se incluyen tracción, presión clavicular ni elevaciones rápidas atravesando dolor. Se extrajeron seis GIFs de estos movimientos; no se altera el almacenamiento del entrenamiento.

## Hombro: todo en la pantalla de ejercicios

Los cinco ejercicios de Ana conservan sus IDs y registros. Los seis movimientos del video nuevo y las 19 referencias del médico aparecen ahora en tarjetas del mismo listado de Hombro, con navegación visible por origen, imágenes ampliables y GIFs cuando se verificó la correspondencia. Las tarjetas añadidas no asignan dosis ni cambian el cómputo de la sesión existente. Los GIFs se pueden pausar y comienzan con póster si el sistema solicita movimiento reducido. Las fotos originales siguen disponibles para las variantes sin GIF verificado; no se sustituye una variante por otra parecida.

Prueba específica: `SETLINE_URL=http://localhost:8080 node tests/shoulder-unified.browser.cjs`. Usa datos sintéticos, verifica 5 tarjetas existentes y 25 añadidas en la misma pantalla, controles, imágenes, estados y anchos móviles/escritorio.

### GIFs médicos, segunda revisión
Se añaden demostraciones verificadas de elevación bilateral con banda (9.27; mini-band cerrada en lugar de tira abierta) y diagonal externa (9.36b). Hay siete GIFs médicos y seis del video nuevo. Las doce variantes médicas restantes conservan su foto original, sin sustituirlas por movimientos parecidos.

## Pestaña Guía hombro
La navegación principal incluye **Entrenar** y **Guía hombro**. `guide.html` presenta cuatro opciones para revisar con el profesional: remo con banda, rotación externa isométrica, referencia escapular de la figura 9.25d y curl opcional si tolera carga. No establece diagnóstico, superioridad, dosis ni nueva rutina. Incluye GIFs revisados, fuentes, control de reproducción y movimiento reducido; no escribe en el almacenamiento del entrenamiento. Fuentes de medios en `assets/shoulder/guide/sources.json`. Comprobación: `node --test tests/guide.test.cjs` y `SETLINE_URL=http://localhost:8098/ node tests/guide.browser.cjs` con Playwright/WebKit.

## Corrección: Hombro como entrenamiento integrado
**Entrenar hombro** abre ahora el programa `shoulder-focus` desde el inicio, en la misma interfaz de series/GIFs/consola. Acceso directo: `index.html?program=shoulder-focus`; el antiguo `guide.html` redirige ahí. Tres ejercicios principales; curl en sesión opcional aparte. Las filas iniciales son espacios de registro, no una dosis: no se proponen reps, cargas ni descanso automático. Se pueden añadir filas con **Añadir serie al registro**; `freeSetCounts` conserva su número y las entradas siguen usando IDs independientes, sin alterar rutinas anteriores. Se registran contracciones (no segundos) para el isométrico. Su GIF se cambió por una vista lateral/frontal clara, con explicación visible de presión sin movimiento. Las recomendaciones clínicas permanecen generales y no sustituyen la pauta del profesional.

### Acceso simplificado
Se retiraron la barra añadida **Gym / Entrenar hombro** y el bloque de navegación de la sesión. La rutina se abre con el selector ya existente: tocar el nombre de la sesión arriba → **Hombro · sesión** → **Hombro · base**. **Curl · opcional** aparece como día opcional en ese mismo selector. No se eliminaron programas ni registros. Los enlaces anteriores siguen redirigiendo para no romperlos.
