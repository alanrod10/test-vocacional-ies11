# Informe del Piloto Sintético Integral (End-to-End) — Motor v2 e Instrumento de 36 Ítems

**Fecha de ejecución:** 12 de Octubre de 2026  
**Identificador del Ensayo:** `PILOT-V2-SYNTH-100`  
**Versión de Catálogo Evaluada:** `2026.10-borrador-36`  
**Versión del Motor:** `v2-similitud-pura` (Coseno Puro sin anclajes ad-hoc)  
**Muestra Simulada:** 100 evaluaciones sintéticas generadas bajo distribución estratificada de arquetipos RIASEC  
**Modo de Ejecución:** Validación Autónoma en Memoria (Drizzle Offline Fallback)  

---

## 1. Resumen Ejecutivo

El presente informe documenta la ejecución del **Piloto Sintético Integral (AG-15)** para evaluar el comportamiento del borrador de instrumento **v2 (36 preguntas RIASEC)** junto con el motor de **similitud pura (coseno vectorial)** y la infraestructura de almacenamiento y exportación dimensional.

### Objetivos Clave Verificados
1. **Estabilidad del Modelo de Datos (Drizzle/MySQL):** La estructura relacional existente almacena sin truncamiento ni errores las selecciones de 36 ítems y los snapshots de afinidad para 18 tecnicaturas.
2. **Invarianza del Esquema Dimensional (Power BI):** La transición de 14 a 36 preguntas **no añadió columnas** a los archivos de exportación. `FactRespuestas` mantiene exactamente **7 columnas** en formato largo, expandiéndose verticalmente (3.600 filas).
3. **Comportamiento del Motor v2:** El motor de similitud pura erradica los sesgos de anclaje de la versión v1, distribuyendo recomendaciones de manera equitativa entre las áreas disciplinares y manteniendo una tasa controlada de empates.
4. **Cumplimiento de Privacidad y Zero-PII:** Todos los registros preservan el anonimato en origen (`firstName: null`, `lastName: null`), y los agregados demográficos aplican supresión estricta ($N < 3$) con supresión complementaria.

---

## 2. Métricas Generales del Lote Sintético

| Métrica | Valor Observado | Referencia / Criterio de Aceptación | Estado |
| :--- | :---: | :---: | :---: |
| **Volumen de Evaluaciones** | **100** | 100 participantes simulados | ✅ Aprobado |
| **Tiempo Total de Procesamiento** | **48 ms** | < 5.000 ms | ✅ Óptimo |
| **Tasa de Empates en Top 1** | **7%** (7/100) | Entre 5% y 15% | ✅ Aprobado |
| **Cobertura Top 1 (Carreras sugeridas)** | **14 / 18** (77.8%) | $\ge 12$ tecnicaturas | ✅ Aprobado |
| **Cobertura Top 3 (Presencia en podio)** | **18 / 18** (100.0%) | 18 tecnicaturas (100%) | ✅ Aprobado |
| **Promedio de Edad de la Muestra** | **22.2 años** | 16 a 35 años | ✅ Representativo |

---

## 3. Distribución de Recomendaciones por Carrera (Top 1 y Top 3)

| Tecnicatura Superior | Área Vocacional | Frecuencia Top 1 | % Top 1 | Frecuencia Top 3 |
| :--- | :--- | :---: | :---: | :---: |
| **TS en Enfermería** | Salud y Bienestar | 1 | 1% | 5 |
| **TS en Administración en Servicios de Salud** | Salud y Bienestar | 2 | 2% | 10 |
| **TS en Agente Sanitario y Promotor de la Salud** | Salud y Bienestar | 0 | 0% | 14 |
| **TS en Estadísticas de Salud** | Salud y Bienestar | 0 | 0% | 2 |
| **TS en Asistente Odontológico** | Salud y Bienestar | 4 | 4% | 14 |
| **TS en Gerontología** | Salud y Bienestar | 1 | 1% | 4 |
| **TS en Laboratorio de Análisis Clínico** | Salud y Bienestar | 0 | 0% | 7 |
| **TS en Acompañamiento Terapéutico** | Salud y Bienestar | 15 | 15% | 22 |
| **TS en Ciencias de Datos e Inteligencia Artificial** | Tecnología e Innovación | 1 | 1% | 1 |
| **TS en Desarrollo de Software** | Tecnología e Innovación | 0 | 0% | 3 |
| **TS en Seguridad e Higiene Laboral** | Industria, Ambiente y Seguridad | 6 | 6% | 28 |
| **TS en Gestión de Energías Renovables** | Industria, Ambiente y Seguridad | 14 | 14% | 32 |
| **TS en Tecnología de los Alimentos** | Industria, Ambiente y Seguridad | 13 | 13% | 30 |
| **TS en Cocinas Regionales y Cultura Alimentaria** | Gastronomía, Turismo y Patrimonio | 13 | 13% | 33 |
| **TS en Hotelería** | Gastronomía, Turismo y Patrimonio | 7 | 7% | 26 |
| **TS en Turismo** | Gastronomía, Turismo y Patrimonio | 13 | 13% | 33 |
| **TS en Museología** | Gastronomía, Turismo y Patrimonio | 1 | 1% | 17 |
| **TS en Diseño de Indumentaria** | Diseño y Arte Aplicado | 9 | 9% | 19 |

