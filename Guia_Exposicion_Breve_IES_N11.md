# Guía breve de exposición — Test Vocacional IES N.° 11

**Duración sugerida de la exposición:** 3 a 4 minutos  
**Uso recomendado:** imprimir con tamaño de letra 11 o 12 y márgenes normales; el contenido está pensado para ocupar aproximadamente dos o tres hojas.

> **Idea central:** “Desarrollamos una aplicación web para orientar a estudiantes y visitantes de la Expo Educativa hacia las tecnicaturas del IES N.° 11, de forma clara, dinámica y respetuosa de su privacidad.”

## 1. ¿Qué es el proyecto?

El **Test Vocacional IES N.° 11** es una aplicación web pensada para la Expo Educativa 2026. Ayuda a las personas a explorar, de manera inicial, cuál de las **19 Tecnicaturas Superiores** del IES N.° 11 puede estar más relacionada con sus intereses.

No pretende decidir una carrera por la persona. Su función es abrir un primer camino de exploración y presentar tres alternativas para que el estudiante pueda investigar, conversar con docentes y tomar una decisión más informada.

La página se puede abrir desde un celular o computadora en [vocatest11-j6zpasaq.manus.space](https://vocatest11-j6zpasaq.manus.space). En el stand, el acceso se facilita mediante un código QR visible en la portada y en el afiche.

## 2. ¿Cómo funciona el recorrido?

| Etapa | Qué hace la persona | Qué aporta la aplicación |
|---|---|---|
| Registro | Completa datos básicos y acepta el uso institucional de sus datos. | Inicia una experiencia personalizada y con consentimiento. |
| Cuestionario | Responde 14 preguntas situacionales. | Identifica intereses mediante actividades y decisiones concretas. |
| Resultado | Recibe una tecnicatura principal y dos afinidades cercanas. | Explica el perfil, las tareas, materias y campo laboral. |
| Comparación | Revisa las tres opciones principales. | Facilita ver diferencias de puntaje, área y enfoque. |
| Material para llevar | Descarga un PDF o tarjeta para redes. | Permite conservar y compartir el resultado. |

### Registro y privacidad

Al comenzar, la persona completa nombre, apellido, edad, sexo, localidad y situación educativa. También acepta un consentimiento para el uso institucional de la información. **No se solicita WhatsApp.**

Los nombres no aparecen en el panel público. La analítica visible muestra únicamente información agrupada, como cantidad de evaluaciones, tecnicaturas con mayor afinidad y distribuciones generales. Además, cuando hay pocas respuestas, algunos datos se ocultan para reducir el riesgo de identificación indirecta.

## 3. El cuestionario vocacional

El test tiene **14 pasos** y una duración aproximada de siete minutos. Las primeras 13 preguntas aportan señales de afinidad. La última consulta si la persona tiene interés en estudiar en el IES N.° 11; esa respuesta sirve para la analítica institucional, pero no modifica la recomendación.

Las preguntas no se limitan a “¿qué carrera te gusta?”. Plantean situaciones: resolver un problema técnico, organizar una actividad, analizar información, acompañar a otras personas, crear una propuesta o participar en un proyecto. De esta manera, el sistema puede relacionar intereses con formas reales de trabajo.

Durante el cuestionario se muestra una barra de progreso, el número de pregunta y la posibilidad de volver atrás. Esto ayuda a que la experiencia sea clara y que la persona sepa cuánto falta para terminar.

## 4. ¿Cómo se genera el resultado?

Cada respuesta suma señales vinculadas con intereses prácticos, analíticos, creativos, sociales, emprendedores y organizativos. Luego, el motor vocacional compara esas señales con los perfiles de las 19 tecnicaturas y ordena las tres opciones con mayor afinidad.

Las tecnicaturas se organizan en cinco áreas: **Tecnología e Innovación; Salud y Bienestar; Administración y Servicios; Producción y Ambiente; y Educación, Cultura y Diseño.**

> **Frase útil para explicar:** “La aplicación no afirma que existe una única carrera correcta. Propone tres caminos relacionados para que cada persona pueda seguir explorando.”

## 5. La pantalla de resultados

Cuando finaliza el test, aparece una animación con la tecnicatura de mayor afinidad. A continuación, el resultado muestra un perfil profesional ampliado y escrito en un lenguaje accesible.

El visitante puede conocer:

| Información mostrada | Para qué sirve |
|---|---|
| Perfil profesional | Explica, de manera sencilla, qué tipo de problemas se abordan. |
| Tareas posibles | Ayuda a imaginar actividades habituales al finalizar la tecnicatura. |
| Materias principales | Anticipa contenidos de la formación. |
| Campo laboral | Muestra contextos de inserción en Jujuy y el NOA. |
| Tres afinidades | Presenta alternativas cercanas, no excluyentes. |

Al final del resultado se encuentra la **tabla comparativa**. En computadora se presenta como una tabla con orden, puntaje, área, enfoque, materias clave y campo laboral. En celular se adapta a tres fichas apiladas, para que se pueda leer todo sin mover la pantalla hacia los costados.

## 6. PDF, tarjeta y códigos QR

La aplicación permite descargar un **informe PDF** con el resultado completo. También genera una tarjeta visual para redes sociales, con el nombre de la tecnicatura, el área y un resumen profesional breve.

Cada resultado incluye un QR que abre esa tarjeta desde el celular y permite descargarla. El QR de la página principal y del afiche cumple otra función: permite entrar directamente al test desde el stand.

## 7. Panel institucional

La página tiene un panel de analítica para observar resultados agregados del stand. Allí se pueden consultar indicadores generales y la distribución de afinidades. Las acciones sensibles están protegidas:

- La exportación completa en CSV requiere una contraseña privada de coordinación.
- El reinicio de métricas también requiere doble confirmación y la misma contraseña.
- La página pública no muestra nombres, apellidos ni datos personales individuales.

Esto permite que el IES N.° 11 aproveche los datos para conocer el interés de los visitantes sin exponer su información.

## 8. Tecnologías y cierre

La aplicación fue desarrollada con **React y TypeScript** para la interfaz, un servidor con **Express y tRPC**, y una base de datos gestionada con **Drizzle ORM**. Además, utiliza generación de PDF, tarjetas PNG, códigos QR, animaciones y gráficos de analítica.

### Cierre sugerido

> “Este proyecto mejora la experiencia del stand porque no solo informa una oferta académica: acompaña al visitante en un recorrido, explica de qué trata cada tecnicatura, le permite llevarse su resultado y ofrece al IES N.° 11 estadísticas útiles con resguardo de privacidad.”

### Preguntas rápidas del profesor

| Pregunta | Respuesta breve |
|---|---|
| ¿El test decide la carrera? | No. Es una orientación inicial que propone tres alternativas para explorar. |
| ¿Cómo se protege la información? | Los datos identificatorios no se muestran públicamente y las acciones administrativas requieren contraseña. |
| ¿Qué pasa en celular? | Todo el recorrido, los QR, el PDF, la tarjeta y la comparación están adaptados a pantallas móviles. |
| ¿Por qué hay tres resultados? | Porque una persona puede tener intereses afines en más de una tecnicatura. |

**Proyecto:** Test Vocacional IES N.° 11 · Expo Educativa 2026
