import csv
import json
import math
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from statistics import mean, median


INPUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/home/ubuntu/upload/resultados-vocacional-ies11-2026-08-22.csv")
OUTPUT = Path("/home/ubuntu/Analisis_Resultados_Exposicion_2026-08-22.md")
SUMMARY = Path("/home/ubuntu/Analisis_Resultados_Exposicion_2026-08-22.json")
MIN_PUBLIC_COUNT = 3


def clean(value):
    return (value or "").strip()


def find_column(headers, *names):
    normalized = {re.sub(r"[^a-z0-9]", "", h.lower()): h for h in headers}
    for name in names:
        key = re.sub(r"[^a-z0-9]", "", name.lower())
        if key in normalized:
            return normalized[key]
    return None


def markdown_table(headers, rows):
    output = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    output += ["| " + " | ".join(str(cell).replace("|", "\\|") for cell in row) + " |" for row in rows]
    return "\n".join(output)


def public_breakdown(counter, total):
    visible = []
    suppressed = 0
    for value, count in counter.most_common():
        if count >= MIN_PUBLIC_COUNT:
            visible.append((value or "Sin dato", count, f"{count / total * 100:.1f}%"))
        else:
            suppressed += count
    if suppressed:
        visible.append(("Otras categorías / resguardado", suppressed, f"{suppressed / total * 100:.1f}%"))
    return visible


with INPUT.open("r", encoding="utf-8-sig", newline="") as file:
    sample = file.read(4096)
    file.seek(0)
    try:
        delimiter = csv.Sniffer().sniff(sample, delimiters=";,").delimiter
    except csv.Error:
        delimiter = ";"
    reader = csv.DictReader(file, delimiter=delimiter)
    headers = reader.fieldnames or []
    rows = [{key: clean(value) for key, value in row.items()} for row in reader]

total = len(rows)
if not total:
    raise SystemExit("El CSV no contiene filas de evaluación.")

id_col = find_column(headers, "ID")
age_col = find_column(headers, "Edad")
sex_col = find_column(headers, "Sexo")
locality_col = find_column(headers, "Localidad")
education_col = find_column(headers, "Situacion_Educativa", "Situación educativa")
questionnaire_col = find_column(headers, "Version_Cuestionario")
catalog_col = find_column(headers, "Version_Catalogo")
result_col = find_column(headers, "Tecnicatura_Recomendada")
area_col = find_column(headers, "Area", "Área")

missing_by_column = {header: sum(1 for row in rows if not row.get(header)) for header in headers}
required = [column for column in [id_col, age_col, sex_col, locality_col, education_col, questionnaire_col, catalog_col, result_col, area_col] if column]
required_missing = {column: missing_by_column[column] for column in required if missing_by_column[column]}

ids = [row[id_col] for row in rows] if id_col else []
duplicate_ids = len(ids) - len(set(ids))
response_columns = [header for header in headers if re.fullmatch(r"P\d{2}_Opcion", header)]
response_text_columns = [header for header in headers if re.fullmatch(r"P\d{2}_Texto", header)]
affinity_positions = sorted({int(match.group(1)) for header in headers if (match := re.fullmatch(r"Afinidad_(\d+)_Carrera", header))})

exact_response_signatures = Counter(tuple(row.get(column, "") for column in response_columns) for row in rows)
repeated_response_patterns = sum(count for count in exact_response_signatures.values() if count > 1)

age_values = []
for row in rows:
    try:
        age_values.append(int(row.get(age_col, "")))
    except (TypeError, ValueError):
        pass

age_bands = Counter()
for age in age_values:
    if age < 18:
        age_bands["Menores de 18"] += 1
    elif age <= 24:
        age_bands["18 a 24"] += 1
    elif age <= 34:
        age_bands["25 a 34"] += 1
    else:
        age_bands["35 o más"] += 1

