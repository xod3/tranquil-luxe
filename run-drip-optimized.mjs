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

// Generate a plain text version from the HTML (critical for inbox placement)
function generatePlainText(email) {
  const unsubUrl = `https://www.tranquilluxemassage.fit/unsubscribe?email=${encodeURIComponent(email)}`;
  return `Tranquil Luxe Massage
Premium Private In-Home Massage Services

Experience Complete and Total Release

Escape the noise and demands of everyday life. At Tranquil Luxe, we bring the premium five-star massage experience directly to your personal sanctuary — your home or hotel suite.

Whether you seek profound tension relief or a deeply personal, guided journey to ultimate relaxation, our elite specialists curate an unforgettable evening tailored exactly to your preferences.

Book Your Session: https://www.tranquilluxemassage.fit/prices

---

EXCLUSIVE EASTER CELEBRATION
Enjoy 10% OFF Your First Luxury Experience
Offer automatically applied at checkout for first-time clients. Valid until April 15th.

---

FROM THE LUXE JOURNAL

5 Remarkable Benefits of Sensual Massage
Discover how sensual massage goes beyond relaxation.
Read more: https://www.tranquilluxemassage.fit/blog/benefits-of-sensual-massage

Why In-Home Luxury Massage Is the Future
The era of driving to a spa in traffic is fading.
Read more: https://www.tranquilluxemassage.fit/blog/why-in-home-luxury-massage-is-the-future

The Art of Couples Massage
A powerful tool for deepening connection and sharing the gift of touch.
Read more: https://www.tranquilluxemassage.fit/blog/the-art-of-couples-massage

---

Tranquil Luxe Massage
www.tranquilluxemassage.fit
bookings@tranquilluxemassage.fit

You are receiving this email because you subscribed to our newsletter or booked a session.
Unsubscribe: ${unsubUrl}
`;
}

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

    // INBOX OPTIMIZATION: Smaller chunks (50) with longer delays (2s)
    const chunks = chunkArray(batchEmails, 50);
    console.log(`Executing daily drip of ${batchEmails.length} emails (Index ${state.currentIndex} to ${state.currentIndex + DRIP_AMOUNT})...`);

    for (let i = 0; i < chunks.length; i++) {
      const batch = chunks[i];
      
      const payload = batch.map(email => {
        const unsubUrl = `https://www.tranquilluxemassage.fit/unsubscribe?email=${encodeURIComponent(email)}`;
        const personalizedHtml = emailHtmlTemplate.replace(
          "{{ unsubscribe_url }}", 
          unsubUrl
        );
        return {
          from: "Tranquil Luxe Massage <info@tranquilluxemassage.fit>",
          to: email,
          // INBOX: Clean subject — no emojis, no brackets, no ALL-CAPS
          subject: "Your Guide to In-Home Luxury Wellness This Easter",
          html: personalizedHtml,
          // INBOX: Plain text alternative (major deliverability signal)
          text: generatePlainText(email),
          // INBOX: Reply-to a monitored address
          reply_to: "bookings@tranquilluxemassage.fit",
          headers: {
            // INBOX: List-Unsubscribe header (Gmail/Yahoo require this)
            "List-Unsubscribe": `<${unsubUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
          }
        };
      });

      try {
        await resend.batch.send(payload);
        console.log(`Sent chunk ${i + 1}/${chunks.length} (${batch.length} emails)`);
      } catch (err) {
        console.error(`Error sending chunk ${i + 1}:`, err);
      }
      
      // INBOX: Longer delay between chunks (2s) to avoid rate-limit triggers
      if (i < chunks.length - 1) await delay(2000);
    }

    // Update persistent state tracking
    state.currentIndex += DRIP_AMOUNT;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    
    // Also send a daily update email to the admin
    await resend.emails.send({
      from: "Tranquil Luxe System <info@tranquilluxemassage.fit>",
      to: ADMIN_TEST_EMAIL,
      subject: `Drip Report — Batch ${state.currentIndex - DRIP_AMOUNT} to ${state.currentIndex}`,
      text: `Daily 500-email drip ran successfully.\nCurrent position: ${state.currentIndex} / ${uniqueEmails.length}\nUnsubscribed users skipped: ${unsubSet.size}`,
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
