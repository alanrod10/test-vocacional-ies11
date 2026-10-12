# Operación, Mantenimiento y Gestión del Ciclo de Vida

Este manual proporciona las directrices operativas para administradores de sistemas, docentes y personal directivo del **Instituto de Educación Superior N.° 11** a cargo del mantenimiento, despliegue y gobierno continuo del Test Vocacional.

---

## 1. Operación Cotidiana y Monitoreo del Servicio

### 1.1. Arquitectura de Ejecución
La aplicación corre como un proceso Node.js gestionado habitualmente por un orquestador de procesos (ej. `pm2`, `systemd` o contenedor Docker):

```bash
# Iniciar el servidor en producción compilado
NODE_ENV=production node dist/index.js
```

### 1.2. Inicialización Automática de Administradores (*Seeding*)
Al iniciar el servidor, la función [`seedInitialAdminUser`](file:///mnt/c/Proyecto%20Test%20Vocacional%20IES%2011/Test_Vocacional_IES11_Paquete_Completo_v1.0.0/server/db.ts#L850-L875) verifica si existe algún usuario en la tabla `admin_users`. Si la tabla se encuentra vacía, crea automáticamente el usuario definido en las variables de entorno:
- `ADMIN_INITIAL_USER`: Nombre de usuario inicial (por defecto: `admin`).
- `ADMIN_INITIAL_PASSWORD`: Contraseña en texto plano que el servidor hashea con `bcrypt` (10 rounds) antes de insertarla con rol `admin`.

Una vez sembrado el primer usuario, se recomienda cambiar la contraseña o crear usuarios específicos para el personal asignado.

---

## 2. Gestión de Accesos y Roles Administrativos

El sistema implementa dos roles en la tabla `admin_users`:

| Rol | Permisos Habilitados | Casos de Uso Recomendados |
|---|---|---|
| **`viewer` (Visualizador)** | Consulta del panel de métricas agrupadas (`vocational.analytics`), gráficos de distribución y filtros por versión de catálogo. | Docentes orientadores, coordinadores de carrera y autoridades que requieren consultar estadísticas agregadas sin manipular datos. |
| **`admin` (Administrador)** | Todo lo anterior más: exportación dimensional de datos (`exportCsv`), borrado individual por derecho al olvido (`deleteAssessment`) y reinicio de resultados (`reset`). | Responsables técnicos de la plataforma y administradores de bases de datos del IES N.° 11. |

---

## 3. Actualización del Catálogo y Carreras

Toda la oferta académica del instituto se define de manera centralizada en [`shared/vocational.ts`](file:///mnt/c/Proyecto%20Test%20Vocacional%20IES%2011/Test_Vocacional_IES11_Paquete_Completo_v1.0.0/shared/vocational.ts).

### 3.1. Estados de Carrera (*ProgramStatus*)
Cada tecnicatura cuenta con un atributo `status` que determina su tratamiento por el motor psicométrico y el panel administrativo:

```typescript
export type ProgramStatus = "activa" | "retirada" | "pendiente_de_modelado" | "provisional";
```

1. **`activa`:** La carrera forma parte de la oferta académica oficial vigente. El motor calcula su afinidad y puede recomendarla en el Top 3.
2. **`pendiente_de_modelado`:** La carrera ha sido creada institucionalmente (ej. *TS en Acompañamiento Terapéutico*), pero su diseño curricular y ponderación psicométrica aún están en fase de validación. Aparece documentada en el catálogo institucional pero no compite en el ranking activo hasta su aprobación formal.
3. **`retirada`:** La carrera ya no se dicta activamente (ej. *TS en Museología y Gestión Patrimonial*, *TS en Guía de Turismo*). No participa en nuevos cálculos, pero su perfil se preserva para interpretar correctamente evaluaciones históricas de ciclos anteriores.
4. **`provisional`:** Estado transitorio para tecnicaturas en período de evaluación diagnóstica.

### 3.2. Procedimiento para Modificar una Tecnicatura
1. Crear una rama de mantenimiento: `git checkout -b chore/actualizar-catalogo`.
2. Actualizar la definición en `PROGRAM_CATALOG` dentro de `shared/vocational.ts`.
3. Si cambia el número de carreras activas, actualizar la constante de versión:
   ```typescript
   export const CATALOG_VERSION = "2026.XX-oficial-XX";
   ```
4. Ejecutar la suite de pruebas para confirmar que no se rompan desempates ni simulaciones:
   ```bash
   pnpm check && pnpm test
   ```

---

## 4. Procedimiento para Ejercer el Derecho al Olvido (Borrado por ID)

Si un participante solicita formalmente que su evaluación sea retirada del banco de datos:

1. El participante debe suministrar su número de `ID_Evaluacion` asignado al momento de realizar el test.
2. Un usuario con rol `admin` ingresa a `/admin/dashboard`.
3. Presiona el botón **"Borrar por ID"**.
4. Introduce el número de ID solicitado y confirma la operación.
5. El sistema elimina permanentemente la fila en `vocational_assessments` y asienta el registro de auditoría en `vocational_admin_actions`.

---

## 5. Protocolo de Resguardo y Reinicio de Métricas

Para iniciar un nuevo ciclo lectivo o limpiar datos de prueba antes de un evento oficial:

> [!WARNING]
> La operación de reinicio elimina **todas** las evaluaciones acumuladas en la base de datos de forma irreversible.

1. **Verificar que la instancia esté en modo permanente:** El reinicio está completamente deshabilitado si `INSTANCE_MODE="historical"`.
2. **Primera Confirmación:** En el panel, presionar "Reiniciar métricas" y aceptar la advertencia.
3. **Descarga de Respaldo Obligatoria:** El sistema descargará automáticamente el archivo de respaldo (`FactEvaluaciones-YYYY-MM-DD.csv`). Si la descarga no se completa, el servidor no emitirá el recibo de respaldo (`backupReceipt`) y abortará el proceso.
4. **Desafío Criptográfico y Segunda Confirmación:** El servidor emite un desafío (`challenge`). Tras confirmar por segunda vez, se envía la petición firmada y se ejecuta la eliminación.
5. **Archivo Seguro:** El archivo CSV descargado debe trasladarse de inmediato al almacenamiento institucional seguro fuera del servidor web.

---

## 6. Diagnóstico y Resolución de Problemas

| Síntoma | Causa Probable | Solución |
|---|---|---|
| Error `ECONNREFUSED 127.0.0.1:3306` | El servicio MySQL no está iniciado o la variable `DATABASE_URL` es incorrecta. | Verificar estado con `systemctl status mysql` y comprobar credenciales en `.env`. |
| Error `UNAUTHORIZED` en `/admin/dashboard` | La cookie de sesión `ies11_admin_token` expiró o la clave `ADMIN_JWT_SECRET` fue modificada. | Iniciar sesión nuevamente en `/admin/login`. |
| Fallo en descarga de PDF en teléfonos móviles antiguos | El navegador bloqueó pop-ups o no soporta dynamic import. | Habilitar ventanas emergentes en el navegador móvil y verificar conexión estable. |
| Gráficos con categorías agrupadas en "Otros" | Regla de supresión de privacidad ($N < 3$). | Comportamiento esperado por diseño metodológico para resguardar la identidad de los participantes. |
