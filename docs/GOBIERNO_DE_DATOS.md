# Gobierno de Datos, Privacidad y Tratamiento Estadístico

El **Test Vocacional IES N.° 11** tiene como única finalidad la orientación vocacional inicial de los participantes y el análisis estadístico agregado de intereses académicos para la planificación institucional del IES N.° 11. Este documento establece los principios rectores, la política de privacidad estricta y los mecanismos de resguardo y anonimización de la información.

---

## 1. Principio Fundamental: Modelo Zero-PII (Privacidad desde el Diseño)

El sistema opera bajo una política de **Cero Datos Personales Identificatorios en Base de Datos** (*Zero Personally Identifiable Information*):

1. **No Persistencia de Nombres y Apellidos:** En el modo operativo permanente (`INSTANCE_MODE="permanent"`), la aplicación **nunca almacena** nombres ni apellidos en la base de datos MySQL. En la tabla `vocational_assessments`, las columnas `firstName` y `lastName` se persisten siempre como valores nulos (`null`).
2. **Ciclo de Vida Efímero en Memoria RAM del Cliente:** El participante puede ingresar opcionalmente su nombre en la interfaz de usuario con el único propósito de personalizar la portada del informe PDF o de la tarjeta social para redes. Dicha información reside exclusivamente en la memoria RAM del navegador del dispositivo del usuario y se destruye automáticamente al cerrar la pestaña o recargar la página.
3. **Consentimiento Informado y Transparente:** La aplicación exige que el usuario confirme su consentimiento informado mediante una casilla explícita (*checkbox*) antes de enviar su test:
   > *"Acepto que mis respuestas anónimas sean utilizadas con fines estadísticos y de orientación académica por el IES N.° 11."*

---

## 2. Clasificación de la Información

| Clase de Información | Atributos | Tratamiento y Nivel de Acceso |
|---|---|---|
| **Datos de Identificación Directa** | Nombre y apellido | **Prohibida su persistencia en servidor.** Uso exclusivo en memoria volátil de la sesión del usuario. |
| **Microdatos Demográficos Anónimos** | Rango etario (`Grupo_Edad`), sexo, localidad general, nivel educativo, intención de inscripción | Almacenados en base de datos disociados de cualquier identidad. Solo accesibles en formato largo por personal con rol `admin` mediante exportación cifrada. |
| **Respuestas y Puntajes** | Vector de 14 selecciones situacionales, ranking Top 3 y puntajes por tecnicatura | Almacenados con clave subrogada anónima `ID_Evaluacion` y versiones de catálogo y motor para trazabilidad psicométrica. |
| **Métricas Agregadas** | Distribución porcentual por área, tecnicatura Top 1, tasa de empates, totales por grupo de edad | Visibles en el panel administrativo para roles `viewer` y `admin`. Sujetas a reglas de supresión estadística. |
| **Credenciales y Secretos** | Contraseñas maestras, hashes bcrypt de administradores, tokens JWT, cadena de conexión a base de datos | Variables de entorno del servidor. Jamás incorporadas a Git, respaldos ni documentos públicos. |

---

## 3. Regla Estricta de Supresión de Privacidad en Analítica ($N < 3$)

