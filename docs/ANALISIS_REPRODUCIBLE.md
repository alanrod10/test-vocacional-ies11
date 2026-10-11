# Análisis reproducible de exportaciones autorizadas

El análisis se ejecuta sobre una copia local y autorizada del CSV final. El archivo original no se agrega al repositorio. El script `scripts/analyzeFinalCsv.py` recibe la ruta del archivo y genera resultados agregados en Markdown y JSON; no debe imprimirse ni persistirse información personal en los artefactos de análisis.

```bash
python3 scripts/analyzeFinalCsv.py /ruta/autorizada/resultados.csv \
  --markdown-output /ruta/segura/analisis.md \
  --json-output /ruta/segura/analisis.json
```

Antes de publicar un resultado se debe revisar: cantidad total de evaluaciones, número de columnas, completitud de campos requeridos, duplicados de ID, distribución por versión y el umbral de privacidad para categorías pequeñas. Los rankings deben indicar si corresponden a primera afinidad o a presencia en Top 3; no se deben presentar como matrícula prevista.

Los gráficos institucionales se generan únicamente a partir de conteos agregados. Toda consulta ad hoc debe conservar la misma regla: el resultado compartido nunca incluye una fila individual ni un grupo que permita inferir una identidad.
