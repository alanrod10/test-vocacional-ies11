# Metodología Psicométrica y Trazabilidad del Catálogo

Este documento describe los fundamentos psicométricos, las reglas matemáticas de ponderación, la evolución del catálogo de carreras y el borrador de la próxima generación (motor v2) del **Test Vocacional del Instituto de Educación Superior N.° 11**.

---

## 1. Fundamentación Teórica y Alcance del Instrumento

### 1.1. Modelo Tipológico RIASEC
El instrumento se fundamenta en la teoría de tipos de personalidad y ambientes laborales desarrollada por **John L. Holland**, adaptada pedagógicamente a la realidad socio-productiva y formativa de la Provincia de Jujuy y el Noroeste Argentino (NOA). El modelo clasifica intereses y perfiles en seis dimensiones ortogonales:

- **R (Realista):** Orientación hacia tareas manuales, operativas, manipulación de herramientas, equipamiento y trabajo de campo.
- **I (Investigativo):** Orientación hacia la indagación analítica, el método científico, resolución de problemas abstractos y análisis de datos.
- **A (Artístico):** Orientación hacia la expresión creativa, el diseño visual, la comunicación estética y la innovación textil o gastronómica.
- **S (Social):** Orientación hacia la asistencia, la enseñanza, el cuidado de la salud, la contención comunitaria y el trabajo directo con personas.
- **E (Emprendedor):** Orientación hacia el liderazgo, la gestión de proyectos, coordinación de equipos, hotelería y articulación institucional.
- **C (Convencional):** Orientación hacia la organización de procesos, cumplimiento de normativas, registros sistemáticos, trazabilidad y control de calidad.

### 1.2. Alcance Institucional: Orientación Inicial vs. Diagnóstico Clínico
> [!IMPORTANT]
> El Test Vocacional IES N.° 11 es una herramienta de **orientación formativa inicial e informativa**. En ningún caso constituye un psicodiagnóstico, evaluación psicotécnica ni examen vocacional exhaustivo. Su propósito exclusivo es propiciar la autorreflexión de los postulantes y dar a conocer la oferta formativa técnica superior de la institución.

---

## 2. Estructura del Cuestionario Situacional (14 Ítems)

El cuestionario v1 vigente se compone de **14 situaciones hipotéticas**:
- **13 situaciones formativas y laborales:** Abordan desafíos de diseño, resolución de problemas técnicos, intervención comunitaria, desafíos de energía o alimentos, y tareas cotidianas.
- **1 pregunta institucional:** Indaga sobre la intención de inscripción y conocimiento de las carreras del IES N.° 11.

### Manejo de la Opción Neutral
Cada pregunta incluye alternativas situacionales asociadas a combinaciones de factores RIASEC y una alternativa neutral explícita:
> *"Ninguna de estas opciones me representa"* (o *"Prefiero no responder"* en la pregunta institucional).

Esta alternativa neutral no suma ponderación a ningún vector ($V(\emptyset)$), evitando forzar elecciones que distorsionen el perfil vocacional cuando el participante no se identifica con las opciones presentadas.

---

## 3. Motor de Cálculo y Reglas de Ponderación

### 3.1. Vector de Intereses del Participante ($V_p$)
Cada opción elegida aporta pesos específicos a las dimensiones RIASEC. El vector acumulado del participante se calcula como:
$$V_p = \sum_{i=1}^{14} W(q_i, opt_i)$$
Donde $W(q_i, opt_i) \in \mathbb{R}^6_{\ge 0}$.

### 3.2. Perfiles de las Tecnicaturas ($V_c$)
Cada una de las Tecnicaturas Superiores del catálogo cuenta con un perfil vocacional modelado por docentes especialistas en la disciplina, expresado en las mismas 6 dimensiones:
$$V_c = (R_c, I_c, A_c, S_c, E_c, C_c)$$

### 3.3. Puntuación de Afinidad
La afinidad bruta entre el participante y una carrera se obtiene mediante el producto punto ponderado y anclajes directos de preguntas clave, normalizándose a una escala percentil de 0 a 100:
$$\text{Score}(p, c) = \min\left(100, \max\left(0, \frac{V_p \cdot V_c}{\|V_p\|_1 \cdot \|V_c\|_1} \times 100 + \text{Anclas}(p, c)\right)\right)$$

### 3.4. Desempate Determinista y Transparencia
En caso de que dos o más carreras obtengan la misma puntuación numérica exacta, el sistema:
1. Prioriza la carrera que pertenezca al área de mayor afinidad general del usuario.
2. Como criterio final de desempate determinista, aplica orden alfabético estricto.
3. **Visibilización de Empates:** La interfaz marca visualmente con un distintivo (*badge*) de **"Empate"** las carreras del Top 3 que hayan igualado en puntaje antes del desempate alfabético, garantizando que el usuario sepa que ambas opciones son igualmente afines.