top1 = Counter(row.get(result_col, "") for row in rows) if result_col else Counter()
areas = Counter(row.get(area_col, "") for row in rows) if area_col else Counter()
top3_presence = Counter()
top3_position = {position: Counter() for position in [1, 2, 3]}
for row in rows:
    for position in [1, 2, 3]:
        career = row.get(f"Afinidad_{position}_Carrera", "")
        if career:
            top3_presence[career] += 1
            top3_position[position][career] += 1

scores_1, score_gaps = [], []
for row in rows:
    try:
        score_1 = float(row.get("Afinidad_1_Puntaje", ""))
        scores_1.append(score_1)
        score_2 = float(row.get("Afinidad_2_Puntaje", ""))
        score_gaps.append(score_1 - score_2)
    except ValueError:
        pass

neutral_by_question = Counter()
for code_col in response_columns:
    text_col = code_col.replace("_Opcion", "_Texto")
    for row in rows:
        if "ninguna" in row.get(text_col, "").lower() and "representa" in row.get(text_col, "").lower():
            neutral_by_question[code_col.replace("_Opcion", "")] += 1

all_neutral = 0
for row in rows:
    labels = [row.get(column, "").lower() for column in response_text_columns]
    if labels and all("ninguna" in label and "representa" in label for label in labels):
        all_neutral += 1

versions_questionnaire = Counter(row.get(questionnaire_col, "Sin dato") for row in rows) if questionnaire_col else Counter()
versions_catalog = Counter(row.get(catalog_col, "Sin dato") for row in rows) if catalog_col else Counter()
questionnaire_catalog_pairs = Counter((row.get(questionnaire_col, "Sin dato"), row.get(catalog_col, "Sin dato")) for row in rows)

quality = {
    "rows": total,
    "columns": len(headers),
    "delimiter": delimiter,
    "duplicate_ids": duplicate_ids,
    "response_columns": len(response_columns),
    "affinity_positions": len(affinity_positions),
    "all_neutral": all_neutral,
    "required_missing": required_missing,
}

summary = {
    "quality": quality,
    "questionnaire_versions": dict(versions_questionnaire),
    "catalog_versions": dict(versions_catalog),
    "top1": dict(top1),
    "top3_presence": dict(top3_presence),
    "areas": dict(areas),
    "age_bands": dict(age_bands),
    "neutral_by_question": dict(neutral_by_question),
}
SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

