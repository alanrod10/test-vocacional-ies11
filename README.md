# Test Vocacional IES N.° 11

> **Plataforma de Orientación Vocacional Autónoma e Institucional.** Este repositorio contiene la aplicación web, el motor de afinidad vocacional y la documentación técnica del **Test Vocacional del Instituto de Educación Superior N.° 11** (San Salvador de Jujuy, Argentina).

La solución es una herramienta de orientación vocacional inicial (no clínica ni diagnóstica) diseñada para ayudar a postulantes y estudiantes a explorar las Tecnicaturas Superiores del instituto según sus intereses y preferencias situacionales. Opera de forma autónoma con un modelo de privacidad **Zero-PII** (cero datos personales identificatorios en base de datos), control de acceso administrativo basado en roles (`viewer` y `admin`), y exportación analítica dimensional compatible con Power BI.

---

## Alcance funcional

| Área | Contenido principal |
|---|---|
| **Orientación inicial** | Cuestionario situacional de 14 preguntas balanceadas (modelo RIASEC adaptado a Jujuy), opción neutral y ranking Top 3 de afinidades. |
| **Oferta académica versionada** | Catálogo oficial vigente (`2026.10-oficial-17`) con 17 tecnicaturas activas en 5 áreas de conocimiento, 1 tecnicatura en estado `pendiente_de_modelado` (Acompañamiento Terapéutico) y 2 perfiles históricos retirados (Guía de Turismo y Museología). Identificadores estables normalizados (`ts_*`). |
| **Presentación de resultados** | Bandas cualitativas de afinidad (*Afinidad Alta*, *Media*, *Exploratoria*), visibilización explícita de empates, PDF individual descargable y tarjeta social PNG generada en alta resolución. |
| **Privacidad Zero-PII** | Los nombres y apellidos solo residen en la memoria RAM del navegador para la descarga del PDF y **nunca** se persisten en la base de datos en modo permanente. Supresión estadística estricta ($N < 3$ y supresión complementaria) en métricas demográficas. |
| **Modelo dimensional (Power BI)** | Exportación en formato largo de tres tablas de hechos relacionales (`FactEvaluaciones`, `FactAfinidades`, `FactRespuestas`) protegidas contra inyección de fórmulas CSV (CWE-1236). |
| **Administración segura** | Autenticación con JWT firmado en cookies `HttpOnly`, diferenciación estricta de roles (`viewerProcedure` vs `adminProcedure`), derecho al olvido (borrado por ID), bitácora de auditoría y flujo de reinicio con resguardo obligatorio previo. |

---

## Modos de operación de la instancia

La plataforma soporta dos modos de ejecución configurables mediante la variable de entorno `INSTANCE_MODE`:

1. **Modo Permanente (`INSTANCE_MODE="permanent"`, predeterminado):**
   - Modo de recolección continua sin datos personales (Zero-PII).
   - Permite completar nuevas evaluaciones, consultar métricas en tiempo real y gestionar la base con derecho al olvido.
2. **Modo Archivo Histórico (`INSTANCE_MODE="historical"`):**
   - Archivo cerrado de solo lectura correspondiente a la muestra de la Expo Educativa 2026.
   - Bloquea nuevas evaluaciones, desactiva la eliminación de registros y el reinicio de base de datos para preservar la inmutabilidad histórica.

Consultar [docs/GOBIERNO_DE_DATOS.md](docs/GOBIERNO_DE_DATOS.md) y [ARCHIVO_HISTORICO.md](ARCHIVO_HISTORICO.md) para más detalles.

---

## Estructura del repositorio

```text
test-vocacional-ies11/
├── client/                    # Interfaz React 19, Tailwind CSS, animaciones y componentes de UI
├── server/                    # Servidor Express, API tRPC v11, seguridad JWT y acceso a datos
├── shared/                    # Motor de afinidad RIASEC, catálogo versionado, tipos y contratos
├── drizzle/                   # Esquema relacional Drizzle ORM y migraciones SQL
├── scripts/                   # Auditorías metodológicas, simulaciones y análisis reproducibles
├── docs/                      # Arquitectura, metodología, gobierno de datos, Power BI y operación
├── CHANGELOG.md               # Historial de cambios y versiones de la plataforma
├── README.md                  # Este documento
├── SECURITY.md                # Políticas de seguridad, tratamiento de secretos y reporte de fallos
└── .env.example               # Plantilla de variables de entorno para despliegue local y producción
```

