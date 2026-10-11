# Evolución permanente — punto de partida protegido

## Decisión de arquitectura

El Test Vocacional IES N.° 11 queda separado en dos líneas con finalidades distintas. La instancia publicada en `vocatest11-j6zpasaq.manus.space` permanece como **archivo histórico de la Expo Educativa 2026**. La futura herramienta permanente deberá nacer desde un checkpoint de esta versión, pero en un proyecto independiente.

| Línea | Propósito | Estado | Datos | Cambios permitidos |
| --- | --- | --- | --- | --- |
| Archivo histórico | Conservar la experiencia de Expo Educativa 2026, sus resultados y su contexto. | Cerrado y en modo lectura. | Base histórica aislada. | Solo correcciones urgentes de seguridad o preservación. |
| Evolución permanente | Mejorar el instrumento y operar en futuros períodos institucionales. | Pendiente de crear desde este punto. | Base nueva e independiente. | Sí, con versionado, pruebas y aprobación institucional. |

## Regla de aislamiento obligatoria

La evolución debe recibir **un proyecto, dominio, base de datos, contraseña administrativa y almacenamiento de archivos propios**. No se deben copiar evaluaciones, nombres, apellidos, exportaciones CSV ni secretos del archivo histórico. Solo se reutilizan el código, el diseño, el motor de afinidades, las pruebas, las guías y la estructura documental.

> Un checkpoint del archivo histórico es la referencia técnica reproducible; no es una base de datos compartida. La nueva instancia empieza vacía y conserva trazabilidad propia desde su primera evaluación.

## Procedimiento para crear la nueva instancia cuando el IES N.° 11 lo decida

1. Seleccionar el checkpoint del archivo histórico que contiene el cierre verificado y crear un proyecto independiente desde ese punto.
2. Definir el nombre, dominio y responsable institucional de la instancia permanente.
3. Provisionar una base de datos nueva y generar secretos nuevos, incluido `ADMIN_ACTION_PASSWORD`; nunca duplicar credenciales históricas.
4. Desactivar el modo de archivo únicamente en la nueva instancia y ejecutar la suite de pruebas antes de abrir participación pública.
5. Definir las versiones iniciales de catálogo y cuestionario permanentes, manteniendo un registro de cambios metodológicos.
6. Ejecutar una validación pedagógica, de privacidad y de usabilidad móvil con un grupo piloto antes del lanzamiento.
7. Publicar la nueva instancia y conservar este archivo como referencia inmutable de la experiencia original.

## Mejoras propuestas para evaluar en la instancia permanente

| Prioridad | Propuesta | Condición antes de aplicarla |
| --- | --- | --- |
| Alta | Crear un ciclo anual de revisión de catálogo, perfiles y oferta formativa. | Confirmación formal de autoridades académicas. |
| Alta | Incorporar un protocolo de gobierno de datos: acceso, retención, respaldos y responsable. | Aprobación institucional y privacidad revisada. |
| Media | Realizar prueba piloto y análisis de comprensión de consignas antes de cada apertura. | Muestra piloto sin mezclar con registros productivos. |
| Media | Añadir una página metodológica pública de alcance y límites del resultado. | Revisión pedagógica del texto. |
| Media | Diseñar un tablero institucional de Power BI conectado a exportaciones anonimizada o agregadas. | Protección de acceso y supresión de grupos pequeños. |

## Condiciones de retorno

La instancia permanente no debe reemplazar el archivo histórico ni reutilizar su base de datos. Todo cambio funcional se desarrolla, prueba y publica en la instancia nueva. Si una mejora también fuera necesaria para conservar la seguridad del archivo, se documentará como una excepción y se creará un checkpoint específico antes de aplicarla.
