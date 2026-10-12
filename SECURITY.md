# Políticas de Seguridad y Tratamiento Responsable

Este documento define los estándares de ciberseguridad, gestión de secretos, protección contra inyecciones y respuesta ante incidentes aplicables a la infraestructura del **Test Vocacional IES N.° 11**.

---

## 1. Principios de Seguridad

1. **Privacidad por Defecto y Zero-PII:** La plataforma en modo permanente no almacena información de identificación personal (PII) de los participantes. Nombres y apellidos nunca se escriben en disco ni en la base de datos MySQL.
2. **Menor Privilegio (PoLP):** La API tRPC distingue entre endpoints anónimos de evaluación (`publicProcedure`), endpoints de solo lectura estadística (`viewerProcedure`) y operaciones destructivas o de extracción de datos (`adminProcedure`).
3. **Defensa en Profundidad:** Se aplican múltiples capas de protección: cifrado en reposo y en tránsito, cookies blindadas contra XSS, sanitización de entradas, rate limiting y escapado preventivo de exportaciones.

---

## 2. Gestión de Secretos y Credenciales

- **Variables de Entorno Exclusivas:** Ninguna contraseña, hash, clave simétrica o URL de conexión debe ser registrada en el control de versiones Git. Todos los secretos se configuran mediante el archivo `.env` en el servidor, basándose en la plantilla [.env.example](file:///.env.example).
- **Parámetros Críticos:**
  - `DATABASE_URL`: Cadena de conexión protegida con usuario MySQL con permisos acotados al esquema del test.
  - `ADMIN_INITIAL_PASSWORD`: Contraseña para la inicialización automática del usuario administrador maestro en el primer arranque.
  - `ADMIN_JWT_SECRET`: Clave secreta de alta entropía (mínimo 32 caracteres criptográficamente pseudoaleatorios) utilizada para firmar y validar tokens de sesión.
  - `INSTANCE_MODE`: Define el nivel de inmutabilidad (`permanent` o `historical`).
- **Almacenamiento de Contraseñas:** Las contraseñas de los usuarios del panel administrativo se almacenan en la tabla `admin_users` exclusivamente como hashes criptográficos generados mediante **bcrypt** con un factor de costo (salt rounds) de 10.

---

## 3. Seguridad de Sesiones y Cookies Web

El acceso al panel administrativo (`/admin/dashboard`) emplea tokens JWT transportados en cookies seguras:

- **Atributo `HttpOnly`:** La cookie `ies11_admin_token` no es accesible desde el contexto de ejecución de JavaScript en el navegador, mitigando el robo de sesiones ante potenciales vectores de Cross-Site Scripting (XSS).
- **Atributo `SameSite=Lax`:** Protege contra ataques de falsificación de peticiones en sitios cruzados (CSRF), garantizando que la cookie no sea enviada en solicitudes invocadas por sitios externos no confiables.
- **Atributo `Secure`:** En entornos de producción con HTTPS, la cookie solo se transmite sobre canales cifrados TLS.
- **Caducidad Automática:** Las sesiones expiran a las 8 horas de inactividad, exigiendo un nuevo inicio de sesión.

---

## 4. Prevención de Inyección de Fórmulas CSV (CWE-1236)

Las exportaciones en formato CSV consumidas por Microsoft Excel, LibreOffice Calc o Google Sheets son susceptibles a ataques de **CSV Formula Injection** si un participante malicioso introduce texto libre que comience con operadores de cálculo.

### Mecanismo de Sanitización Implementado
La función [`escapeCsv`](file:///mnt/c/Proyecto%20Test%20Vocacional%20IES%2011/Test_Vocacional_IES11_Paquete_Completo_v1.0.0/server/db.ts#L513-L520) evalúa cada celda antes de su emisión. Si el texto comienza con cualquiera de los caracteres desencadenantes de fórmulas (`=`, `+`, `-`, `@`), se le antepone automáticamente un apóstrofe protector (`'`):

```typescript
export function escapeCsv(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  // Neutraliza fórmulas anteponiendo apóstrofe (')
  const safeText = /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}
```

Esto asegura que las hojas de cálculo interpreten la celda como texto literal inofensivo, impidiendo la ejecución de comandos DDE, macros o exfiltración de datos.

---

## 5. Mitigación de Fuerza Bruta (Rate Limiting)

El servidor implementa un limitador de frecuencia adaptativo en memoria ([`server/_core/rateLimiter.ts`](file:///mnt/c/Proyecto%20Test%20Vocacional%20IES%2011/Test_Vocacional_IES11_Paquete_Completo_v1.0.0/server/_core/rateLimiter.ts)) que rastrea las solicitudes por dirección IP de origen:

- **Autenticación (`adminAuth.login`):** Máximo de 5 intentos fallidos consecutivos por IP. Una vez superado el umbral, se bloquea la IP por un período de enfriamiento de 15 minutos.
- **Exportaciones masivas (`vocational.exportCsv`):** Límite de solicitudes por minuto para evitar sobrecarga de CPU y memoria RAM.

---

## 6. Reporte Responsable de Vulnerabilidades

Si cualquier desarrollador, docente o colaborador identifica un posible fallo de seguridad:

1. **Canal Confidencial:** No crear incidencias públicas en GitHub ni discutir la vulnerabilidad en foros o redes sociales.
2. **Contacto Institucional:** Comunicar el hallazgo de inmediato al equipo directivo o al responsable técnico de la carrera de Ciencias de Datos e Inteligencia Artificial del IES N.° 11.
3. **Contenido del Reporte:** Incluir descripción técnica del vector de ataque, prueba de concepto reproducible (PoC) y pasos sugeridos para su mitigación.
4. **Respuesta y Parche:** El equipo técnico evaluará la gravedad, desarrollará el parche correspondiente en una rama privada y desplegará la actualización antes de cualquier divulgación coordinada.