---

## Puesta en marcha

### Requisitos previos
- **Node.js** v20 o superior
- **pnpm** v9 o superior
- **MySQL** v8.0 o MariaDB v10.5+

### Pasos de instalación y ejecución

1. **Clonar e instalar dependencias:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd test-vocacional-ies11
   pnpm install
   ```

2. **Configurar variables de entorno:**
   Copiar la plantilla `.env.example` a `.env` y completar los valores requeridos:
   ```bash
   cp .env.example .env
   ```
   Variables fundamentales:
   - `DATABASE_URL`: Cadena de conexión MySQL (`mysql://usuario:password@localhost:3306/vocational_db`).
   - `ADMIN_INITIAL_USER`: Nombre de usuario del administrador inicial (por defecto: `admin`).
   - `ADMIN_INITIAL_PASSWORD`: Contraseña para sembrar el administrador inicial en primer arranque.
   - `ADMIN_JWT_SECRET`: Secreto criptográfico de al menos 32 caracteres para firmar los tokens JWT de sesión.
   - `INSTANCE_MODE`: `permanent` para operación estándar o `historical` para archivo histórico de solo lectura.

3. **Sincronizar el esquema de base de datos:**
   ```bash
   pnpm db:push
   ```

4. **Iniciar en entorno de desarrollo:**
   ```bash
   pnpm dev
   ```
   La aplicación se iniciará en `http://localhost:3000`.

5. **Verificación de calidad y pruebas:**
   ```bash
   # Comprobación estricta de tipos de TypeScript
   pnpm check

   # Suite completa de pruebas unitarias y de integración (Vitest)
   pnpm test

   # Compilación de producción optimizada (Vite + esbuild)
   pnpm build
   ```

---

## Panel administrativo y roles

El acceso al panel administrativo se realiza en `/admin/login`:

- **Rol `viewer` (Visualizador):** Acceso de solo lectura al panel analítico agregado, gráficos de distribución y métricas consolidadas. No puede exportar datos, eliminar evaluaciones ni reiniciar la base.
- **Rol `admin` (Administrador):** Acceso pleno a métricas agregadas, exportación dimensional para Power BI, borrado individual por ID (derecho al olvido) y reinicio de métricas con resguardo previo mandatorio.

---

## Análisis reproducible y Power BI

El procedimiento de exportación `exportCsv` genera tres archivos en formato largo (FactTables):
- `FactEvaluaciones.csv`: Métricas demográficas y de recomendación anónimas (15 columnas, sin nombres ni apellidos).
- `FactAfinidades.csv`: Ranking de afinidades desglosadas por carrera, puntaje y banderas de empate (8 columnas).
- `FactRespuestas.csv`: Respuestas ítem por ítem con identificadores estables de pregunta y opción (7 columnas).

Para mayor información técnica sobre el modelo en estrella y medidas DAX, consultar [docs/ANALISIS_REPRODUCIBLE.md](docs/ANALISIS_REPRODUCIBLE.md).

---

## Documentación técnica e institucional

| Documento | Propósito |
|---|---|
| [Arquitectura](docs/ARQUITECTURA.md) | Componentes de software, contratos tRPC, seguridad de cookies y rendimiento. |
| [Metodología](docs/METODOLOGIA.md) | Fundamentos psicométricos RIASEC, reglas de ponderación, catálogo y motor v2. |
| [Gobierno de datos](docs/GOBIERNO_DE_DATOS.md) | Política Zero-PII, supresión estricta ($N < 3$), anonimización y derechos ARCO. |
| [Operación y mantenimiento](docs/OPERACION_Y_MANTENIMIENTO.md) | Puesta en marcha, roles, sembrado de usuarios, respaldo y resolución de problemas. |
| [Análisis reproducible](docs/ANALISIS_REPRODUCIBLE.md) | Esquema dimensional para Power BI, relaciones, prevención de inyección y scripts. |
| [Seguridad](SECURITY.md) | Manejo de secretos, protección contra inyección CSV y mitigación de fuerza bruta. |
| [Historial de cambios](CHANGELOG.md) | Registro de versiones y cambios evolutivos del proyecto. |

---

## Autoría institucional

Hecho y desarrollado por alumnos de la carrera de **Ciencias de Datos e Inteligencia Artificial del IES N.° 11**.
