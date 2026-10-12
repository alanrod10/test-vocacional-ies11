# Historial de Cambios (Changelog)

Todos los cambios notables de la plataforma del **Test Vocacional IES N.° 11** están documentados en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y se adhiere al versionado semántico [SemVer](https://semver.org/lang/es/).

---

## [1.4.0] - 2026-10-12

### Añadido
- **Modelo Dimensional para Power BI (S7 / AG-13):**
  - Procedimiento `exportCsv` en formato largo con tres tablas de hechos relacionales normalizadas: `FactEvaluaciones` (15 columnas), `FactAfinidades` (8 columnas) y `FactRespuestas` (7 columnas).
  - Protección en origen contra inyección de fórmulas CSV (CWE-1236) anteponiendo apóstrofe (`'`) a caracteres `=`, `+`, `-`, `@`.
  - Procesamiento por lotes en servidor (chunks de 500 registros) para streaming eficiente con bajo uso de memoria RAM.
  - Menú de descarga en interfaz de usuario (`Dashboard.tsx`) con descargas individuales y lote completo para Power BI.
- **Analítica Agregada con Supresión de Privacidad (S6 / AG-12):**
  - Agregaciones directas en base de datos con Drizzle SQL (`db.select({ count: sql... }).groupBy(...)`).
  - Filtro por versión de catálogo (`2026.08-legado-19`, `2026.08-oficial-18`, `2026.10-oficial-17` y consolidado).
  - Supresión estadística primaria ($N < 3$) y supresión complementaria obligatoria en demografía, agrupando datos en *"Otros / No revelado"*.
- **Presentación en Bandas y Detección de Empates (AG-11):**
  - Mapeo de puntajes crudos a bandas cualitativas de afinidad (*Afinidad Alta*, *Media*, *Exploratoria*).
  - Detección explícita y visualización con etiqueta de *"Empate"* en el Top 3 ante igualdad matemática previa al desempate alfabético.
  - Barras proporcionales reales en UI, PDF y tarjeta social sin pisos artificiales forzados.
- **Rendimiento, Lazy Loading y Accesibilidad Móvil (AG-10):**
  - Carga bajo demanda (*dynamic import*) de `jspdf`, `html2canvas` y `html-to-image`, reduciendo el bundle inicial en más de 600 kB.
  - Habilitación de gestos táctiles pellizcar para hacer zoom (*pinch-to-zoom*) en dispositivos móviles al remover `maximum-scale=1`.
  - Soporte para la preferencia del sistema operativo `prefers-reduced-motion` en animaciones de revelación.
  - Touch targets optimizados a un tamaño mínimo de 44×44 píxeles.
- **Seguridad y Control de Acceso por Roles (S2 / AG-09):**
  - Separación de procedimientos tRPC en `viewerProcedure` (solo lectura de analíticas) y `adminProcedure` (exportación, borrado y reinicio).
  - Tokens JWT firmados con HMAC-SHA256 almacenados en cookies seguras `ies11_admin_token` (`HttpOnly`, `SameSite=Lax`, `Secure`).
  - Rate limiting adaptativo contra ataques de fuerza bruta en endpoints administrativos.
  - Procedimiento de derecho al olvido `deleteAssessment` (borrado individual por ID) con bitácora inmutable en `vocational_admin_actions`.
- **Evolución del Catálogo y Trazabilidad (AG-04 a AG-08):**
  - Identificadores canónicos y estables normalizados (`ts_*`) para todas las tecnicaturas, preguntas (`q_*`) y opciones (`opt_*`).
  - Incorporación de *TS en Acompañamiento Terapéutico* con estado `pendiente_de_modelado`.
  - Retiro formal de *TS en Guía de Turismo* y *TS en Museología y Gestión Patrimonial* con estado `retirada`.
  - Catálogo oficial vigente de 17 tecnicaturas (`2026.10-oficial-17`).
- **Autonomía y Desacoplamiento Local:**
  - Migración completa fuera de dependencias de entornos externos como Manus hacia una infraestructura independiente.
  - Integración de assets locales (logo IES 11 en `/ies11-logo.png`, iconos SVG, fuentes).
  - Plantilla de variables de entorno [.env.example](file:///.env.example) para despliegue estándar con MySQL.
- **Borrador Metodológico v2:**
  - Diseño psicométrico de 36 micro-actividades balanceadas (6 por factor RIASEC) con escala Likert de 5 puntos y normalización Z-score.
  - Suite de simulación Monte Carlo con 10.000 evaluaciones sintéticas para verificación de estabilidad distributiva.

### Cambiado
- Política de privacidad en base de datos: adopción del modelo **Zero-PII** en modo permanente, donde `firstName` y `lastName` nunca se escriben en base de datos.
- Reestructuración de la documentación técnica en `docs/` (`ARQUITECTURA.md`, `GOBIERNO_DE_DATOS.md`, `OPERACION_Y_MANTENIMIENTO.md`, `ANALISIS_REPRODUCIBLE.md`, `METODOLOGIA.md`).

---

## [1.0.0] - 2026-08-20

### Versión Inicial (Expo Educativa 2026)
- Cuestionario situacional de 14 preguntas utilizado durante la Expo Educativa 2026 en San Salvador de Jujuy.
- Catálogo histórico de 19 tecnicaturas del IES N.° 11.
- Cálculo de vector RIASEC y ranking Top 3 de afinidad vocacional.
- Exportación en CSV ancho de 100 columnas.
- Generación de informe en PDF y tarjeta social PNG.
- Modo de archivo histórico (`INSTANCE_MODE="historical"`).
