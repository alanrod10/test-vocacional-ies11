# CSV analítico y tableros del Test Vocacional IES N.° 11

## Conclusión ejecutiva

La exportación privada del Test Vocacional IES N.° 11 utiliza un formato **tabular de 100 columnas**, directamente importable en Excel, Power BI, Looker Studio o Tableau. Los dos campos JSON de la versión anterior, `Respuestas` y `Afinidades`, ya no aparecen en el archivo descargado. En su lugar, cada una de las 14 respuestas y cada dato de afinidad ocupa su propia columna.

La base de datos conserva las respuestas y el cálculo de afinidades como estructuras canónicas, lo que permite mantener el funcionamiento del test sin una migración riesgosa. La descarga protegida convierte ese detalle en columnas analíticas para que el trabajo posterior no dependa de transformaciones manuales de JSON.

| Bloque del CSV | Cantidad de columnas | Uso principal |
|---|---:|---|
| Identificación, fecha, versiones y contexto | 15 | Depuración privada, segmentación institucional y tendencias temporales |
| Respuestas del cuestionario | 28 | Análisis por pregunta, opción seleccionada y respuesta neutral |
| Afinidades calculadas | 57 | Ranking completo, presencia Top 3 y comparación de puntajes |
| **Total** | **100** | Fuente tabular privada para análisis y dashboards |

> La descarga completa mantiene nombres y apellidos porque es una herramienta institucional protegida por contraseña. Todo tablero público debe excluir identificadores y mostrar únicamente resultados agregados.

## Estructura de columnas

### Datos de evaluación y contexto

| Columna | Contenido | Uso recomendado |
|---|---|---|
| `ID` | Identificador interno de la evaluación | Depuración privada y relación entre tablas derivadas |
| `Fecha_UTC` | Fecha y hora de creación en UTC | Auditoría y análisis técnico de series de tiempo |
| `Fecha_Argentina_Jujuy` | Fecha y hora local de Jujuy, con desplazamiento UTC-3 | Tendencias diarias y análisis horario del stand |
| `Version_Cuestionario` | Identificador de la redacción vigente al completar el test | Trazabilidad y comparación de registros históricos y nuevos |
| `Version_Catalogo` | Identificador de la oferta de tecnicaturas usada para calcular la afinidad | Separar el catálogo histórico de 19 carreras del catálogo oficial vigente de 18 |
| `Nombre`, `Apellido` | Datos identificatorios | Mantener solo en la copia institucional privada |
| `Edad`, `Sexo`, `Localidad`, `Situacion_Educativa` | Contexto declarado por la persona | Segmentar con resguardo de muestras pequeñas |
| `Consentimiento_Datos` | Confirmación de uso institucional | Control de calidad y cumplimiento del criterio de consentimiento |
| `Intencion_Estudiar_IES11` | Respuesta de interés institucional | Indicador de interés y seguimiento general |
| `Tecnicatura_Recomendada`, `Area` | Primera afinidad y su área | Ranking principal y distribución de áreas |

### Respuestas: 14 pares de columnas

Cada pregunta aparece en dos columnas, desde `P01_Opcion` y `P01_Texto` hasta `P14_Opcion` y `P14_Texto`.

| Columna | Tipo | Interpretación |
|---|---|---|
| `Pxx_Opcion` | Número entero desde 1 | Posición de la alternativa elegida en la pregunta `xx` |
| `Pxx_Texto` | Texto | Redacción exacta de la alternativa elegida |

El código de opción es **uno basado**, es decir, la primera alternativa se registra como `1`. Este criterio es más natural para filtros y tablas dinámicas. El texto asociado permite analizar las elecciones sin consultar el cuestionario por separado. Cuando la persona elige la alternativa neutral, el texto exportado identifica explícitamente esa decisión.

> Los registros históricos conservan la versión `2026.08-original` y los nuevos registros creados con redacción simplificada usan `2026.08-redaccion-clara`. Los códigos `Pxx_Opcion`, el orden de las preguntas, las alternativas y sus ponderaciones mantienen la misma equivalencia; para series comparables, usar los códigos y las afinidades como fuente analítica, y dejar `Pxx_Texto` como apoyo de lectura.

### Afinidades: ranking versionado de tecnicaturas

