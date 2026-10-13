import { describe, expect, it } from "vitest";
import { calculateAnalytics } from "./routers";
import {
  CATALOG_VERSION,
  EXPO_CATALOG_VERSION,
  LEGACY_CATALOG_VERSION,
} from "../shared/vocational";
import { SUPPRESSED_LABEL } from "./privacySuppression";

describe("Analítica agregada y supresión de privacidad (AG-12)", () => {
  it("el payload es 100% agregado y no contiene registros ni nombres individuales", () => {
    const syntheticData = [
      {
        id: 1,
        firstName: "María",
        lastName: "Aramayo",
        age: 18,
        sex: "Femenino",
        locality: "San Salvador de Jujuy",
        educationStatus: "Secundario: último año",
        studyIntent: "Sí, definitivamente",
        dataConsent: true,
        resultProgram: "TS en Enfermería",
        resultArea: "Salud y Bienestar",
        selections: { Q01: "0", Q02: "1" },
        scoreSnapshot: [
          { program: "TS en Enfermería", score: 95, area: "Salud y Bienestar" },
          { program: "TS en Desarrollo de Software", score: 70, area: "Tecnología e Innovación" },
        ],
        catalogVersion: CATALOG_VERSION,
        createdAt: new Date(),
      },
      {
        id: 2,
        firstName: "Carlos",
        lastName: "Mamani",
        age: 22,
        sex: "Masculino",
        locality: "Palpalá",
        educationStatus: "Egresé del secundario",
        studyIntent: "Sí, probablemente",
        dataConsent: true,
        resultProgram: "TS en Desarrollo de Software",
        resultArea: "Tecnología e Innovación",
        selections: { Q01: "1", Q02: "0" },
        scoreSnapshot: [
          { program: "TS en Desarrollo de Software", score: 90, area: "Tecnología e Innovación" },
          { program: "TS en Enfermería", score: 80, area: "Salud y Bienestar" },
        ],
        catalogVersion: CATALOG_VERSION,
        createdAt: new Date(),
      },
    ] as any;

    const result = calculateAnalytics(syntheticData);

    // Verificar que el payload contiene solo datos agregados
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("ranking");
    expect(result).toHaveProperty("areaDistribution");
    expect(result).toHaveProperty("sexDistribution");
    expect(result).toHaveProperty("ageDistribution");
    expect(result).toHaveProperty("localityDistribution");
    expect(result).toHaveProperty("catalogViews");

    // Verificar que NINGUNA propiedad contenga arrays de nombres o selecciones de participantes
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("María");
    expect(serialized).not.toContain("Aramayo");
    expect(serialized).not.toContain("Carlos");
    expect(serialized).not.toContain("Mamani");
    expect(serialized).not.toContain("selections");
  });

  it("suprime grupos demográficos con N = 2 y aplica supresión complementaria", () => {
    // Generar datos sintéticos donde:
    // Localidad "San Salvador de Jujuy" = 10 (N >= 3)
    // Localidad "Palpalá" = 5 (N >= 3)
    // Localidad "Perico" = 2 (N = 2, menor a 3 -> supresión primaria)
    const syntheticData: any[] = [];
    let id = 1;

    for (let i = 0; i < 10; i++) {
      syntheticData.push({
        id: id++,
        age: 20,
        sex: "Femenino",
        locality: "San Salvador de Jujuy",
        educationStatus: "Secundario: último año",
        resultProgram: "TS en Enfermería",
        resultArea: "Salud y Bienestar",
        scoreSnapshot: [{ program: "TS en Enfermería", score: 90, area: "Salud y Bienestar" }],
        catalogVersion: CATALOG_VERSION,
      });
    }

    for (let i = 0; i < 5; i++) {
      syntheticData.push({
        id: id++,
        age: 22,
        sex: "Masculino",
        locality: "Palpalá",
        educationStatus: "Secundario: último año",
        resultProgram: "TS en Enfermería",
        resultArea: "Salud y Bienestar",
        scoreSnapshot: [{ program: "TS en Enfermería", score: 90, area: "Salud y Bienestar" }],
        catalogVersion: CATALOG_VERSION,
      });
    }

    // Categoría con N=2
    for (let i = 0; i < 2; i++) {
      syntheticData.push({
        id: id++,
        age: 25,
        sex: "Femenino",
        locality: "Perico",
        educationStatus: "Secundario: último año",
        resultProgram: "TS en Enfermería",
        resultArea: "Salud y Bienestar",
        scoreSnapshot: [{ program: "TS en Enfermería", score: 90, area: "Salud y Bienestar" }],
        catalogVersion: CATALOG_VERSION,
      });
    }

    const result = calculateAnalytics(syntheticData);
    const localityDist = result.localityDistribution;

    // Perico (N=2) NO debe aparecer individualizado
    const pericoItem = localityDist.find((item) => item.label === "Perico");
    expect(pericoItem).toBeUndefined();

    // Debido a supresión complementaria, la categoría siguiente más pequeña (Palpalá: 5)
    // también debe ser absorbida en "Otros / No revelado" para evitar que N=2 sea deducido restando del total 17.
    const otrosItem = localityDist.find((item) => item.label === SUPPRESSED_LABEL);
    expect(otrosItem).toBeDefined();
    expect(otrosItem?.value).toBe(7); // 2 de Perico + 5 de Palpalá

    // San Salvador permanece visible con 10
    const sanSalvadorItem = localityDist.find((item) => item.label === "San Salvador de Jujuy");
    expect(sanSalvadorItem?.value).toBe(10);
  });

  it("consolida y clasifica correctamente las evaluaciones dentro del catálogo oficial de 18 tecnicaturas", () => {
    const syntheticData = [
      {
        id: 1,
        resultProgram: "TS en Desarrollo de Software",
        resultArea: "Tecnología e Innovación",
        catalogVersion: CATALOG_VERSION,
        scoreSnapshot: [{ program: "TS en Desarrollo de Software", score: 90, area: "Tecnología e Innovación" }],
      },
      {
        id: 2,
        resultProgram: "TS en Acompañante Terapéutico",
        resultArea: "Salud y Bienestar",
        catalogVersion: CATALOG_VERSION,
        scoreSnapshot: [{ program: "TS en Acompañante Terapéutico", score: 85, area: "Salud y Bienestar" }],
      },
      {
        id: 3,
        resultProgram: "TS en Enfermería",
        resultArea: "Salud y Bienestar",
        catalogVersion: CATALOG_VERSION,
        scoreSnapshot: [{ program: "TS en Enfermería", score: 92, area: "Salud y Bienestar" }],
      },
    ] as any;

    const result = calculateAnalytics(syntheticData);

    const officialView = result.catalogViews.find((v) => v.version === CATALOG_VERSION);

    expect(officialView?.total).toBe(3);
    expect(officialView?.programCount).toBe(18);

    // El catálogo oficial de 18 carreras incluye TS en Acompañante Terapéutico
    expect(officialView?.ranking.find((r) => r.program === "TS en Acompañante Terapéutico")).toBeDefined();
  });

  it("calcula la frecuencia y tasa de empates en el 1.er lugar", () => {
    const syntheticData = [
      {
        id: 1,
        resultProgram: "TS en Enfermería",
        resultArea: "Salud y Bienestar",
        catalogVersion: CATALOG_VERSION,
        // Empate en 1.er lugar: score 90 en ambas
        scoreSnapshot: [
          { program: "TS en Enfermería", score: 90, area: "Salud y Bienestar" },
          { program: "TS en Desarrollo de Software", score: 90, area: "Tecnología e Innovación" },
        ],
      },
      {
        id: 2,
        resultProgram: "TS en Enfermería",
        resultArea: "Salud y Bienestar",
        catalogVersion: CATALOG_VERSION,
        // Sin empate: 95 vs 80
        scoreSnapshot: [
          { program: "TS en Enfermería", score: 95, area: "Salud y Bienestar" },
          { program: "TS en Desarrollo de Software", score: 80, area: "Tecnología e Innovación" },
        ],
      },
    ] as any;

    const result = calculateAnalytics(syntheticData);
    const officialView = result.catalogViews.find((v) => v.version === CATALOG_VERSION);

    expect(officialView?.tieCount).toBe(1);
    expect(officialView?.tieRate).toBe(50.0);
  });
});
