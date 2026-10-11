#import "report-theme.typ": *

#show: report-theme.with(
  title: "Del dato a la decisión: Análisis del Test Vocacional IES N.º 11",
  author: "Equipo de Ciencia de Datos - IES N.º 11",
  rhythm: "report",
  running-header: true,
)

// ---------- Portada Personalizada ----------
#page(margin: (top: 30%, x: 2.2cm), numbering: none, header: none)[
  #set par(first-line-indent: 0em)
  #align(center)[
    #text(size: 26pt, weight: "bold", fill: report-accent)[Del dato a la decisión: Análisis del Test Vocacional IES N.º 11]
    #v(0.5em)
    #text(size: 14pt, fill: luma(80))[Proyecto Integrador - Prácticas Profesionalizantes II]
    #v(2em)
    #line(length: 40%, stroke: 0.5pt + luma(160))
    #v(2em)
    #text(size: 12pt)[
      Autores: Equipo de Ciencia de Datos - IES N.º 11 \
      Fecha: Septiembre 2026
    ]
  ]
]

// ---------- Índice ----------
#page(numbering: none, header: none)[
  #outline(title: [Índice de Contenidos], indent: 1.5em)
]

// ---------- Cuerpo del Informe ----------
#counter(page).update(1)

= Resumen Ejecutivo

Este informe presenta el análisis integral de los datos recolectados mediante el Test de Orientación Vocacional del IES N.º 11 durante la Expo Educativa 2026. A partir de una muestra de 187 participantes, se exploran las tendencias vocacionales, el perfil demográfico de los interesados y la efectividad del instrumento de orientación. Los hallazgos sugieren una alta concentración de interés en las áreas de Tecnología y Salud, así como una oportunidad de expansión en la difusión regional de la oferta académica.

= Etapa 1: Comprender el Problema

El Test Vocacional intenta resolver la incertidumbre de los estudiantes secundarios frente a la amplia oferta académica del IES N.º 11. La información obtenida es vital para el equipo directivo y de comunicación, permitiendo ajustar las estrategias de promoción y entender las demandas reales del territorio.

== Preguntas de Investigación

1. ¿Cuál es el perfil demográfico predominante de los interesados?
2. ¿Qué áreas vocacionales despiertan mayor interés espontáneo?
3. ¿Cómo se comportan las segundas y terceras afinidades en el ranking Top 3?
4. ¿Qué proporción de participantes manifiesta intención real de estudiar en la institución?

= Etapa 2 y 3: Los Datos y su Calidad

El conjunto de datos consta de 187 registros y más de 100 variables que incluyen datos demográficos, respuestas situacionales y afinidades calculadas por el motor RIASEC.

Durante la auditoría se identificaron dos versiones de catálogo (18 y 19 tecnicaturas), lo que requirió una normalización de los datos para asegurar la comparabilidad de los resultados. Se garantizó la privacidad mediante la supresión de identificadores directos (Nombre, Apellido, Teléfono) en el análisis público.

= Etapa 5: Análisis Descriptivo

== Perfil de los Participantes

La muestra presenta una concentración significativa en el rango etario de 17 a 19 años, coincidiendo con el egreso del nivel secundario.

#figure(
  image("assets/dist_edad.png", width: 80%),
  caption: [Distribución de edad de los participantes.],
)

En cuanto a la distribución por sexo, se observa una paridad relativa, con una ligera predominancia de perfiles masculinos en la muestra capturada durante el evento.

#figure(
  image("assets/dist_sexo.png", width: 60%),
  caption: [Distribución por sexo.],
)

== Interés Institucional

Un dato relevante es la intención de estudio en el IES N.º 11. Más del 60% de los participantes expresaron algún grado de interés o agradecimiento por la orientación recibida.

#figure(
  image("assets/intencion_ies11.png", width: 60%),
  caption: [Intención de estudiar en el IES N.º 11.],
)

= Etapa 6 y 7: Análisis de Afinidades y Áreas

== Ranking de Tecnicaturas

El análisis de la primera afinidad revela las carreras con mayor tracción inicial. Las tecnicaturas en Cocinas Regionales, Desarrollo de Software y Ciencias de Datos lideran el interés.

#figure(
  image("assets/top_carreras.png", width: 80%),
  caption: [Top 10 tecnicaturas con mayor afinidad principal.],
)

== Distribución por Áreas Vocacionales

El área de *Tecnología e Innovación* y *Salud y Bienestar* concentran el mayor volumen de afinidades, reflejando las tendencias del mercado laboral regional.

#figure(
  image("assets/dist_areas.png", width: 80%),
  caption: [Interés por área vocacional.],
)

= Etapa 9 y 10: Hallazgos y Recomendaciones

1. *Evidencia:* Existe un grupo significativo de estudiantes que tienen carreras de tecnología como segunda o tercera opción. 
   - _Recomendación:_ Implementar charlas puente que muestren la relación entre salud y tecnología.
2. *Evidencia:* La procedencia geográfica está muy concentrada en San Salvador de Jujuy.
   - _Recomendación:_ Fortalecer la difusión en el interior de la provincia, especialmente en Quebrada y Puna.

= Etapa 11: Ética y Límites

_Lo que los datos NO nos permiten afirmar:_
- No podemos asegurar que el interés vocacional se traduzca en una inscripción efectiva sin un seguimiento posterior.
- La muestra no es representativa de toda la población joven de la provincia, sino de los asistentes a la Expo Educativa.

= Conclusiones

El proyecto "Del dato a la decisión" demuestra que el Test Vocacional es una herramienta poderosa no solo de orientación, sino de inteligencia institucional. La correcta interpretación de estos datos permitirá al IES N.º 11 optimizar sus recursos y acompañar mejor las trayectorias educativas de los jóvenes jujeños.
