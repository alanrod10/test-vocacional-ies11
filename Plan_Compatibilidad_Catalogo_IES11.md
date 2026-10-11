# Plan de compatibilidad para el catálogo oficial de tecnicaturas

## Hallazgo

La lista confirmada por coordinación contiene **18 Tecnicaturas Superiores vigentes**. El catálogo actual de la aplicación contiene 19 entradas porque incluye tanto **TS en Museología** como **TS en Museología y Gestión Patrimonial**. En la oferta confirmada aparece únicamente **Museología**, por lo que la segunda denominación no debe seguir como una carrera activa independiente.

## Principio de seguridad de datos

> Ningún registro histórico será borrado, reescrito ni recalculado de manera silenciosa.

Los 66 resultados existentes conservarán exactamente sus respuestas, resultado principal, instantánea de afinidades, fecha y versión de cuestionario. Esto permite conservar los reportes ya generados y revisar cómo funcionaba el catálogo anterior.

| Elemento | Registros históricos | Nuevos registros |
|---|---|---|
| Catálogo usado | `2026.08-legado-19` | `2026.08-oficial-18` |
| Número de perfiles | 19 | 18 |
| Museología | Conserva las dos denominaciones históricas donde hayan aparecido | Solo **TS en Museología** |
| Preguntas y códigos de respuesta | Se preservan sin cambios | Se mantienen iguales |
| Texto juvenil | Puede ser `2026.08-original` o `2026.08-redaccion-clara` | `2026.08-redaccion-clara` |
| Puntajes guardados | Se preservan tal como fueron calculados | Se calculan con el catálogo vigente de 18 perfiles |

## Cambios técnicos propuestos

Primero se añadirá una columna `Version_Catalogo` no destructiva en la base de datos. Todos los registros existentes recibirán automáticamente el valor `2026.08-legado-19`; las evaluaciones nuevas se guardarán como `2026.08-oficial-18`. La columna también se sumará al CSV, que pasará de 99 a 100 columnas, manteniendo el mismo separador de punto y coma y los mismos encabezados existentes.

Luego se sustituirá el catálogo activo por las 18 carreras confirmadas. Se retirará solo el perfil activo **TS en Museología y Gestión Patrimonial**; las otras 17 tecnicaturas se mantendrán sin modificar sus nombres ni vectores de afinidad. La aplicación continuará mostrando Top 3, perfiles, PDF, tarjeta social, QR y animaciones con la misma estructura.

El bloque de afinidades del CSV conservará sus 19 posiciones históricas para no romper los archivos ni tableros existentes. En registros nuevos, las posiciones `Afinidad_1` a `Afinidad_18` contendrán el ranking vigente y `Afinidad_19` quedará vacío. `Version_Catalogo` permitirá a Excel y BI interpretar correctamente ese espacio vacío, sin confundirlo con una falta de respuesta.

## Analítica y panel

El panel separará las lecturas según `Version_Catalogo`. Los resultados históricos podrán seguir consultándose como **catálogo legado de 19 perfiles**, mientras que las nuevas respuestas alimentarán el ranking de la oferta vigente de 18 carreras. No se deben sumar automáticamente ambas versiones en un mismo ranking de Museología, porque las dos denominaciones históricas tenían perfiles de afinidad distintos.

Si más adelante se necesita una serie única comparable, se podrá generar una **vista analítica recalculada**, claramente rotulada, que tome las respuestas originales y las puntúe de nuevo contra el catálogo oficial de 18. Esa vista será adicional y no reemplazará los resultados originales ni los informes ya entregados.

## Validaciones antes de publicar

| Validación | Criterio de aceptación |
|---|---|
| Migración | Solo agrega `Version_Catalogo`; no elimina ni cambia datos existentes. |
| Históricos | Las 66 evaluaciones conservan resultado, instantánea y versión `2026.08-legado-19`. |
| Nuevos resultados | Solo se pueden recomendar las 18 tecnicaturas oficiales. |
| CSV | Mantiene punto y coma, UTF-8/BOM y todas las columnas preexistentes; añade `Version_Catalogo`. |
| Analítica | No oculta resultados históricos ni mezcla rankings de catálogo distinto sin etiqueta. |
| Regresión | Pruebas automatizadas de motor, envío, exportación, analítica y TypeScript aprobadas. |

## Decisión requerida

La corrección propuesta usa la lista de 18 tecnicaturas entregada por coordinación como catálogo oficial vigente. Una vez aprobada, se aplicará el cambio de forma versionada y reversible, sin afectar la lectura de los 66 registros anteriores.
