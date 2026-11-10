# Catálogo de fotos de consulta

Catálogo de referencia aportado por el usuario. Publicación autorizada expresamente por el usuario el 2026-11-04 junto con las correcciones móviles. Base: commit `1ffa4f1e124088913eb9c0989f21a372c2457eca`.

## Alcance y procedencia

El usuario indicó que su deportólogo le entregó las tres fotos en consulta y pidió incorporarlas a Setline y buscar GIFs. Se añadió un catálogo de referencia independiente de las rutinas. No se incorporan diagnósticos del usuario, series, repeticiones, cargas, descansos ni frecuencia; tampoco se traslada la dosificación impresa en el libro.

- `IMG_5502.jpeg`: página 159, figura 9.3a–c, 3 referencias.
- `IMG_5505.jpeg`: página 174, figuras 9.25a–d, 9.26a–b, 9.27 y 9.28, 8 referencias.
- `IMG_5508.jpeg`: página 179, figuras 9.36a–b, 9.37, 9.38a–b y 9.39a–c, 8 referencias.

El capítulo visible es «Shoulder pain: management», capítulo 9. No se ha identificado título/edición del libro. Las fotos se conservan sin editar y se visualizan por página completa para mantener el contexto. No se reconstruyen las figuras incompletas de las páginas adyacentes. Pantorrilla queda expresamente fuera del catálogo por ausencia de material.

El nombre de 9.26a se presenta como **Empuje escapular sobre antebrazos (elbow push-up)**, siguiendo su pie de figura; no como flexión convencional de codos. El empuje de serrato 9.26b se conserva según la imagen sin agregar una banda que no se distingue claramente.

## Variantes y registros

La pareja 9.3a/9.26b comparte postura; 9.3b/9.28 comparte elevación en pared pero muestra distinta resistencia. Se documentan como relacionadas, no como equivalencias confirmadas. No se identificaron duplicados exactos verificados con los cinco ejercicios activos de PhysioWods; tampoco se sustituyeron sus GIFs o IDs. La figura 9.28 no se equipara a «Retracciones con pared».

El catálogo no importa el código del entrenamiento ni usa `localStorage`. Todos los programas, valores por defecto y claves de registro permanecen intactos. La navegación es un enlace separado. El service worker conserva `catalog.html` y `index.html` en entradas distintas para evitar que una navegación al catálogo sobrescriba la interfaz de entrenamiento offline.

## Búsqueda de demostraciones y derechos

Revisión realizada el 2026-11-04. Se buscaron GIFs y demostraciones por postura y movimiento, incluyendo decúbito lateral, bandas elevadas, trabajo de serrato, pared/pelota y capturas. No se verificó un GIF con correspondencia y licencia suficientes para incorporarlo. La base de GIFs usada previamente por la app, [ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB), no mostró una licencia explícita de reutilización en su índice/README consultado. No se añadieron GIFs de esa base ni se convirtieron vídeos externos.

Se enlazan cinco demostraciones/ilustraciones de sus autores, sin copiar medios ni importar sus pautas:

| Referencia | Fuente | Correspondencia y límite |
| --- | --- | --- |
| 9.25a | [CSP / Physiotec](https://www.csp.org.uk/conditions/shoulder-pain/video-exercises-shoulder-pain) | Vídeo «Side lying external rotation», misma postura y movimiento. |
| 9.25b | [Estudio, figura 12](https://pubmed.ncbi.nlm.nih.gov/30797676/) | Ilustración de flexión anterior en decúbito lateral; no vídeo. |
| 9.25d | [Revisión, figura 9](https://pmc.ncbi.nlm.nih.gov/articles/PMC4827371/#fig9) | Ilustración de extensión prono; no vídeo. |
| 9.38a | [AAOS, ejercicio 7](https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program/) | Rotación externa con banda a 90°; confirmar ángulo respecto de la foto elevada. |
| 9.38b | [NISMAT, Shoulder IR at 90/90 Position](https://nismat.org/patient-care/patient-education/injury-prevention/exercise-programs/nismat-arm-care-program/) | Vídeo de rotación interna con banda y anclaje posterior; confirmar ángulo. La fuente indica todos los derechos reservados: solo enlace. |

Cornell Health también enumera vídeos coincidentes, pero los enlaces directos devolvieron 403 a la lectura; se eligieron fuentes alternativas accesibles. Otros resultados de pared, pelota y pliometría cambiaban apoyo, posición o patrón: no se mostraron como equivalentes. Las 14 referencias restantes indican expresamente ausencia de vídeo/GIF equivalente verificado y ofrecen la foto original.

Las imágenes del usuario son páginas fotografiadas de un libro aportadas para incorporar sus referencias. El usuario autorizó la publicación del catálogo. No se ha verificado una licencia externa del libro; las demostraciones de terceros se enlazan sin descargar ni transformar sus medios.

## Validación

`node --test tests/*.test.cjs`: 25 pruebas en el estado integrado, incluidas las regresiones de sesión y la trazabilidad del catálogo sin dosis.

`tests/catalog.browser.cjs`: prueba con Playwright y WebKit. Requiere Playwright disponible y un servidor local; admite `SETLINE_URL`, `SETLINE_QA_DIR` y `SETLINE_WEBKIT_EXECUTABLE`. Verifica 19 referencias; filtros por origen y avanzadas; búsqueda sin tildes; estado vacío y recuperación de error; fotos; foco y Escape; ausencia de controles de dosis; preservación del almacenamiento de entrenamiento; navegación/fotos offline; separación de los dos documentos en caché; anchos 320, 768, 1024 y 1440; acceso desde rutinas en móvil y escritorio. No se usa Chrome ni almacenamiento real del usuario.

Se inspeccionan visualmente las capturas de catálogo, visor móvil y accesos desde entrenamiento. Paleta slate/coral/mint y controles de 44 px acordes con el diseño existente. Veredicto: apto para el catálogo de referencia; no constituye una pauta clínica. El despliegue incluye explícitamente `catalog.html` y conserva las páginas de catálogo y entrenamiento separadas en caché.

## Corrección del 10 de noviembre: integración en Hombro

Las 19 fichas del médico ya no dependen de navegar al catálogo: están en el mismo listado principal que los cinco ejercicios de Ana y los seis del video nuevo. Se conservan las fotos originales y no se agregan dosis ni se alteran registros. Se verificaron GIFs para 9.25a–d y 9.26a; fuentes y diferencias en `assets/shoulder/doctor/sources.json`. Las 14 variantes restantes mantienen la foto original con «GIF pendiente», sin sustituirlas por otro movimiento.

Los seis GIFs del nuevo video se recortaron de UFuQ2SYwt68 a velocidad original y se revisaron visualmente en secuencias de fotogramas. Los tiempos y transformaciones están en `assets/shoulder/new-video/sources.json`. Todos incluyen póster, pausa, ampliación y respeto de movimiento reducido.
