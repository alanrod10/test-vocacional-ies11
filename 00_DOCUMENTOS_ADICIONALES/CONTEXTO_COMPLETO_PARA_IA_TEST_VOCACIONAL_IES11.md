# Contexto completo para otra IA — Test Vocacional IES N.° 11

## 0. Instrucción principal para la IA

Actuá como una persona senior en arquitectura web, React/TypeScript, Node.js, bases de datos MySQL, análisis de datos y diseño de instrumentos vocacionales. Tu objetivo es **entender, replicar y luego mejorar con cuidado** el proyecto denominado **Test Vocacional IES N.° 11**, sin destruir la versión histórica ni mezclar sus datos con una futura versión permanente.

Antes de modificar algo:

1. Inspeccioná todo el código y la documentación.
2. Identificá si el archivo pertenece al archivo histórico o a la evolución permanente.
3. No cambies preguntas, opciones, puntajes, catálogo, resultados ni estructura de CSV sin crear una versión explícita y pruebas de regresión.
4. Nunca uses datos personales históricos para probar o desarrollar.
5. Ejecutá las pruebas y la verificación TypeScript después de cada modificación importante.
6. Mantené la identidad institucional del IES N.° 11.
7. Tratá el resultado como una orientación inicial, no como diagnóstico psicológico ni decisión definitiva de carrera.

La respuesta debe ser clara para una persona que no necesariamente conoce toda la historia del proyecto. Cuando propongas cambios, explicá: **qué cambia, por qué, qué riesgo tiene, qué datos históricos afecta y cómo se prueba**.

---

## 1. Identidad del proyecto

- **Nombre:** Test Vocacional IES N.° 11.
- **Institución:** Instituto de Educación Superior N.° 11, San Salvador de Jujuy, Argentina.
- **Uso original:** orientación inicial para estudiantes y visitantes durante la Expo Educativa 2026.
- **Autoría institucional:** “Hecho y desarrollado por alumnos de la carrera de Ciencias de Datos e Inteligencia Artificial del IES N.° 11”.
- **Objetivo:** presentar a cada participante un ranking personalizado de sus tres principales afinidades entre las Tecnicaturas Superiores del IES N.° 11.
- **Naturaleza:** aplicación web completa, no un simple programa Python ejecutable.
- **Estado histórico:** cerrado y de solo lectura. Conserva la experiencia, la base y las estadísticas finales de la exposición.
- **Estado permanente:** debe ser una copia independiente, vacía de datos personales, con base de datos, secretos, dominio y administración propios.

El sitio histórico se publicó en:

`https://vocatest11-j6zpasaq.manus.space`

Ese sitio **no debe reutilizarse para desarrollar la versión futura**. La versión permanente debe comenzar desde una copia técnica limpia.

---

## 2. Decisión crítica: dos líneas separadas

### 2.1 Archivo histórico

Representa la Expo Educativa 2026 ya finalizada.

- Conserva sus evaluaciones y estadísticas.
- No acepta nuevas respuestas.
- No permite reiniciar resultados.
- El panel queda en modo lectura.
- Mantiene el contexto y las versiones originales.
- La exportación completa sigue protegida con contraseña.
- La analítica pública suprime categorías con menos de tres casos.
- No se debe alterar para probar nuevas ideas.

### 2.2 Evolución permanente

Es la futura herramienta institucional.

Debe tener, como mínimo:

- Proyecto o repositorio separado.
- Dominio separado.
- Base de datos nueva y vacía.
- Contraseña administrativa nueva.
- Almacenamiento de archivos separado.
- Secretos nuevos.
- Catálogo y cuestionario versionados.
- Política de retención y privacidad propia.
- Pruebas piloto antes de abrirla al público.

**Prohibición:** no copiar nombres, apellidos, teléfonos, CSV históricos, credenciales, backups ni bases de datos del archivo histórico a la instancia permanente.

Se puede reutilizar el código, la estructura, el diseño institucional, el motor de afinidades, las pruebas y la documentación saneada.

---

## 3. Qué contiene realmente el sistema

El proyecto contiene varias capas coordinadas:

