import { put } from "@vercel/blob";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const PHOTOS_DIR = "C:/Users/ACER/Desktop/tranquil-luxe/Therapist";

async function uploadAll() {
  const files = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith(".jpeg") || f.endsWith(".jpg") || f.endsWith(".png"));
  files.sort((a, b) => parseInt(a) - parseInt(b));
  
  const urls = {};
  
  for (const file of files) {
    const filePath = path.join(PHOTOS_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const blobName = `therapists/${file}`;
    
    try {
      const { url } = await put(blobName, buffer, { access: 'public', contentType: 'image/jpeg' });
      urls[file] = url;
      console.log(`✅ Uploaded ${file} → ${url}`);
    } catch (err) {
      console.error(`❌ Failed to upload ${file}:`, err.message);
    }
  }
  
  // Write URL mapping to a JSON file for use in newsletter template
  const outputPath = path.resolve(__dirname, "therapist-urls.json");
  fs.writeFileSync(outputPath, JSON.stringify(urls, null, 2));
  console.log(`\n📋 URL mapping saved to ${outputPath}`);
  console.log(`Total uploaded: ${Object.keys(urls).length}`);
}

uploadAll();