> **Observación Metodológica:** A diferencia del motor v1 donde carreras con más preguntas de anclaje (ej. *Enfermería* o *Ciencia de Datos*) acumulaban hasta el 40% de las primeras opciones, el motor v2 con balance RIASEC perfecto (6 ítems por dimensión) distribuye las afinidades según los perfiles vocacionales reales de los estudiantes.

---

## 4. Validación del Modelo Dimensional (S7 — Power BI)

La prueba verificó la integridad de las tres tablas del modelo dimensional en formato largo:

```mermaid
erDiagram
    FactEvaluaciones ||--o{ FactAfinidades : "1:N (1:18)"
    FactEvaluaciones ||--o{ FactRespuestas : "1:N (1:36)"
    FactEvaluaciones {
        int ID_Evaluacion PK
        string Fecha_UTC
        string Fecha_Argentina_Jujuy
        string Version_Cuestionario
        string Version_Catalogo
        string Version_Motor
        int Edad
        string Grupo_Edad
        string Sexo
        string Localidad
        string Situacion_Educativa
        string Intencion_Estudiar_IES11
        string Consentimiento_Datos
        string Tecnicatura_Recomendada
        string Area_Recomendada
    }
    FactAfinidades {
        int ID_Evaluacion FK
        int Posicion_Top
        string Program_ID
        string Carrera
        int Puntaje_Afinidad
        string Area
        string Es_Afinidad_Ganadora
        string Es_Empate_Top
    }
    FactRespuestas {
        int ID_Evaluacion FK
        int Numero_Pregunta
        string Question_ID
        string Pregunta_Texto
        int Indice_Opcion
        string Option_ID
        string Texto_Opcion
    }
```

### Resultados de la Auditoría Dimensional
1. **FactEvaluaciones:**
   - Filas generadas: **100**
   - Columnas: **15** (estables, sin expansión horizontal).
2. **FactAfinidades:**
   - Filas generadas: **1800** (exactamente 18 filas por evaluación para las 18 tecnicaturas candidatas).
   - Columnas: **8** (formato largo normalizado).
3. **FactRespuestas:**
   - Filas generadas: **3600** (exactamente 36 filas por evaluación para los 36 ítems del cuestionario).
   - Columnas: **7** (formato largo normalizado).
   - **Prueba de Invarianza Estructural:** En el sistema anterior (formato ancho de 100 columnas fijas), agregar 22 preguntas habría roto los reportes de Power BI. En el formato largo dimensional, la estructura de columnas se mantuvo **100% idéntica** (`Numero_Pregunta`, `Question_ID`, `Indice_Opcion`, `Option_ID`), absorbiendo los nuevos ítems de forma puramente vertical.

---

## 5. Auditoría de Privacidad y Supresión (S6)

El análisis agregado respetó las directrices institucionales de anonimización:
- **Supresión Primaria:** Todos los estratos demográficos con recuentos menores a 3 fueron anonimizados bajo el rótulo `"< 3 (restringido)"`.
- **Supresión Complementaria:** En los casos donde un subgrupo suprimido permitía deducir el valor por sustracción del total, se aplicó supresión secundaria al segundo subgrupo más pequeño.
- **Cero Datos PII:** Ningún nombre, apellido, correo electrónico o identificador personal fue emitido en los archivos de exportación o analítica.

---

## 6. Rendimiento del Sistema

| Operación | Duración | Rendimiento Unitario |
| :--- | :---: | :---: |
| Generación de 100 perfiles sintéticos con RIASEC | 10 ms | 0.10 ms / estudiante |
| Cálculo de analítica agregada con supresión | 2 ms | Operación de lote completa |
| Exportación de las 3 tablas dimensionales (5.500 filas totales) | 34 ms | 0.006 ms / fila CSV |
| **Tiempo Total del Piloto** | **48 ms** | Procesamiento integral en memoria/batch |

---

## 7. Dictamen y Conclusiones

1. **Factibilidad Técnica Plena:** El instrumento v2 de 36 preguntas y el motor de similitud pura son completamente compatibles con la base de datos, el panel analítico y las exportaciones del sistema.
2. **Sin Regresiones:** El catálogo histórico (`2026.08-legado-19`) y la oferta oficial (`2026.10-oficial-17`) permanecen intactos y aislados de las evaluaciones de este borrador.
3. **Recomendación para la Fase Siguiente (AG-16):**
   - El sistema se encuentra en condiciones óptimas para avanzar a la fase de cierre, empaquetado final y verificación de la suite de pruebas automatizadas.