1. **Frontend React:** formulario inicial, cuestionario, barra de progreso, transiciones, resultados, ranking Top 3, perfiles profesionales, comparación, QR y panel.
2. **Backend Node.js/Express:** servidor web, API tRPC, validación, cálculo de resultados, persistencia y controles administrativos.
3. **Dominio compartido:** preguntas, opciones, intereses RIASEC, catálogo de tecnicaturas, perfiles, versiones y motor de puntuación.
4. **Base de datos MySQL:** participantes, respuestas resumidas, ranking, versiones y bitácora administrativa.
5. **Migraciones Drizzle:** definición reproducible del esquema de base de datos.
6. **Pruebas Vitest:** validación del motor, envío de evaluaciones, exportación, analítica, reinicio y archivo histórico.
7. **Scripts de análisis:** auditorías del cuestionario, CSV y análisis agregado.
8. **Documentación:** arquitectura, gobierno de datos, seguridad, operación, contribución, análisis reproducible y evolución permanente.
9. **Activos institucionales:** logo y recursos necesarios para conservar la identidad visual.

No es correcto describirlo como “un archivo Python que se ejecuta”. Python se usó como apoyo para análisis y generación de gráficos; la aplicación principal es una solución web TypeScript/React/Node/MySQL.

---

## 4. Stack técnico exacto

- React 19.
- TypeScript 5.9.
- Vite 7.
- Tailwind CSS 4.
- Node.js.
- Express 4.
- tRPC 11 para contratos cliente-servidor tipados.
- Drizzle ORM y Drizzle Kit.
- MySQL mediante `mysql2`.
- Zod para validación de entradas.
- Vitest para pruebas.
- Recharts para gráficos.
- Framer Motion y CSS para animaciones.
- `jspdf` para informes PDF individuales.
- `html-to-image` para tarjetas sociales PNG.
- `qrcode` para códigos QR.
- Lucide React para iconos.
- `pnpm` como gestor de paquetes.
- Python/Matplotlib/Seaborn para análisis externo del CSV y gráficos institucionales.

Scripts principales del `package.json`:

```bash
pnpm dev       # desarrollo
pnpm build     # compila frontend y servidor
pnpm start     # ejecuta producción
pnpm check     # TypeScript sin emitir archivos
pnpm test      # Vitest
pnpm db:push   # genera y aplica migraciones Drizzle
pnpm format    # Prettier
```

El paquete portable no debe depender de `node_modules`; las dependencias se regeneran con `pnpm install`.

---

## 5. Estructura de carpetas

La estructura esperada es:

