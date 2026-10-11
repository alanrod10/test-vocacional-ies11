import csv
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path


QUESTION_OPTION_LIMITS = [5, 3, 5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 9, 5]
QUESTION_COLUMNS = [
    column
    for question_id in range(1, 15)
    for column in (f"P{question_id:02d}_Opcion", f"P{question_id:02d}_Texto")
]
AFFINITY_COLUMNS = [
    column
    for position in range(1, 20)
    for column in (
        f"Afinidad_{position}_Carrera",
        f"Afinidad_{position}_Puntaje",
        f"Afinidad_{position}_Area",
    )
]
EXPECTED_HEADERS = [
    "ID",
    "Fecha_UTC",
    "Fecha_Argentina_Jujuy",
    "Version_Cuestionario",
    "Version_Catalogo",
    "Nombre",
    "Apellido",
    "Edad",
    "Sexo",
    "Localidad",
    "Situacion_Educativa",
    "Consentimiento_Datos",
    "Intencion_Estudiar_IES11",
    "Tecnicatura_Recomendada",
    "Area",
    *QUESTION_COLUMNS,
    *AFFINITY_COLUMNS,
]


def is_valid_utc_date(value: str) -> bool:
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
        return True
    except ValueError:
        return False


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python3 scripts/auditExportCsv.py <archivo.csv>")

    path = Path(sys.argv[1])
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter=";")
        headers = reader.fieldnames or []
        rows = list(reader)

    if not rows:
        raise SystemExit("El archivo no contiene filas de datos.")

    empty_counts = {
        header: sum(not (row.get(header) or "").strip() for row in rows)
        for header in headers
    }
    dates_valid = sum(is_valid_utc_date(row.get("Fecha_UTC", "")) for row in rows)
    ages = []
    invalid_answer_codes = []
    incomplete_affinities = []
    top_recommendation_match = 0
    consent_values = Counter()
    intent_values = Counter()
    questionnaire_versions = Counter()
    catalog_versions = Counter()

    for row_index, row in enumerate(rows, start=2):
        try:
            ages.append(int(row["Edad"]))
        except (KeyError, ValueError):
            pass

        for question_id, option_limit in enumerate(QUESTION_OPTION_LIMITS, start=1):
            key = f"P{question_id:02d}_Opcion"
            try:
                option = int(row[key])
                if option < 1 or option > option_limit:
                    invalid_answer_codes.append(f"fila {row_index}: {key}")
            except (KeyError, ValueError):
                invalid_answer_codes.append(f"fila {row_index}: {key}")

        first_affinity = row.get("Afinidad_1_Carrera", "")
        if first_affinity == row.get("Tecnicatura_Recomendada", ""):
            top_recommendation_match += 1

        for position in range(1, 20):
            values = [
                row.get(f"Afinidad_{position}_Carrera", ""),
                row.get(f"Afinidad_{position}_Puntaje", ""),
                row.get(f"Afinidad_{position}_Area", ""),
            ]
            if any(values) and not all(values):
                incomplete_affinities.append(f"fila {row_index}: Afinidad_{position}")

        consent_values[row.get("Consentimiento_Datos", "Sin dato")] += 1
        intent_values[row.get("Intencion_Estudiar_IES11", "Sin dato")] += 1
        questionnaire_versions[row.get("Version_Cuestionario", "Sin dato")] += 1
        catalog_versions[row.get("Version_Catalogo", "Sin dato")] += 1

    print("ARCHIVO: exportación CSV vocacional tabular")
    print(f"Filas de datos: {len(rows)}")
    print(f"Columnas: {len(headers)}")
    print("Encabezados esperados: " + ("sí" if headers == EXPECTED_HEADERS else "no; revisar orden/nombres"))
    print("Campos JSON heredados: " + ("ninguno" if "Respuestas" not in headers and "Afinidades" not in headers else "detectados; revisar versión del archivo"))
    print("Campos vacíos: " + ", ".join(f"{key}={value}" for key, value in empty_counts.items() if value) or "Campos vacíos: ninguno")
    print(f"Fechas UTC válidas: {dates_valid}/{len(rows)}")
    print(f"Edades numéricas: {len(ages)}/{len(rows)}" + (f"; rango={min(ages)}–{max(ages)}" if ages else ""))
    print(f"Códigos de respuesta válidos: {len(rows) * len(QUESTION_OPTION_LIMITS) - len(invalid_answer_codes)}/{len(rows) * len(QUESTION_OPTION_LIMITS)}")
    print(f"Primera afinidad coincide con recomendación: {top_recommendation_match}/{len(rows)}")
    print("Afinidades incompletas: " + (", ".join(incomplete_affinities) if incomplete_affinities else "ninguna"))
    print("Consentimiento (agregado): " + ", ".join(f"{key}={value}" for key, value in consent_values.items()))
    print("Intención de estudiar (agregado): " + ", ".join(f"{key}={value}" for key, value in intent_values.items()))
    print("Versiones de cuestionario (agregado): " + ", ".join(f"{key}={value}" for key, value in questionnaire_versions.items()))
    print("Versiones de catálogo (agregado): " + ", ".join(f"{key}={value}" for key, value in catalog_versions.items()))
    print("Campos identificatorios presentes: Nombre, Apellido, ID.")
    print("Campos semiidentificatorios presentes: Edad, Sexo, Localidad, Situacion_Educativa, Fecha_UTC.")


if __name__ == "__main__":
    main()