| Puesto | Carrera | Puntaje | Área |
|---|---|---|---|
| Primera | `Afinidad_1_Carrera` | `Afinidad_1_Puntaje` | `Afinidad_1_Area` |
| Segunda | `Afinidad_2_Carrera` | `Afinidad_2_Puntaje` | `Afinidad_2_Area` |
| Tercera | `Afinidad_3_Carrera` | `Afinidad_3_Puntaje` | `Afinidad_3_Area` |

Las posiciones cuarta a decimonovena siguen el mismo patrón: `Afinidad_4_Carrera`, `Afinidad_4_Puntaje`, `Afinidad_4_Area`, hasta `Afinidad_19_Carrera`, `Afinidad_19_Puntaje` y `Afinidad_19_Area`. La primera afinidad coincide con `Tecnicatura_Recomendada`.

Los registros con `Version_Catalogo = 2026.08-legado-19` contienen el ranking original de 19 perfiles, incluido el perfil histórico **TS en Museología y Gestión Patrimonial**. Los registros nuevos con `Version_Catalogo = 2026.08-oficial-18` se calculan únicamente con las 18 tecnicaturas vigentes; en ellos las tres columnas de `Afinidad_19` quedan vacías de manera intencional. Esto mantiene un único formato estable para Excel y BI, sin inventar una afinidad decimonovena para la oferta actual.

## Uso recomendado en herramientas de BI

El CSV puede abrirse directamente con codificación **UTF-8** y separador de **punto y coma (`;`)**, un formato que Excel en configuraciones regionales en español reconoce al abrir la descarga. Incluye además una marca BOM para conservar acentos y caracteres en español. Antes de crear rankings, se debe filtrar o segmentar por `Version_Catalogo`: **no se deben sumar en un mismo gráfico** las afinidades históricas de 19 perfiles y las afinidades de la oferta vigente de 18. Para un ranking completo, se puede transformar el bloque de 57 columnas de afinidades a formato largo dentro de Power Query o la herramienta equivalente; cada evaluación generará hasta 19 filas, según su versión de catálogo. Para el gráfico de presencia Top 3, luego se filtran únicamente los puestos 1, 2 y 3.

| Necesidad del tablero | Campos de origen | Visualización sugerida |
|---|---|---|
| Carreras con más primeras afinidades | `Tecnicatura_Recomendada` | Barras ordenadas o ranking |
| Presencia total en Top 3 | `Afinidad_1_Carrera` a `Afinidad_3_Carrera` | Barras apiladas por puesto |
| Interés en el IES N.° 11 | `Intencion_Estudiar_IES11` | Barras o porcentaje agregado |
| Preferencias por escenario | `P01_Texto` a `P13_Texto` | Barras por pregunta; incluir la alternativa neutral |
| Evolución durante el evento | `Fecha_Argentina_Jujuy` | Serie de tiempo por día u hora |
| Distribución vocacional | `Area`, `Afinidad_1_Area` a `Afinidad_3_Area` | Barras o distribución por área |

## Reglas de privacidad y calidad

El archivo de descarga sigue protegido por la contraseña privada de coordinación. Además, la serialización del CSV neutraliza valores que una hoja de cálculo podría interpretar como fórmulas, lo que reduce riesgos al abrir información declarada por las personas participantes.

Para publicaciones, presentaciones o tableros accesibles fuera de la coordinación, se deben ocultar `ID`, nombre, apellido, edad exacta y fecha/hora detallada. Las edades deben agruparse en rangos y las categorías con menos de cinco casos deben ocultarse o combinarse. La interpretación de las afinidades debe presentarse como orientación exploratoria, no como diagnóstico ni como una decisión automática de admisión.

## Auditoría reproducible

El script `scripts/auditExportCsv.py` verifica el nuevo contrato tabular sin exponer registros individuales en su salida. Puede ejecutarse sobre una descarga autorizada de la siguiente forma:

```bash
python3 scripts/auditExportCsv.py resultados-vocacional-ies11-AAAA-MM-DD.csv
```

La auditoría informa cantidad y orden de columnas, presencia de campos JSON heredados, validez de fechas UTC, códigos de las 14 respuestas, coherencia entre recomendación y primera afinidad, completitud de las afinidades según su versión de catálogo y distribuciones agregadas de consentimiento, intención de estudiar, versión de cuestionario y versión de catálogo.