Para garantizar que ningún participante pueda ser reidentificado indirectamente mediante la combinación de variables demográficas singulares (por ejemplo, una única persona de 45 años de una localidad rural específica), el motor de analítica agregada ([`server/privacySuppression.ts`](file:///mnt/c/Proyecto%20Test%20Vocacional%20IES%2011/Test_Vocacional_IES11_Paquete_Completo_v1.0.0/server/privacySuppression.ts)) aplica dos filtros matemáticos obligatorios antes de enviar los datos al frontend:

### 3.1. Supresión Primaria (Umbral $k = 3$)
Toda categoría demográfica (edad, sexo, localidad) cuyo conteo de participantes sea menor a 3 ($1 \le N < 3$) es retirada de la visualización individual y agrupada bajo la etiqueta protectora:
> **"Otros / No revelado (protección de privacidad)"**

### 3.2. Supresión Complementaria (*Secondary Suppression*)
La supresión primaria por sí sola no es suficiente si el atacante conoce el total general de la muestra ($N_{total}$). Si se oculta una sola celda que contiene 2 casos, un observador podría deducirla fácilmente restando las categorías visibles del total general:
$$\text{Celda Oculta} = N_{total} - \sum \text{Celdas Visibles}$$

**Mecanismo implementado:** Cuando el algoritmo oculta una categoría demográfica por ser menor a 3, está obligado por diseño a suprimir también la siguiente categoría más pequeña (incluso si dicha categoría tiene 3, 4 o más casos), agrupando ambas en "Otros / No revelado". De este modo, la suma de las celdas ocultas contiene al menos dos valores desconocidos, haciendo matemáticamente imposible deducir el valor individual.

---

## 4. Derecho al Olvido y Derechos ARCO (Borrado por ID)

En cumplimiento de las mejores prácticas de protección de datos personales y derechos ARCO (Acceso, Rectificación, Cancelación y Oposición):

1. **Identificador de Evaluación:** Cada participante recibe al finalizar su test un identificador numérico anónimo (`ID_Evaluacion`).
2. **Solicitud de Eliminación:** Si un participante manifiesta su voluntad de que sus respuestas no formen parte del banco estadístico, puede proporcionar su identificador al personal autorizado del IES N.° 11.
3. **Procedimiento `deleteAssessment`:** El administrador autenticado puede ejecutar la eliminación individual por ID desde el panel de control (`/admin/dashboard`).
4. **Bitácora de Auditoría Inmutable:** La operación se ejecuta mediante una transacción SQL (`DELETE FROM vocational_assessments WHERE id = ?`), registrando de forma inmutable en la tabla `vocational_admin_actions`:
   - Acción ejecutada (`delete_assessment`).
   - Resultado (`success`).
   - Identificador de la evaluación suprimida.
   - Usuario administrador responsable (`actor`).
   - Dirección IP y marca de tiempo UTC.

---

## 5. Modos de Operación y Trazabilidad Histórica

El comportamiento de la plataforma frente a los datos está gobernado por la variable de entorno `INSTANCE_MODE`:

| Característica | Modo Permanente (`INSTANCE_MODE="permanent"`) | Modo Archivo Histórico (`INSTANCE_MODE="historical"`) |
|---|---|---|
| **Objetivo** | Operación continua institucional y futuras expos educativas. | Preservación del legado de la Expo Educativa 2026. |
| **Nuevas Evaluaciones** | Habilitadas (`vocational.submit` activo). | **Bloqueadas** (cierre de muestra histórico). |
| **Modelo de Nombres** | Cero nombres en base de datos (`Zero-PII`). | Conserva lectura histórica de la muestra original si existía. |
| **Borrado Individual** | Habilitado para administradores (derecho al olvido). | **Bloqueado** (garantía de inmutabilidad del archivo). |
| **Reinicio de Base** | Habilitado con recibo de seguridad previo. | **Bloqueado** (impide pérdida accidental del archivo histórico). |

---

## 6. Procedimiento de Resguardo Obligatorio en Reinicios

Para prevenir la pérdida irreversible de información durante mantenimientos institucionales o aperturas de nuevos ciclos lectivos, la mutación `vocational.reset` impone una barrera de seguridad de tres pasos en servidor:

1. **Descarga Obligatoria de Respaldo:** El administrador debe solicitar la exportación completa de microdatos. El servidor genera un recibo criptográfico temporal (`backupReceipt`, UUID v4) con una validez máxima de 5 minutos en memoria RAM.
2. **Generación de Desafío de Reinicio:** El administrador debe solicitar un token de confirmación criptográfico (`challenge`) mediante `createResetChallenge`.
3. **Validación Cruzada:** La petición definitiva de reinicio (`reset`) requiere enviar simultáneamente el `challenge` válido y el `backupReceipt` vigente. Si no se descargó el CSV previo en los últimos 5 minutos, el servidor rechaza la solicitud con error `BAD_REQUEST`.
4. **Destrucción y Auditoría:** Una vez comprobado el resguardo, se eliminan los registros y se asienta en la bitácora administrativa la cantidad exacta de filas respaldadas y borradas.
