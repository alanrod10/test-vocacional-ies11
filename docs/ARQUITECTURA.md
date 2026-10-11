# Arquitectura técnica

La aplicación sigue una arquitectura web de cliente y servidor con contratos tipados. El cliente implementa la experiencia del cuestionario y la visualización de resultados; el servidor ejecuta las reglas sensibles, administra la exportación y persiste las evaluaciones. El módulo `shared/` contiene las definiciones del instrumento que deben permanecer consistentes en ambos extremos.

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| Interfaz | `client/` | Registro, preguntas, animaciones, resultado individual y panel agregado. |
| Servicios | `server/` | Procedimientos tRPC, validaciones, controles administrativos y exportación. |
| Dominio | `shared/vocational.ts` | Preguntas, perfiles, áreas, versiones y motor de afinidad. |
| Persistencia | `drizzle/` y `server/db.ts` | Esquema, migraciones y consultas de evaluaciones y auditoría. |
| Calidad | Archivos `*.test.ts` | Pruebas de puntaje, neutralidad, exportación, analítica y reinicio. |

El envío de una evaluación valida el formato, verifica que no todas las respuestas sean neutrales, calcula las afinidades y almacena el resultado con las versiones de cuestionario y catálogo. El panel público consume agregados; las acciones de exportación y reinicio requieren un secreto del servidor y aplican controles complementarios.

Los cambios de infraestructura deben documentarse como una decisión técnica en el historial de cambios o en una nota de arquitectura. Los cambios en preguntas, opciones, ponderaciones, perfiles o catálogo requieren además versionado explícito y pruebas de regresión.
