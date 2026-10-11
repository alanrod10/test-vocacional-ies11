# Auditoría integral — borrador de hallazgos

## Alcance y criterio

Esta auditoría revisa el Test Vocacional IES N.° 11 sin modificar aún su comportamiento. Los hallazgos se clasifican por prioridad para que cualquier ajuste posterior preserve el cuestionario, la trazabilidad histórica y la privacidad.

## Hallazgos visuales iniciales

| Prioridad preliminar | Hallazgo | Impacto | Propuesta para decisión posterior |
|---|---|---|---|
| Media | La portada es clara y usable en escritorio y móvil, pero su estética se percibe como una interfaz educativa genérica. | No afecta la operación, pero debilita el recuerdo de marca en un stand. | Consolidar una identidad de Expo Educativa con un sistema gráfico propio de IES N.° 11, sin rediseñar el flujo. |
| Baja | En móvil, la explicación de consentimiento y el texto del pie concentran bastante contenido en tamaños pequeños. | Puede exigir más atención de la deseable en una situación de feria. | Simplificar la redacción auxiliar y mejorar la jerarquía tipográfica sin eliminar información de privacidad. |
| Baja | El bloque de QR funciona bien y es visible, aunque el enlace de apoyo es pequeño frente a otros controles táctiles. | Impacto menor para visitantes que no escanean de inmediato. | Reforzar el enlace complementario o convertirlo en un botón secundario claro. |

## Confirmaciones visuales

La portada conserva buena legibilidad, jerarquía de acción, contraste institucional, disposición móvil de una sola columna y un formulario de tamaño táctil adecuado. No se observaron superposiciones, recortes ni contenido inaccesible en las resoluciones revisadas.

## Hallazgos funcionales preliminares

La exportación actual reconstruye el texto de cada respuesta a partir de la versión vigente de las preguntas. Como existe una `Version_Cuestionario`, la exportación histórica debería consultar un catálogo de preguntas por versión para evitar que el texto exportado de los registros anteriores se muestre con la redacción reciente. Los códigos de opción y puntajes permanecen comparables, pero el texto explicativo puede perder fidelidad histórica si no se versiona.

La analítica dirige cualquier versión de catálogo distinta de la vigente hacia la vista histórica. Esto funciona para las dos versiones actuales, pero una futura versión necesitaría una regla explícita para evitar clasificarla accidentalmente como legado.

## Verificación de datos y trazabilidad

La verificación agregada de la base confirma 69 evaluaciones: 66 con cuestionario original y 3 con redacción clara; todas pertenecen todavía al catálogo histórico de 19 tecnicaturas. Cada una conserva 14 respuestas y 19 afinidades almacenadas. La estructura está íntegra y la falta de evaluaciones con el catálogo oficial de 18 es esperable: la versión vigente comenzará a registrar datos a partir de la próxima participación.

## Hallazgos priorizados

| Prioridad | Hallazgo | Riesgo u oportunidad | Solución propuesta, sin alterar la historia |
|---|---|---|---|
| Alta | El texto de opciones en el CSV se reconstruye siempre con `QUESTIONS`, que hoy corresponde a la redacción clara. | Un registro original puede exportarse con el texto nuevo de la misma opción; los códigos y puntajes siguen bien, pero se pierde fidelidad documental del texto originalmente visto. | Crear un catálogo inmutable de preguntas por `Version_Cuestionario` y usarlo al generar las columnas `P##_Texto`. Mantener los mismos códigos de opción. |
| Alta | El reinicio borra evaluaciones de forma definitiva y no existe una copia de seguridad de aplicación obligatoria. | Un error operativo con la contraseña no puede revertirse desde la base. | Exigir descarga o generación de una copia CSV antes del reinicio, mostrar la cantidad exacta a borrar y agregar un registro administrativo mínimo del reinicio. |
| Media | La exportación y el reinicio dependen de una contraseña compartida, sin limitación explícita de intentos ni bitácora. | Una contraseña débil o filtrada expone CSV identificable y el borrado completo. | Agregar limitación de intentos por IP y operación, demora progresiva y un registro sin contraseñas de exportaciones/reinicios. |
| Media | Las versiones no reconocidas de catálogo se agrupan por defecto en la vista histórica. | Una futura versión podría contaminar la lectura histórica sin que el panel lo advierta. | Usar una lista explícita de versiones admitidas y mostrar una vista “versión no clasificada” hasta que se configure. |
| Media | El modelo conserva la columna heredada `discoverySource`, aunque el formulario ya no la recopila ni se exporta. | No genera una falla actual, pero aumenta deuda de esquema y puede inducir confusión en futuras consultas. | Programar una migración de limpieza después de un respaldo y de verificar que no contiene información útil. |
| Media | La fuente institucional configurada aún incluye una nota externa que hablaba de 19 tecnicaturas, mientras la oferta activa ya declara 18. | Puede inducir dudas si se consultan enlaces desde la documentación. | Reemplazar o contextualizar esa fuente por una lista oficial actualizada de las 18 ofertas. |
| Baja | La auditoría de reducción de movimiento está cubierta por una prueba de presencia de clases, no por una comprobación de renderizado de usuario. | Una futura refactorización de estilos podría degradar la accesibilidad sin que la prueba lo detecte. | Añadir una prueba visual o de navegador que active `prefers-reduced-motion` y confirme que el contenido sigue visible. |
| Baja | El consentimiento, el QR secundario y el pie usan tipografía pequeña en móvil. | Lectura más lenta en la dinámica rápida de un stand. | Aumentar ligeramente el tamaño y el interlineado, y convertir el enlace de QR en un control secundario táctil. |
| Baja | La portada es funcional, pero no tiene todavía un sistema visual plenamente distintivo de Expo Educativa / IES N.° 11. | Menor recordación de marca, no una falla de uso. | Crear una capa visual institucional-futurista discreta con motivos de recorrido, datos y señalética educativa. |

## Controles que se encuentran bien resueltos

El servidor valida rango y cantidad de respuestas, impide una evaluación completamente neutral, protege exportación y reinicio con contraseña, escapa valores de CSV contra fórmulas de hoja de cálculo y muestra analítica agregada. El cuestionario conserva los mismos códigos de opción tras la simplificación lingüística, por lo que los resultados siguen siendo comparables. El catálogo vigente de 18 quedó separado de la serie histórica de 19, evitando la reescritura de resultados anteriores.

## Orden recomendado de mejora

1. Preservar el texto histórico de las respuestas exportadas por versión de cuestionario.
2. Añadir resguardo previo y bitácora para acciones administrativas irreversibles.
3. Endurecer intentos de contraseña y clasificar explícitamente versiones futuras.
4. Limpiar la columna heredada y la lista de fuentes una vez realizado el respaldo.
5. Refinar accesibilidad móvil y distintividad visual como mejora de experiencia.
