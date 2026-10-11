# Contribuir al repositorio privado

Cada cambio debe comenzar con una descripción de su objetivo, impacto esperado y evidencia de que no introduce exposición de datos. Las solicitudes de integración deben ser revisadas por al menos una persona con conocimiento del instrumento y otra con responsabilidad técnica cuando afecten reglas de puntaje, administración o persistencia.

## Secuencia de integración

1. Crear una rama descriptiva y evitar modificaciones directas sobre la rama principal.
2. Actualizar las pruebas relevantes y ejecutar `pnpm check` y `pnpm test`.
3. Revisar accesibilidad, experiencia móvil y preferencia de reducción de movimiento cuando se modifique la interfaz.
4. Evaluar si el cambio obliga a una nueva versión de cuestionario o catálogo.
5. Confirmar que no se agregaron CSV, respaldos, claves ni datos personales al conjunto de cambios.
6. Documentar la decisión y obtener aprobación antes de integrar.

Los cambios de contenido institucional deben validar el nombre completo de la tecnicatura, su vigencia y la descripción profesional. Las modificaciones a la exportación CSV deben conservar compatibilidad analítica o documentar claramente la ruptura y el plan de migración.
