import QRCode from "qrcode";

const destination = process.argv[2] ?? "/home/ubuntu/ies11-poster/project/qr-test-vocacional-ies11.png";
const testUrl = "https://vocatest11-j6zpasaq.manus.space";

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
