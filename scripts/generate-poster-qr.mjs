import QRCode from "qrcode";

const targetUrl = "https://vocatest11-j6zpasaq.manus.space";
const outputPath = "/home/ubuntu/ies11-poster/qr-test-vocacional-ies11.png";

await QRCode.toFile(outputPath, targetUrl, {
  width: 1800,
  margin: 4,
  errorCorrectionLevel: "H",
  color: { dark: "#102D54", light: "#FFFFFF" },
});

console.log(`QR listo para impresión: ${outputPath}`);
