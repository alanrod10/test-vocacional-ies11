# Investigación para el rediseño del test vocacional

## Fuentes consultadas

| Fuente | URL | Aporte al rediseño |
|---|---|---|
| O*NET Interest Profiler Manual | https://www.onetcenter.org/reports/IP_Manual.html | Documento oficial sobre escalas RIASEC, creación de ítems, confiabilidad, validez y relación con ocupaciones. |
| 18REST: medida breve RIASEC | https://link.springer.com/article/10.1186/s41155-018-0086-z | Evidencia sobre la construcción y el uso de una medida breve de intereses en contextos educativos y vocacionales. |

## Hallazgos confirmados

El manual oficial del O*NET Interest Profiler describe un inventario de intereses para planificación educativa, exploración y orientación de carrera. Su base es el modelo RIASEC: **Realista, Investigativo, Artístico, Social, Emprendedor y Convencional**. El manual aborda por separado creación de ítems, confiabilidad, validez y el vínculo entre perfiles de intereses y ocupaciones.

La investigación sobre 18REST diferencia los intereses de la inteligencia, los rasgos y los valores: los intereses describen con mayor precisión **qué actividades** prefiere realizar una persona. El artículo también resume la relevancia del ajuste persona-entorno de interés para el aprendizaje y la satisfacción. El resultado debe presentarse como una guía de exploración, no como una decisión obligatoria.

## Criterios aplicables al IES N.° 11

| Criterio | Aplicación en el nuevo instrumento |
|---|---|
| Cobertura equilibrada | Incluir escenarios para las seis dimensiones, sin asociar intereses a sexo, edad u origen. |
| Conductas observables | Preguntar por actividades que la persona elegiría realizar, evitando autocalificaciones genéricas. |
| Opciones comparables | Mantener cuatro alternativas concretas, igualmente deseables y de extensión similar. |
| Perfil multidimensional | Calcular un vector RIASEC y comparar su proximidad con el perfil de cada tecnicatura. |
| Devolución responsable | Informar afinidad, áreas cercanas y próximos pasos de exploración; evitar afirmaciones de certeza vocacional. |

## Auditoría de la matriz actualmente implementada

El análisis automático de los 10 ítems actuales muestra una cobertura desigual. Algunas tecnicaturas participan en **8** preguntas y reciben hasta **20** puntos posibles, mientras que otras aparecen solo en **4** preguntas y alcanzan entre **9 y 10** puntos. Esta asimetría favorece resultados de Enfermería, Administración en Servicios de Salud, Ciencias de Datos e Inteligencia Artificial y Hotelería, incluso cuando la preferencia del participante es menos concluyente.

| Hallazgo | Rango observado | Riesgo de interpretación | Decisión de rediseño |
|---|---:|---|---|
| Cobertura por preguntas | 4 a 8 preguntas por tecnicatura | Carreras con más apariciones ganan por exposición, no necesariamente por afinidad. | Todas las tecnicaturas recibirán un perfil de seis dimensiones y se compararán bajo la misma escala. |
| Puntos máximos | 9 a 20 puntos por tecnicatura | El máximo diferente invalida una comparación directa de puntajes brutos. | Se utilizará similitud normalizada entre perfil de respuesta y perfil ocupacional. |
| Tipo de reactivo | Mezcla de gustos, roles y contextos | Ítems con una temática demasiado obvia pueden inducir respuestas por estereotipo o conocimiento previo. | Se formularán escenarios de actividad comparables y menos orientados por el nombre de la carrera. |

## Decisión de puntuación final

El nuevo modelo combina dos capas normalizadas. La primera pondera en un **55%** la semejanza entre el perfil RIASEC de las respuestas y el perfil de actividades de cada tecnicatura. La segunda pondera en un **45%** señales concretas de tarea distribuidas en los escenarios; esas señales se normalizan por la cantidad de oportunidades que cada tecnicatura tiene de aparecer. Así, una carrera no obtiene ventaja por estar nombrada más veces en la matriz. Esta segunda capa resuelve especialmente afinidades próximas —por ejemplo, Turismo, Hotelería y Guía de Turismo; o Museología, Gestión Patrimonial y Diseño— sin convertir una respuesta aislada en una recomendación determinante.

La devolución mostrará la afinidad como una escala comparativa de 0 a 100 y conservará tres alternativas cercanas. No interpreta el resultado como capacidad, personalidad, sexo, edad ni decisión irreversible.
