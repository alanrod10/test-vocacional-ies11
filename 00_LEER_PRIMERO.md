# Paquete completo — Test Vocacional IES N.° 11

Este archivo reúne el código fuente, la documentación técnica, las migraciones, las pruebas, los scripts, el logo institucional y los documentos de referencia del Test Vocacional IES N.° 11.

## Orden recomendado de lectura

1. `00_LEER_PRIMERO.md`
2. `README.md`
3. `00_DOCUMENTOS_ADICIONALES/CONTEXTO_COMPLETO_PARA_IA_TEST_VOCACIONAL_IES11.md`
4. `ARCHIVO_HISTORICO.md`
5. `EVOLUCION_PERMANENTE.md`
6. `docs/ARQUITECTURA.md`
7. `docs/GOBIERNO_DE_DATOS.md`
8. `docs/OPERACION_Y_MANTENIMIENTO.md`
9. `SECURITY.md`
10. `00_DOCUMENTOS_ADICIONALES/TestVocacional_IESN11_preguntas_y_opciones.pdf`
11. `00_DOCUMENTOS_ADICIONALES/informe-tecnico/informe-institucional-main.pdf`

## Contenido

- `client/`: interfaz React, páginas, componentes, estilos y utilidades.
- `server/`: servidor Express, procedimientos tRPC, consultas y controles.
- `shared/`: motor vocacional, preguntas, perfiles, catálogo y archivo histórico.
- `drizzle/`: esquema y migraciones MySQL.
- `scripts/`: auditorías, análisis y generación de QR/afiche.
- `docs/`: arquitectura, gobierno de datos, operación, análisis y contribución.
- `00_DOCUMENTOS_ADICIONALES/`: contexto maestro, informe institucional, preguntas y anexo técnico.
- `assets-institucionales/`: logo del IES N.° 11.

## Exclusiones de seguridad

Este paquete no incluye datos personales reales, CSV históricos, archivos PBIX, bases reales, secretos, contraseñas, `.env`, credenciales, tokens, `node_modules`, `.git`, logs ni builds generados. Las dependencias se regeneran con `pnpm install`.

## Instalación técnica resumida

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

Para ejecutar la aplicación se requiere configurar una base compatible con MySQL y las variables de entorno documentadas en `.env.example`. La plataforma se encuentra completamente desacoplada y opera de forma autónoma (completada la migración fuera de dependencias de entornos externos como Manus), tal como se explica en `docs/` y `EVOLUCION_PERMANENTE.md`.

## Regla institucional esencial

El archivo histórico de la Expo Educativa 2026 y la versión permanente operan de forma separada. La nueva versión utiliza una base de datos, secretos, dominio y almacenamiento propios. El catálogo activo de la evolución permanente es el de **17 tecnicaturas oficiales vigentes** (`2026.10-oficial-17`), con *TS en Acompañamiento Terapéutico* en modelado; las referencias de 18 y 19 tecnicaturas se conservan exclusivamente para interpretar registros históricos.
