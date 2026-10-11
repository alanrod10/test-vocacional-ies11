# Guía simple para exponer el Test Vocacional IES N.° 11

## 1. Presentación breve

> **“Creamos una aplicación web para orientar a estudiantes y visitantes de la Expo Educativa hacia las tecnicaturas del IES N.° 11. No reemplaza una decisión personal ni una entrevista vocacional: funciona como un primer recorrido claro para descubrir alternativas afines.”**

El sitio está disponible de forma permanente en [vocatest11-j6zpasaq.manus.space](https://vocatest11-j6zpasaq.manus.space). Se diseñó para usarse principalmente desde el celular, pero también funciona en computadoras y tablets.

## 2. Qué problema resuelve

En una expo educativa, una persona puede conocer muchas propuestas en poco tiempo y no siempre sabe cuál explorar primero. La página transforma esa duda inicial en un recorrido breve de **14 preguntas situacionales**. En lugar de preguntar únicamente “qué carrera te gusta”, plantea acciones, intereses y formas de resolver situaciones.

| Necesidad del visitante | Respuesta de la aplicación |
|---|---|
| Conocer opciones sin recorrer toda la oferta al azar | Recomienda tres tecnicaturas con mayor afinidad. |
| Entender de qué trata una tecnicatura | Muestra perfil, tareas, materias y campo laboral. |
| Llevarse el resultado | Permite descargar un PDF y una tarjeta para redes. |
| Acceder rápidamente en el stand | Incluye códigos QR en la página y en el afiche. |
| Contar con información útil para la institución | Registra resultados de manera protegida y muestra analítica agregada. |

## 3. Recorrido que se puede mostrar durante la exposición

### Paso 1: Pantalla de bienvenida y registro

La página inicial identifica claramente al **IES N.° 11** y explica que el test dura aproximadamente siete minutos. La persona completa nombre, apellido, edad, sexo, localidad y situación educativa. También debe aceptar un consentimiento para el uso institucional de los datos.

Se puede aclarar que **no se solicita WhatsApp**. El diseño busca recolectar solo información útil para comprender el alcance del stand y evitar datos innecesarios.

### Paso 2: Cuestionario vocacional

El cuestionario contiene **14 pasos**. Las primeras 13 respuestas aportan señales de afinidad; la última pregunta consulta si la persona tiene interés en estudiar en el IES N.° 11 y sirve para la analítica institucional, no para alterar la recomendación.

Las preguntas son situacionales. Por ejemplo, preguntan qué actividad elegiría una persona ante un proyecto, un problema técnico, una situación de salud, una tarea de organización o una propuesta creativa. Esto permite relacionar intereses con formas concretas de trabajo.

La pantalla incluye una barra de progreso, el número de pregunta y la opción de volver atrás. Cada respuesta genera una transición breve para mantener una experiencia dinámica sin perder claridad.

### Paso 3: Cálculo de afinidades

Las respuestas se relacionan con intereses vocacionales de tipo práctico, analítico, creativo, social, emprendedor y organizativo. El sistema suma esas señales y las vincula con las **19 Tecnicaturas Superiores** agrupadas en cinco áreas.

| Área vocacional | Ejemplos de enfoque |
|---|---|
| Tecnología e Innovación | Datos, inteligencia artificial, software y sistemas. |
| Salud y Bienestar | Atención, prevención, información y gestión en salud. |
| Administración y Servicios | Organización, administración, turismo y gestión. |
| Producción y Ambiente | Procesos productivos, recursos y territorio. |
| Educación, Cultura y Diseño | Comunicación, creatividad, formación y propuestas culturales. |

La recomendación no dice que una persona “debe” estudiar una sola carrera. Presenta una afinidad principal y dos alternativas cercanas para fomentar una decisión informada.

### Paso 4: Pantalla de resultado

En esta parte se produce una animación de revelación de la tecnicatura principal. Luego se muestra un perfil profesional ampliado, escrito de forma sencilla pero con vocabulario técnico cuando es necesario.

El resultado presenta qué puede hacer una persona al finalizar, tareas habituales, materias o espacios principales y posibles campos laborales en Jujuy y el NOA. Por ejemplo, en una tecnicatura tecnológica se explican procesos como análisis, diseño, desarrollo, pruebas y comunicación de resultados; no solo se muestra el nombre de la carrera.

### Paso 5: Comparación de las tres afinidades

Al final del resultado aparece una comparación de las tres opciones principales. En computadora se visualiza como tabla; en celular se transforma en fichas apiladas para que no sea necesario mover la pantalla lateralmente.

| Dato que compara | Para qué sirve |
|---|---|
| Puesto y puntaje | Permite ver la cercanía entre las tres afinidades. |
| Área | Ubica cada propuesta dentro de un campo vocacional. |
| Enfoque | Resume el tipo de problemas y actividades de la tecnicatura. |
| Materias clave | Anticipa algunos contenidos de formación. |
| Campo laboral | Ayuda a imaginar contextos de inserción profesional. |

Esta comparación es útil para explicar que una afinidad alta no elimina las demás opciones: permite comenzar a investigar tres caminos relacionados.

### Paso 6: Material para llevarse

Al finalizar, la persona puede descargar un **informe PDF** con el resultado completo. También puede descargar una tarjeta visual para compartir en redes sociales.

El sistema genera un QR asociado al resultado. Al escanearlo con el celular se abre una página donde puede descargarse la tarjeta. El QR de la portada y el afiche permite, en cambio, acceder directamente al test desde el stand.

## 4. Panel de analítica y privacidad

El panel público muestra solo información agrupada: cantidad de evaluaciones, tecnicaturas más elegidas y distribuciones generales. Cuando la cantidad de respuestas es baja, algunos datos demográficos se ocultan para evitar que una persona pueda ser identificada indirectamente.

Los nombres y apellidos no se muestran en la página pública. La exportación del CSV completo y el reinicio de métricas están protegidos con una contraseña privada de coordinación. De esta forma, se separa la experiencia abierta para visitantes de las acciones administrativas sensibles.

> **Idea para remarcar:** “Diseñamos la aplicación para orientar, informar y medir el alcance del stand, pero sin exponer datos personales de los participantes.”

## 5. Tecnologías utilizadas

La página fue desarrollada como una aplicación web moderna. El frontend utiliza **React y TypeScript** para construir la interfaz; el servidor utiliza **Express y tRPC** para conectar la aplicación con la lógica de datos; y la persistencia se gestiona mediante **Drizzle ORM** y una base de datos. Para la experiencia visual se usaron Tailwind CSS, animaciones y gráficos de analítica.

| Componente | Función dentro del proyecto |
|---|---|
| React + TypeScript | Interfaz, preguntas, resultados y componentes reutilizables. |
| Servidor y base de datos | Guarda evaluaciones y prepara estadísticas agregadas. |
| Motor vocacional | Convierte respuestas en puntajes para las tecnicaturas. |
| Generación de PDF y PNG | Produce el informe y la tarjeta compartible. |
| Códigos QR | Facilitan el acceso al test y a la tarjeta de resultado. |

## 6. Guion sugerido de 3 a 4 minutos

1. **Inicio:** “Nuestro proyecto es un Test Vocacional para el IES N.° 11, pensado para la Expo Educativa.”
2. **Problema:** “Buscamos ayudar a los visitantes a recorrer la oferta de 19 tecnicaturas de forma más personalizada.”
3. **Demostración:** Mostrar el registro, una pregunta y la barra de avance.
4. **Resultado:** Mostrar el perfil profesional, las tareas, las materias y el campo laboral.
5. **Comparación:** Mostrar las tres afinidades y explicar que la app orienta, no impone una elección.
6. **Cierre:** Mostrar la descarga del PDF, la tarjeta con QR y el panel de analítica agregada.

## 7. Preguntas que podría hacer el profesor

| Pregunta | Respuesta breve sugerida |
|---|---|
| ¿La aplicación decide la carrera de la persona? | No. Ofrece una orientación inicial basada en intereses y propone alternativas para seguir investigando. |
| ¿Cómo se calcula el resultado? | Cada respuesta aporta señales de afinidad. El motor combina esas señales con los perfiles de las 19 tecnicaturas y ordena las tres más cercanas. |
| ¿Por qué hay tres resultados y no uno solo? | Porque la elección vocacional puede tener intereses relacionados; comparar tres opciones evita una recomendación cerrada. |
| ¿Qué datos se guardan? | Los datos informados con consentimiento y las respuestas; los nombres no aparecen en el panel público. |
| ¿Quién puede exportar o reiniciar datos? | Solo coordinación, usando una contraseña privada. |
| ¿Qué ocurre en el celular? | El test, el resultado, el PDF y la tarjeta compartible están adaptados a pantallas móviles. |

## 8. Cierre de la exposición

> **“El valor del proyecto no está solo en recomendar una tecnicatura. También mejora la experiencia del stand, explica con mayor claridad la oferta del IES N.° 11, ofrece material para llevarse y genera datos agregados para que la institución pueda conocer el interés de los visitantes sin descuidar su privacidad.”**

---

**Proyecto:** Test Vocacional IES N.° 11 · Expo Educativa 2026  
**Versión expuesta:** incluye cuestionario de 14 preguntas, perfiles ampliados y tabla comparativa de afinidades.
