import QRCode from "qrcode";

const destination = process.argv[2] ?? "./qr-test-vocacional-ies11.png";
const testUrl = process.env.APP_URL ?? "https://testvocacional.ies11.edu.ar";

await QRCode.toFile(destination, testUrl, {
  errorCorrectionLevel: "H",
  margin: 3,
  width: 1080,
  color: {
    dark: "#102D54",
    light: "#FFFFFF",
  },
});

console.log(`QR institucional generado en ${destination}`);