```text
test-vocacional-ies11/
├── client/
│   ├── public/                 # configuración pública pequeña y assets permitidos
│   └── src/
│       ├── components/         # UI reutilizable
│       ├── contexts/           # contexto visual/tema
│       ├── hooks/              # hooks propios
│       ├── lib/                # PDF, QR, imagen social y flujo del test
│       ├── pages/              # Home y vistas principales
│       ├── App.tsx
│       ├── index.css
│       └── main.tsx
├── server/
│   ├── _core/                  # infraestructura del template/servidor
│   ├── db.ts                   # consultas y persistencia
│   ├── routers.ts              # procedimientos tRPC
│   ├── storage.ts
│   └── *.test.ts               # pruebas del backend
├── shared/
│   ├── vocational.ts           # preguntas, catálogo, perfiles y puntuación
│   ├── archive.ts              # modo histórico
│   ├── types.ts
│   └── *.test.ts
├── drizzle/
│   ├── schema.ts
│   ├── migrations/
│   └── meta/
├── scripts/
│   ├── analyzeFinalCsv.py
│   ├── auditExportCsv.py
│   ├── auditQuestionnaire.ts
│   └── otros scripts de auditoría/QR
├── data/
│   ├── raw/.gitkeep
│   └── processed/.gitkeep
├── docs/
│   ├── ARQUITECTURA.md
│   ├── GOBIERNO_DE_DATOS.md
│   ├── ANALISIS_REPRODUCIBLE.md
│   ├── OPERACION_Y_MANTENIMIENTO.md
│   └── CONTRIBUIR.md
├── README.md
├── SECURITY.md
├── ARCHIVO_HISTORICO.md
├── EVOLUCION_PERMANENTE.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

El ZIP permanente de referencia fue descrito en el checkpoint como un paquete de aproximadamente **247 archivos**, incluyendo código, migraciones, recursos institucionales y documentación. Excluye datos de evaluaciones, archivos PBIX, secretos, `.git` y dependencias regenerables.

---

## 6. Flujo funcional del estudiante

### 6.1 Registro inicial

El participante completa:

- Nombre.
- Apellido.
- Edad.
- Sexo o preferencia de no informar.
- Localidad agrupada.
- Situación educativa.
- Consentimiento para guardar el resultado.

No se solicita el número de WhatsApp del IES ni se promete envío automático por WhatsApp.

Los datos identificatorios se guardan para uso institucional restringido y **no se muestran al público**.

### 6.2 Cuestionario

- El instrumento vigente quedó con 14 situaciones/consignas.
- Cada pregunta tiene alternativas comprensibles para jóvenes.
- Incluye una opción neutral del tipo “ninguna de las anteriores / no me representa” para no forzar una respuesta.
- La última pregunta puede registrar la intención de estudiar en el IES N.° 11 como dato institucional, sin convertirla en una tecnicatura ni alterar indebidamente la afinidad.
- Hay barra de progreso.
- Las respuestas avanzan con animaciones suaves.
- Se puede volver atrás mientras el flujo lo permite.
- No se deben cambiar identificadores, orden, intereses ni puntajes sin versionar el cuestionario.

### 6.3 Resultado

El servidor calcula y devuelve:

- Afinidad principal.
- Puntaje de la afinidad principal.
- Área vocacional.
- Ranking Top 3.
- Perfil profesional ampliado.
- Tareas posibles, campo laboral y asignaturas relacionadas.
- Comparación sencilla entre las tres afinidades.
- Mensaje responsable: el resultado es un punto de partida para explorar, no una sentencia.

También hay:

- Revelación por capas.
- Medalla o insignia con pulso sutil.
- Barras Top 3 que aparecen de forma escalonada.
- Destellos institucionales discretos.
- Trayectoria visual hacia el área.
- Preferencia `prefers-reduced-motion` para accesibilidad.
- Descarga de informe PDF individual.
- Descarga de tarjeta social/imagen PNG.
- QR para compartir el resultado sin exponer la ficha personal.

---

## 7. Motor de afinidad

El motor usa una adaptación del modelo RIASEC de Holland con seis intereses:

| Código | Nombre | Descripción |
|---|---|---|
| R | Realista | Hacer, construir y aplicar técnicas. |
| I | Investigativo | Analizar, investigar y resolver. |
| A | Artístico | Crear, diseñar y comunicar. |
| S | Social | Acompañar, enseñar y cuidar. |
| E | Emprendedor | Impulsar, liderar y vincular. |
| C | Convencional | Organizar, registrar y planificar. |

Cada opción tiene un vector de intereses. Las respuestas seleccionadas se agregan y se comparan con el vector de cada tecnicatura. El resultado se ordena por puntaje, con reglas de desempate deterministas.

La opción neutral no debe inventar un interés positivo. Sirve para que el participante pueda decir que ninguna alternativa lo representa. El servidor rechaza un envío compuesto únicamente por respuestas neutrales porque no habría señal suficiente para orientar.

La función conceptual es:

```text
respuestas seleccionadas
        ↓
vector de intereses acumulado
        ↓
comparación con perfiles de tecnicaturas
        ↓
ordenamiento por afinidad
        ↓
