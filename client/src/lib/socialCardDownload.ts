import { toPng } from "html-to-image";

type DownloadLink = {
  href: string;
  download: string;
  click: () => void;
};

type DownloadDocument = {
  createElement: (tagName: "a") => DownloadLink;
};

export function buildSocialCardFilename(programName: string) {
  const slug = programName.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase();
  return `mi-resultado-vocacional-ies11-${slug}.png`;
}

export async function downloadSocialCardPng(node: HTMLElement, programName: string, downloadDocument: DownloadDocument = document) {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#102d54",
  });
  const link = downloadDocument.createElement("a");
  link.href = dataUrl;
  link.download = buildSocialCardFilename(programName);
  link.click();
  return { dataUrl, filename: link.download };
}
