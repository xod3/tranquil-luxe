import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const resend = new Resend(process.env.RESEND_API_KEY);
const emailHtml = fs.readFileSync(path.resolve(__dirname, "newsletter-template.html"), "utf-8");

const file = fs.readFileSync("C:/Users/ACER/Desktop/tranquil-luxe/email_batch-1-verify.csv", "utf-8");

const processEmails = (rawText) => {
  return rawText.split("\n")
    .map(line => line.replace(/"/g, "").trim())
    .filter(line => line.includes("@"));
};

const uniqueEmails = [...new Set(processEmails(file))];

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function main() {
  const chunks = chunkArray(uniqueEmails, 100);
  console.log(`Verified unique emails: ${uniqueEmails.length}`);
  console.log(`Total chunks to send: ${chunks.length}`);

  const args = process.argv.slice(2);
  if (args[0] !== "--confirm") {
    console.log("SAFETY LOCK: Run with --confirm to execute the blast.");
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const batch = chunks[i];
    
    // 12:00 PM EDT (New York) = 16:00 UTC
    const blastTimeUTC = "2026-03-26T16:00:00.000Z";
    
    const payload = batch.map(email => ({
      from: "Tranquil Luxe <info@tranquilluxemassage.fit>",
      to: email,
      subject: "Your Exclusive Guide to In-Home Luxury Wellness ✨ [EASTER PROMO]",
      html: emailHtml,
      scheduled_at: blastTimeUTC
    }));

    try {
      console.log(`Sending batch ${i + 1}/${chunks.length} (${batch.length} emails)...`);
      const { data, error } = await resend.batch.send(payload);

      if (error) {
        console.error(`Error on batch ${i + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
      }
    } catch (err) {
      console.error(`Exception on batch ${i + 1}:`, err);
      errorCount += batch.length;
    }

    if (i < chunks.length - 1) {
      await delay(1000); // 1s delay to respect rate limit
    }
  }

  console.log("--- BATCH 1 SEND COMPLETE ---");
  console.log(`Successfully queued: ${successCount}`);
  console.log(`Failed: ${errorCount}`);

  console.log("Scheduling admin confirmation email...");
  await resend.emails.send({
    from: "Tranquil Luxe System <info@tranquilluxemassage.fit>",
    to: "bookings@tranquilluxemassage.fit",
    subject: "✅ Scheduled Deliveries Executing Now",
    html: "<p>Hello,</p><p>Your bulk email campaign targeting <strong>20,000 unique contacts</strong> has officially begun its automated dispatch via the Resend Cloud.</p>",
    scheduled_at: "2026-03-26T16:05:00.000Z"
  });
  console.log("Admin confirmation scheduled.");
}

main();