Top 1 + Top 2 + Top 3
```

El resultado es una orientación inicial. No es una prueba psicométrica validada clínicamente ni debe presentarse como diagnóstico.

---

## 8. Catálogo académico y versiones

La oferta oficial vigente usada por la versión nueva quedó en 18 tecnicaturas:

1. Administración en Servicios de Salud.
2. Agente Sanitario y Promotor de la Salud.
3. Asistente Odontológico.
4. Ciencias de Datos e Inteligencia Artificial.
5. Cocinas Regionales y Cultura Alimentaria.
6. Desarrollo de Software.
7. Diseño de Indumentaria.
8. Enfermería.
9. Estadísticas de Salud.
10. Gerontología.
11. Gestión de Energías Renovables.
12. Guía de Turismo.
13. Hotelería.
14. Laboratorio de Análisis Clínico.
15. Museología.
16. Seguridad e Higiene Laboral.
17. Tecnología de Alimentos.
18. Turismo.

Existieron evaluaciones históricas bajo un catálogo de 19 tecnicaturas. El perfil legado “Museología y Gestión Patrimonial” se conserva solo para interpretar los registros viejos.

Por eso el sistema maneja:

- Catálogo legado de 19.
- Catálogo oficial vigente de 18.
- Vista consolidada histórica 18 + 19, claramente etiquetada.

El CSV conserva `catalogVersion` y `questionnaireVersion` para no mezclar análisis incompatibles.

### Turismo y Guía de Turismo

No son duplicadas funcionalmente:

- **Turismo:** planificación, diseño y gestión de productos, servicios y destinos.
- **Guía de Turismo:** conducción de grupos, interpretación de patrimonio, comunicación en terreno y seguridad del recorrido.

Si ambas aparecen en el Top 3, la tabla comparativa debe aclarar esta diferencia. No se debe cambiar el catálogo ni alterar resultados históricos por esa mejora de redacción.

---

## 9. Modelo de datos

La tabla principal contiene, en esencia:

- `id`.
- `firstName`.
- `lastName`.
- `age`.
- `sex`.
- `studyIntent`.
- `locality`.
- `educationStatus`.
- `dataConsent`.
- `resultProgram`.
- `resultArea`.
- `selections` en JSON.
- `scoreSnapshot` en JSON.
- `questionnaireVersion`.
- `catalogVersion`.
- `createdAt`.

La tabla de acciones administrativas registra:

- acción;
- resultado permitido o denegado;
- metadatos mínimos;
- fecha y hora.

El CSV de exportación fue diseñado para análisis y dashboards. La exportación tabular separa:

- contexto del participante;
- respuestas por pregunta, con código y texto;
- afinidad 1, 2 y 3;
- puntaje y área de cada afinidad;
- versiones del cuestionario y catálogo.

La versión histórica estable llegó a una estructura amplia de 98/100 columnas según el punto de evolución. La IA debe **inspeccionar el exportador actual antes de asumir una cantidad exacta** y no romper la estabilidad sin crear una nueva versión.

Para Power BI se recomienda un modelo dimensional:

- `FactEvaluaciones`.
- `FactAfinidades` en formato largo.
- `FactRespuestas` en formato largo.
- `DimFecha`.
- `DimPrograma`.
- `DimArea`.
- `DimLocalidad` agrupada.
- `DimSituacionEducativa`.

Los datos identificatorios deben quedar en una tabla restringida o fuera del modelo público.

---

## 10. Panel y analítica

El panel muestra estadísticas agregadas, no fichas personales.

Métricas principales:

- Total de evaluaciones.
- Ranking de afinidad principal.
- Presencia de cada tecnicatura en Top 1, Top 2 y Top 3.
- Distribución por área.
- Grupos de edad.
- Sexo declarado, si el tamaño permite publicarlo.
- Localidad agrupada.
- Situación educativa.
- Edad promedio.
- Comparación por versión de catálogo.

La analítica pública aplica supresión mínima: no publica categorías con menos de tres casos. Esto evita exponer indirectamente a participantes en grupos pequeños.

No se deben interpretar frecuencias como causalidad ni afirmar que una tecnicatura “es la mejor”. Una concentración puede reflejar intereses de la muestra, contexto de la expo, composición de participantes o el propio diseño del instrumento.

---

## 11. Seguridad administrativa

Las acciones sensibles son:

- Exportar el CSV completo.
- Reiniciar resultados.

Ambas requieren una contraseña privada del servidor mediante `ADMIN_ACTION_PASSWORD`. No se debe incrustar la contraseña en frontend, repositorio, documentación ni mensajes.

El reinicio exige:

1. Primera confirmación.
2. Contraseña válida.
3. Descarga obligatoria de un backup CSV reciente.
4. Challenge firmado y temporal.
5. Segunda confirmación.
6. Registro de la acción.
7. Límite de intentos fallidos.

El reinicio es destructivo. En el archivo histórico está bloqueado por diseño.

También existen:

- comparación en tiempo constante para la contraseña;
- rate limit de intentos administrativos;
- vencimiento de challenge;
- recibo temporal del backup;
- bitácora mínima de exportaciones y reinicios;
- controles de consentimiento;
- exclusión de secretos del repositorio.

Para una versión VPS se deben agregar, según necesidad:

- HTTPS obligatorio.
- Copias de seguridad cifradas.
- usuario de base de datos con privilegios mínimos.
- firewall y actualizaciones.
- rotación de secretos.
- retención definida.
- monitoreo.
- restauración probada.
- protección adicional del panel administrativo.

---

## 12. Identidad visual y accesibilidad

La interfaz utiliza una identidad institucional basada en:

- azules profundos y celestes;
- fondos claros;
- tarjetas blancas;
- bordes suaves;
- sombras discretas;
- logo del IES N.° 11;
- tipografía fuerte para títulos;
- lenguaje cercano para jóvenes.

Debe conservarse la leyenda institucional:

> Hecho y desarrollado por alumnos de la carrera de Ciencias de Datos e Inteligencia Artificial del IES N.° 11.

Requisitos de accesibilidad:

- buen contraste;
- controles grandes en móvil;
- labels visibles;
- navegación por teclado;
- foco visible;
- textos alternativos del logo;
- no depender únicamente del color;
- animaciones reducidas si el usuario lo solicita;
- mensajes de error comprensibles;
- no bloquear la pantalla innecesariamente.

---

## 13. Instalación local de la base técnica

La instalación conceptual es:

```bash
git clone <repositorio>
cd test-vocacional-ies11
pnpm install
```

Configurar variables de entorno mediante un mecanismo seguro. Nunca versionar `.env`.

Variables típicas del template original:

- `DATABASE_URL`.
- `JWT_SECRET`.
- `ADMIN_ACTION_PASSWORD`.
- variables de autenticación si se conserva OAuth.
- variables de almacenamiento si se conserva S3.

Para una migración fuera de Manus se debe desacoplar lo que dependa de Manus:

- OAuth de Manus, si no se necesita.
- almacenamiento Manus.
- variables `BUILT_IN_FORGE_*`.
- proxy/runtime específico.
- dominio temporal.

Luego:

```bash
pnpm check
pnpm test
pnpm build
pnpm db:push
pnpm start
```

En producción se recomienda ejecutar detrás de Nginx o Caddy con HTTPS, en un VPS o plataforma cloud gratuita que soporte Node.js y MySQL/TiDB compatible. La base debe ser nueva.

---

## 14. Qué debe contener el ZIP portable

El paquete `Test_Vocacional_IES11_Version_Permanente_Base_v1.0.0.zip` fue preparado como **base técnica de réplica**, no como backup de la exposición.

Debe entenderse que incluye:

### Código de la aplicación

- frontend React/TypeScript;
- componentes UI;
- página principal;
- flujo de registro;
- cuestionario;
- resultado;
- dashboard;
- integración tRPC;
- servidor Express/Node;
- procedimientos backend;
- acceso a base de datos;
- almacenamiento/proxy heredado cuando corresponda;
- motor vocacional compartido;
- catálogo y perfiles;
- modo histórico y versionado.

### Base de datos

- `drizzle/schema.ts`;
- migraciones SQL;
- metadatos Drizzle;
- relaciones y configuración de Drizzle.

No contiene la base histórica real ni registros personales.

### Pruebas

- pruebas de autenticación/logout del template;
- pruebas del envío del test;
- pruebas del cálculo vocacional;
- pruebas del Top 3;
- pruebas de neutralidad;
- pruebas de exportación;
- pruebas de analítica;
- pruebas de reinicio;
- pruebas del modo archivo histórico;
- pruebas compartidas.

### Scripts

- auditoría del cuestionario;
- auditoría del CSV;
- análisis de CSV autorizado;
- generación de afiche/QR;
- utilidades de verificación.

### Documentación

- README técnico;
- arquitectura;
- seguridad;
- gobierno de datos;
- análisis reproducible;
- operación y mantenimiento;
- contribución;
- guía simple para docentes/compañeros;
- evolución permanente;
- decisiones de catálogo;
- auditorías del cuestionario;
- documentación de perfiles;
- guía de ponderación RIASEC.

### Recursos institucionales

- logo del IES N.° 11;
- archivos pequeños necesarios para identidad visual;
- instrucciones de uso del QR y del afiche, cuando estén incluidos.

### Exclusiones obligatorias

El ZIP limpio no debe contener:

- `node_modules`;
- `.git`;
- `.env`;
- contraseñas;
- tokens;
- claves API;
- base de datos real;
- CSV histórico con nombres o apellidos;
- backups reales;
- archivos PBIX;
- logs con datos personales;
- exportaciones de prueba identificables.

La falta del ZIP en un entorno no significa que falte el código: el contenido fuente puede estar en el repositorio. Sin embargo, antes de afirmar que el paquete actual está completo, hay que comprobar físicamente el archivo con `unzip -l`, extraerlo en un directorio temporal y ejecutar las verificaciones.

---

## 15. Procedimiento correcto para crear la versión permanente

1. Copiar el checkpoint técnico final, no la base histórica.
2. Crear repositorio independiente.
3. Eliminar datos, secretos y referencias innecesarias al histórico.
4. Crear una base MySQL nueva.
5. Crear secretos nuevos.
6. Definir el nombre y dominio permanente.
7. Revisar si se conserva autenticación o se reemplaza.
8. Configurar almacenamiento propio o local seguro.
9. Definir la versión inicial del cuestionario.
10. Definir la versión inicial del catálogo.
11. Ejecutar migraciones.
12. Ejecutar `pnpm check`, `pnpm test` y `pnpm build`.
13. Probar móvil, teclado, lector y reducción de movimiento.
14. Hacer piloto con datos ficticios o consentidos.
15. Verificar CSV y Power BI sin identificadores.
16. Definir responsables, retención, backup y recuperación.
17. Publicar únicamente después de la aprobación institucional.
18. Mantener el sitio histórico sin cambios.

---

## 16. Mejoras futuras recomendadas

No aplicarlas automáticamente sin versionar:

- página pública de metodología y límites;
- ciclo anual de revisión del catálogo;
- prueba de comprensión de preguntas con jóvenes;
- validación pedagógica institucional;
- configuración externa de preguntas y perfiles;
- exportación normalizada en tablas separadas;
- roles administrativos más granulares;
- MFA para administración;
- panel Power BI conectado a datos anonimizados;
- retención automática y borrado documentado;
- backups cifrados con prueba de restauración;
- monitoreo y alertas;
- internacionalización si el IES lo necesita;
- modo offline solo si se diseña una sincronización segura.

Toda mejora que cambie respuestas, puntajes, perfiles o catálogo debe aumentar `questionnaireVersion` o `catalogVersion`, conservar versiones anteriores y documentar la comparabilidad.

---

## 17. Respuesta corta para explicar el proyecto a docentes o compañeros

> La página es una aplicación web completa. React y TypeScript construyen la interfaz que ve el estudiante; Node.js y Express ejecutan el servidor; tRPC conecta el frontend con el backend; MySQL guarda los registros; Drizzle administra las tablas y migraciones; el archivo compartido contiene las preguntas, los perfiles y el cálculo de afinidades; Vitest verifica que todo funcione. Python se utilizó para analizar los CSV y preparar gráficos del informe, pero el test no se ejecuta como un programa Python. El sistema toma las respuestas, calcula un perfil de intereses RIASEC, compara ese perfil con las tecnicaturas y muestra las tres afinidades principales. Los nombres y datos personales quedan restringidos, mientras que el panel público solo muestra estadísticas agregadas.

---

## 18. Reglas finales para cualquier IA que continúe el proyecto

- No mezcles el archivo histórico con la versión permanente.
- No borres datos reales sin backup, confirmación y registro.
- No publiques datos identificatorios.
- No expongas la contraseña administrativa.
- No cambies el catálogo por intuición: confirmar con fuente institucional.
- No cambies el cuestionario sin versionado.
- No presentes el test como diagnóstico clínico.
- No rompas el CSV existente sin migración documentada.
- No elimines la distinción entre Turismo y Guía de Turismo.
- No elimines la trazabilidad 18/19 tecnicaturas.
- No quites la leyenda de autoría institucional.
- No agregues WhatsApp si no existe un requerimiento y mecanismo institucional aprobado.
- Antes de entregar una modificación, indicar archivos afectados, pruebas ejecutadas y riesgos pendientes.

**Resultado esperado:** una réplica funcional, segura, comprensible y mantenible del Test Vocacional IES N.° 11, lista para evolucionar de forma independiente sin alterar la memoria institucional de la Expo Educativa 2026.
