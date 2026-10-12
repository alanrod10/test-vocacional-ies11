import { INSTITUTION_INFO, type ProgramProfile } from "@shared/vocational";
import { detectTies, getAffinityBand } from "./affinityBands";

type RankingItem = { program: string; score: number; area: string };

export type VocationalReport = {
  participant: { name: string; age: number };
  winner: RankingItem;
  topThree: RankingItem[];
  profile: ProgramProfile;
};

async function fetchAsDataUrl(url: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function safeFileName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

export async function downloadVocationalReport(report: VocationalReport) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const navy = "#102D54";
  const blue = "#1976B7";
  const soft = "#EAF6FF";
  let y = 18;

  const logo = await fetchAsDataUrl("/logo-ies11-jujuy.jpg");
  if (logo) doc.addImage(logo, "JPEG", 15, 12, 20, 20);
  doc.setFillColor(navy);
  doc.roundedRect(40, 12, 155, 20, 4, 4, "F");
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Informe de orientación vocacional", 47, 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("IES N.° 11 · Jujuy", 47, 27);
  y = 43;

  const addTitle = (title: string) => {
    if (y > 270) { doc.addPage(); y = 18; }
    doc.setFillColor(soft);
    doc.roundedRect(15, y - 5, 180, 9, 2, 2, "F");
    doc.setTextColor(blue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, 19, y + 1);
    y += 11;
  };

  const addText = (text: string, emphasis = false) => {
    doc.setTextColor(navy);
    doc.setFont("helvetica", emphasis ? "bold" : "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, 172);
    if (y + lines.length * 5 > 278) { doc.addPage(); y = 18; }
    doc.text(lines, 19, y);
    y += lines.length * 5 + 4;
  };

  addTitle("Datos de la persona");
  addText(`Nombre: ${report.participant.name}`);
  addText(`Edad: ${report.participant.age} años`);
  addText(`Fecha de emisión: ${new Date().toLocaleDateString("es-AR", { dateStyle: "long" })}`);

  const ties = detectTies(report.topThree);
  const winnerTie = ties[0] && report.topThree[0]?.score === report.topThree[1]?.score;
  const winnerTieNote = winnerTie ? " · [Empate en 1.er lugar]" : "";

  addTitle("Resultado de afinidad");
  addText(report.winner.program.replace("TS en ", ""), true);
  addText(`Área vocacional: ${report.winner.area} · Nivel: ${getAffinityBand(report.winner.score)}${winnerTieNote}.`);
  addText(report.profile.profile);

  addTitle("Perfil profesional ampliado");
  addText(report.profile.professionalProfile ?? report.profile.profile);

  addTitle("¿Qué podrías hacer al finalizar?");
  addText(report.profile.graduateRole);
  addTitle("Tareas y aportes posibles");
  addText(report.profile.tasks.map((task) => `• ${task}`).join("\n"));

  addTitle("Materias y espacios formativos principales");
  addText(report.profile.subjects.map((subject) => `• ${subject}`).join("\n"));
  addTitle("Campo laboral en Jujuy y el NOA");
  addText(report.profile.field);

  addTitle("Top 3 afinidades");
  report.topThree.forEach((item, index) => {
    const tieTag = ties[index] ? " · [Empate]" : "";
    addText(`${index + 1}. ${item.program.replace("TS en ", "")} · ${getAffinityBand(item.score)}${tieTag} · ${item.area}`);
  });
  if (ties.some(Boolean)) {
    addText("Nota sobre empates: Las tecnicaturas señaladas con [Empate] obtuvieron el mismo nivel de afinidad según tus respuestas; el orden de presentación es alfabético.");
  }

  addTitle("Información institucional");
  addText(`${INSTITUTION_INFO.name}. ${INSTITUTION_INFO.offer}`);
  addText(`${INSTITUTION_INFO.address}. ${INSTITUTION_INFO.enrolment}`);
  addText(`Sitio institucional: ${INSTITUTION_INFO.website}`);
  addText("Este informe orienta la exploración de carreras a partir de intereses expresados. No reemplaza la conversación con docentes, estudiantes y equipos de orientación.");

  doc.setDrawColor(blue);
  doc.line(15, 287, 195, 287);
  doc.setTextColor("#5D7487");
  doc.setFontSize(7.5);
  doc.text("Hecho y desarrollado por alumnos de la carrera de Ciencias de Datos e Inteligencia Artificial del IES N.° 11.", 15, 292);
  doc.save(`informe-ies11-${safeFileName(report.participant.name)}.pdf`);
}
