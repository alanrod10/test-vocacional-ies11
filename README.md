# Test Vocacional IES N.° 11

> **Estado actual: archivo histórico cerrado de la Expo Educativa 2026.** La instancia publicada conserva sus resultados en modo lectura y no acepta nuevas evaluaciones. Consultar [ARCHIVO_HISTORICO.md](./ARCHIVO_HISTORICO.md) y [EVOLUCION_PERMANENTE.md](./EVOLUCION_PERMANENTE.md) antes de realizar cambios.

Este repositorio privado contiene el código, la documentación operativa y los procedimientos de análisis del **Test Vocacional IES N.° 11**, una aplicación web de orientación inicial utilizada en la Expo Educativa 2026. La solución ofrece un cuestionario de 14 situaciones, un ranking de tres afinidades, perfiles comparativos de tecnicaturas y un panel de datos que publica solo información agregada.

El repositorio se mantiene **privado** porque la operación institucional puede involucrar configuraciones de infraestructura y exportaciones con datos personales. Ningún archivo de datos identificatorios, secreto, respaldo o credencial debe ser incorporado a control de versiones. Para difusión pública se recomienda crear una copia saneada, con esta documentación técnica, el motor de afinidad y datos agregados o sintéticos claramente identificados.

## Alcance funcional

| Área | Contenido principal |
|---|---|
| Orientación | Catorce preguntas situacionales, alternativa neutral y ranking Top 3. |
| Oferta | Dieciocho tecnicaturas activas organizadas en cinco áreas, más un perfil histórico para compatibilidad. |
| Resultado | Animación accesible, comparación de afinidades, PDF individual y tarjeta social descargable. |
| Datos | Registro con consentimiento, exportación CSV de 100 columnas y versiones de cuestionario y catálogo. |
| Administración | Exportación y reinicio protegidos, bitácora de acciones y requisito de resguardo previo a reinicios. |

## Estructura del repositorio

```text
test-vocacional-ies11/
├── client/                    # Interfaz React y componentes de experiencia
├── server/                    # API tRPC, reglas de negocio y acceso a datos
├── shared/                    # Motor vocacional, catálogo y contratos compartidos
├── drizzle/                   # Esquema y migraciones de la base de datos
├── scripts/                   # Auditorías y análisis reproducibles sin datos personales
├── docs/                      # Gobierno de datos, arquitectura y operación
├── tests/                     # Pruebas adicionales si se organizan fuera del código fuente
├── README.md                  # Este documento
├── SECURITY.md                # Reglas para secretos y reportes de seguridad
└── .gitignore                 # Exclusiones obligatorias de datos y entornos locales
```

## Puesta en marcha para colaboradores autorizados

El proyecto utiliza Node.js, pnpm y una base de datos compatible con el esquema de Drizzle. Las variables de entorno y las credenciales se administran exclusivamente mediante el canal seguro de la plataforma o el mecanismo institucional aprobado; **nunca** deben copiarse a archivos versionados, mensajes o capturas.

```bash
pnpm install
pnpm check
pnpm test
```

Las migraciones deben revisarse antes de aplicarse y ejecutarse en el orden definido en `drizzle/migrations/`. Cualquier cambio que afecte el cuestionario, el catálogo o el CSV debe actualizar las pruebas y la documentación de trazabilidad antes de su publicación.

## Análisis reproducible y datos

El script `scripts/analyzeFinalCsv.py` genera análisis agregados a partir de una exportación autorizada. El archivo CSV original debe permanecer fuera del repositorio y en un almacenamiento institucional con acceso restringido. Los informes públicos no deben exponer nombre, apellido, ID, localidad detallada, fecha individual ni combinaciones que hagan posible reidentificar a una persona.

La guía completa se encuentra en [docs/GOBIERNO_DE_DATOS.md](docs/GOBIERNO_DE_DATOS.md) y el procedimiento de análisis en [docs/ANALISIS_REPRODUCIBLE.md](docs/ANALISIS_REPRODUCIBLE.md).

## Flujo de contribución

Toda modificación debe partir de una rama, incluir una explicación clara, ejecutar `pnpm check` y `pnpm test`, y revisar el impacto sobre datos personales, versiones y accesibilidad. Los cambios en la oferta académica requieren confirmación de una fuente institucional antes de actualizar el catálogo. Consulte [docs/CONTRIBUIR.md](docs/CONTRIBUIR.md) para el procedimiento completo.

## Documentación relacionada

| Documento | Propósito |
|---|---|
| [Arquitectura](docs/ARQUITECTURA.md) | Describe componentes, flujo de datos y decisiones técnicas. |
| [Gobierno de datos](docs/GOBIERNO_DE_DATOS.md) | Define privacidad, acceso, resguardo y publicación segura. |
| [Operación y mantenimiento](docs/OPERACION_Y_MANTENIMIENTO.md) | Resume controles de administración, versionado y cierre de exposición. |
| [Análisis reproducible](docs/ANALISIS_REPRODUCIBLE.md) | Establece cómo generar informes sin exponer registros personales. |
| [Contribuir](docs/CONTRIBUIR.md) | Establece la revisión y los controles previos a integrar cambios. |

## Autoría institucional

Hecho y desarrollado por alumnos de la carrera de **Ciencias de Datos e Inteligencia Artificial del IES N.° 11**.