---

## 4. Presentación de Resultados en Bandas Cualitativas de Afinidad

Para mitigar la *ilusión de precisión matemática absoluta* (evitar que un usuario perciba erróneamente que un "83/100" es científicamente superior a un "81/100"), la interfaz y los reportes reemplazan las puntuaciones crudas por **Bandas Cualitativas de Afinidad**:

| Banda de Afinidad | Rango Relativo / Criterio | Interpretación para el Postulante |
|---|---|---|
| **Afinidad Alta** | 1.er puesto y puntajes con diferencia menor al 5% respecto al líder | Alta coincidencia con los intereses manifestados y las tareas cotidianas de la carrera. |
| **Afinidad Media** | 2.º y 3.er puesto con distancia moderada respecto al líder | Interés significativo con aspectos complementarios del perfil. |
| **Afinidad Exploratoria** | Posiciones del Top 3 con baja intensidad de señal o empates neutrales | Coincidencia en aspectos específicos; se recomienda profundizar en el plan de estudios. |

Las barras de comparación en la interfaz reflejan proporciones reales sin sesgos artificiales de piso mínimo.

---

## 5. Trazabilidad y Versiones del Catálogo Institucional

Para asegurar la comparabilidad estadística interanual sin reinterpretar erróneamente datos históricos, la plataforma clasifica las evaluaciones según su versión de catálogo:

```text
2026.08-legado-19 (Expo 2026 original: 19 TS)
       │
       ▼
2026.08-oficial-18 (Oferta Expo verificada: 18 TS, Museología retirada)
       │
       ▼
2026.10-oficial-17 (Oferta oficial vigente: 17 TS, Guía de Turismo retirada, A.T. en modelado)
```

### 5.1. Catálogo Oficial Vigente (`2026.10-oficial-17`)
- **17 Tecnicaturas Activas:**
  1. *Salud y Bienestar:* TS en Enfermería, TS en Asistencia Odontológica, TS en Laboratorio de Análisis Clínico, TS en Agente Sanitario y Promotor de la Salud, TS en Estadísticas de Salud, TS en Gerontología, TS en Administración de Servicios de Salud.
  2. *Tecnología e Innovación:* TS en Desarrollo de Software, TS en Ciencias de Datos e Inteligencia Artificial.
  3. *Industria, Ambiente y Seguridad:* TS en Seguridad e Higiene Laboral, TS en Gestión de Energías Renovables, TS en Tecnología de los Alimentos.
  4. *Gastronomía, Turismo y Patrimonio:* TS en Cocinas Regionales y Cultura Alimentaria, TS en Hotelería, TS en Turismo.
  5. *Diseño y Arte Aplicado:* TS en Diseño de Indumentaria, TS en Realización de Audiovisuales y Artes del Espectáculo.
- **1 Tecnicatura en Modelado:**
  - *TS en Acompañamiento Terapéutico* (`pendiente_de_modelado`): Incorporada documentalmente con identificador canónico `ts_acompanamiento_terapeutico`. Su ponderación final está sujeta a la aprobación ministerial del plan formativo.
- **2 Tecnicaturas Retiradas:**
  - *TS en Museología y Gestión Patrimonial* (`retirada`): Oferta no activa.
  - *TS en Guía de Turismo* (`retirada`): Oferta cerrada.

---

## 6. Borrador del Motor Metodológico v2 (Próxima Generación)

Como parte de la evolución permanente del instrumento hacia un estándar psicométrico más riguroso, se diseñó el prototipo del **Motor v2**:

1. **36 Micro-Actividades Específicas:** 6 ítems dedicados a cada dimensión RIASEC, equilibrando lenguaje directo y tareas profesionales representativas de la región.
2. **Escala de Frecuencia / Preferencia Likert de 5 Puntos:**
   - (1) Nada atractivo / Nunca me interesaría.
   - (2) Poco atractivo.
   - (3) Neutral / Indiferente.
   - (4) Bastante atractivo.
   - (5) Muy atractivo / Me entusiasmaría hacerlo.
3. **Normalización por Puntuaciones Estándar (Z-Score):**
   $$Z_k = \frac{X_k - \mu_k}{\sigma_k}$$
   Permite controlar el sesgo de aquiescencia (personas que responden positivamente a todo) y neutralidad forzada.
4. **Validación por Simulación de Monte Carlo:** El script [`shared/engineSimulation.test.ts`](file:///mnt/c/Proyecto%20Test%20Vocacional%20IES%2011/Test_Vocacional_IES11_Paquete_Completo_v1.0.0/shared/engineSimulation.test.ts) simula 10.000 perfiles sintéticos para comprobar que todas las tecnicaturas tengan probabilidad positiva de ser recomendadas en primer lugar y que no existan carreras "invisibles" o hipertrofiadas por el algoritmo.
