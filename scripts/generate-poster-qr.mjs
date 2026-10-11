import QRCode from "qrcode";

const targetUrl = process.env.APP_URL ?? "https://testvocacional.ies11.edu.ar";
const outputPath = process.argv[2] ?? "./qr-test-vocacional-ies11.png";

await QRCode.toFile(outputPath, targetUrl, {
  width: 1800,
  margin: 4,
  errorCorrectionLevel: "H",
  color: { dark: "#102D54", light: "#FFFFFF" },
});

console.log(`QR listo para impresión: ${outputPath}`);
