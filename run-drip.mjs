import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const resend = new Resend(process.env.RESEND_API_KEY);
const prisma = new PrismaClient();
const emailHtmlTemplate = fs.readFileSync(path.resolve(__dirname, "newsletter-template.html"), "utf-8");

const csvPath = "C:/Users/ACER/Desktop/tranquil-luxe/email_batch-1-verify.csv";
const statePath = path.resolve(__dirname, "drip-state.json");
const DRIP_AMOUNT = 500;
const ADMIN_TEST_EMAIL = "meeweeinvests@gmail.com";

// Initialize state if not exists
if (!fs.existsSync(statePath)) {
  fs.writeFileSync(statePath, JSON.stringify({ currentIndex: 0 }));
}
const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));

const processEmails = (rawText) => {
  return rawText.split("\n")
    .map(line => line.replace(/"/g, "").trim().toLowerCase())
    .filter(line => line.includes("@"));
};

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function main() {
  try {
    const rawEmails = [...new Set(processEmails(fs.readFileSync(csvPath, "utf-8")))];
    
    // Fetch global unsubscribes from DB
    const unsubs = await prisma.unsubscribedContact.findMany({ select: { email: true } });
    const unsubSet = new Set(unsubs.map(u => u.email.toLowerCase()));

    // Filter out unsubscribed users globally
    const uniqueEmails = rawEmails.filter(e => !unsubSet.has(e));

    if (state.currentIndex >= uniqueEmails.length) {
      console.log("Drip campaign fully completed! All eligible emails have been sent.");
      process.exit(0);
    }

    // Slice the next batch
    const batchEmails = uniqueEmails.slice(state.currentIndex, state.currentIndex + DRIP_AMOUNT);

    // Force the admin email into EVERY single daily batch
    if (!batchEmails.includes(ADMIN_TEST_EMAIL)) {
      batchEmails.push(ADMIN_TEST_EMAIL);
    }

    const chunks = chunkArray(batchEmails, 100);
    console.log(`Executing daily drip of ${batchEmails.length} emails (Index ${state.currentIndex} to ${state.currentIndex + DRIP_AMOUNT})...`);

    for (let i = 0; i < chunks.length; i++) {
      const batch = chunks[i];
      
      const payload = batch.map(email => {
        const personalizedHtml = emailHtmlTemplate.replace(
          "{{ unsubscribe_url }}", 
          `https://www.tranquilluxemassage.fit/unsubscribe?email=${encodeURIComponent(email)}`
        );
        return {
          from: "Tranquil Luxe <info@tranquilluxemassage.fit>",
          to: email,
          subject: "Meet Our Elite Therapists ✨ 10% Off Your First Session",
          html: personalizedHtml
        };
      });

      try {
        await resend.batch.send(payload);
        console.log(`Sent chunk ${i + 1}/${chunks.length}`);
      } catch (err) {
        console.error(`Error sending chunk ${i + 1}:`, err);
      }
      
      // Safety delay
      if (i < chunks.length - 1) await delay(1000);
    }

    // Update persistent state tracking
    state.currentIndex += DRIP_AMOUNT;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    
    // Also send a daily update email to the admin
    await resend.emails.send({
      from: "Tranquil Luxe System <info@tranquilluxemassage.fit>",
      to: ADMIN_TEST_EMAIL,
      subject: `✅ Drip Campaign Daily Report (Index ${state.currentIndex - DRIP_AMOUNT} to ${state.currentIndex})`,
      html: `<p>The daily 500-email drip campaign ran successfully.</p><p>We are currently at position <strong>${state.currentIndex}</strong> out of <strong>${uniqueEmails.length}</strong>.</p><p>The system successfully dynamically skipped <strong>${unsubSet.size}</strong> unsubscribed users globally.</p>`
    });

    console.log("Daily drip executing flawlessly. New index saved.");
    process.exit(0);
  } catch (error) {
    console.error("CRITICAL DRIP FAILURE:", error);
    process.exit(1);
  }
}

main();