now = datetime.now().strftime("%d/%m/%Y %H:%M")
lines = [
    "# Análisis final agregado del Test Vocacional IES N.° 11",
    "",
    f"**Fecha de análisis:** {now}.  ",
    "**Fuente:** archivo CSV final compartido por coordinación. Este informe no muestra nombres, apellidos ni identificadores individuales.",
    "",
    "## Resumen ejecutivo",
    "",
    f"El archivo contiene **{total} evaluaciones** y **{len(headers)} columnas**; utiliza separador `{'punto y coma' if delimiter == ';' else 'coma'}` y fue leído correctamente. Se registran {len(response_columns)} columnas de respuesta codificada y {len(affinity_positions)} puestos de afinidad. No se observan identificadores duplicados." if duplicate_ids == 0 else f"El archivo contiene **{total} evaluaciones**, pero se detectaron **{duplicate_ids} identificadores duplicados**, que requieren revisión antes de análisis longitudinal.",
    "",
    "## Calidad, integridad y trazabilidad",
    "",
    markdown_table(["Control", "Resultado", "Lectura"], [
        ["Filas de evaluación", total, "Participaciones incluidas en el CSV."],
        ["Columnas", len(headers), "Estructura analítica tabular."],
        ["Respuestas codificadas", len(response_columns), "Debe corresponder a las 14 preguntas del test."],
        ["Puestos de afinidad", len(affinity_positions), "Incluye el detalle histórico de afinidades."],
        ["IDs duplicados", duplicate_ids, "0 indica trazabilidad individual consistente."],
        ["Respuestas totalmente neutrales", all_neutral, "El servidor evita guardar casos sin señal vocacional."],
        ["Patrones de respuestas repetidos", repeated_response_patterns, "No son un error por sí mismos; pueden reflejar intereses similares."],
    ]),
    "",
    "Las columnas requeridas están completas." if not required_missing else "Se detectaron faltantes en campos relevantes: " + ", ".join(f"{column} ({count})" for column, count in required_missing.items()) + ".",
    "",
    "## Versiones y comparabilidad",
    "",
    markdown_table(["Versión de cuestionario", "Casos"], [[version, count] for version, count in versions_questionnaire.most_common()]),
    "",
    markdown_table(["Versión de catálogo", "Casos"], [[version, count] for version, count in versions_catalog.most_common()]),
    "",
    "Las versiones deben conservarse como dimensión de filtro en cualquier tablero. Los códigos `P##_Opcion` son la referencia más estable para comparar respuestas entre redacciones equivalentes; las columnas `P##_Texto` deben leerse como evidencia contextual de la versión vista por la persona.",
    "",
    "## Perfil agregado de participantes",
    "",
    markdown_table(["Tramo etario", "Casos", "%"], public_breakdown(age_bands, total)),
    "",
    markdown_table(["Sexo", "Casos", "%"], public_breakdown(Counter(row.get(sex_col, "") for row in rows), total) if sex_col else []),
    "",
    markdown_table(["Situación educativa", "Casos", "%"], public_breakdown(Counter(row.get(education_col, "") for row in rows), total) if education_col else []),
    "",
    "La localidad no se desagrega en este informe para evitar identificar indirectamente participantes de categorías pequeñas. Puede analizarse internamente con supresión de grupos menores a tres casos.",
    "",
    "## Afinidades vocacionales",
    "",
    markdown_table(["Tecnicatura", "Primera afinidad", "%"], [[career, count, f"{count / total * 100:.1f}%"] for career, count in top1.most_common()]),
    "",
    markdown_table(["Área", "Primera afinidad", "%"], [[area, count, f"{count / total * 100:.1f}%"] for area, count in areas.most_common()]),
    "",
    markdown_table(["Tecnicatura", "Presencia en Top 3", "% de casos"], [[career, count, f"{count / total * 100:.1f}%"] for career, count in top3_presence.most_common()]),
    "",
    f"El puntaje de primera afinidad promedia **{mean(scores_1):.1f}** puntos (mediana {median(scores_1):.1f}) y la brecha promedio frente a la segunda afinidad es de **{mean(score_gaps):.1f}** puntos." if scores_1 and score_gaps else "No fue posible calcular la concentración de puntajes por falta de valores de afinidad.",
    "",
    "Las primeras afinidades describen preferencias de esta muestra y no matrícula futura ni demanda laboral. El Top 3 es especialmente útil para reconocer carreras que aparecen como opción cercana aunque no lideren el ranking individual.",
    "",
    "## Respuestas neutrales y comprensión",
    "",
    markdown_table(["Pregunta", "Respuestas neutrales", "% de casos"], [[question, count, f"{count / total * 100:.1f}%"] for question, count in sorted(neutral_by_question.items())]),
    "",
    "Una frecuencia neutral alta puede indicar falta de identificación con el escenario, falta de experiencia previa o una consigna que merece revisión cualitativa. No debe interpretarse automáticamente como un defecto del cuestionario.",
    "",
    "## Límites de interpretación",
    "",
    "La muestra corresponde a quienes participaron voluntariamente en la jornada; no es aleatoria ni representa necesariamente a toda la población estudiantil de Jujuy. Las comparaciones entre versiones de catálogo deben mantenerse separadas. Los resultados son orientación inicial y no sustituyen entrevistas, información académica ni decisiones individuales.",
    "",
    "## Próximos análisis posibles",
    "",
    "Se recomienda construir un tablero filtrable por versión de cuestionario y catálogo, fecha, área y situación educativa. Si se revisa el instrumento, conviene combinar estas métricas con entrevistas breves a participantes sobre comprensión de consignas, evitando modificar ponderaciones solo por frecuencias observadas.",
]

OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(OUTPUT)
print(SUMMARY)
