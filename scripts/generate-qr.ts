import QRCode from "qrcode";
import path from "path";
import fs from "fs";

async function generateDropoffQR() {
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const targetPath = path.join(publicDir, "campus-dropoff-qr.png");
  const targetUrl = "http://localhost:3000/report?type=found";

  await QRCode.toFile(targetPath, targetUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 512,
    color: {
      dark: "#0B1F4D", // Deep Navy brand color
      light: "#FFFFFF",
    },
  });

  console.log(`[QR Generator] Generated campus drop-off QR code at: ${targetPath}`);
}

generateDropoffQR().catch(console.error);
