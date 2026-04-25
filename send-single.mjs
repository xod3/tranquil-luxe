import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const resend = new Resend(process.env.RESEND_API_KEY);
const emailHtmlTemplate = fs.readFileSync(path.resolve(__dirname, "newsletter-template.html"), "utf-8");

const TARGET_EMAIL = "masibandafierce@gmail.com";

// Random therapist selection
const ALL_THERAPISTS = [
  "1.jpeg", "2.jpeg", "3.jpeg", "4.jpeg", "5.jpeg", "6.jpeg",
  "7.jpeg", "8.jpeg", "9.jpeg", "10.jpeg", "11.jpeg", "12.jpeg",
  "13.jpeg", "14.jpeg", "15.jpeg", "16.jpeg"
];

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildTherapistGrid(selected) {
  const BASE = "https://www.tranquilluxemassage.fit/therapists";
  return selected.map((img, i) => {
    const ml = (i % 3 === 0) ? '' : ' margin-left: 1%;';
    const mr = (i % 3 === 2) ? '' : ' margin-right: 1%;';
    return `<div class="therapist-card" style="${mr}${ml}">
        <img src="${BASE}/${img}" alt="Elite Therapist">
        <div class="therapist-info"><span class="stars">★★★★★</span><p>Highly Rated</p></div>
      </div>`;
  }).join("\n      ");
}

const todaysTherapists = pickRandom(ALL_THERAPISTS, 6);
console.log(`Featured therapists: ${todaysTherapists.join(", ")}`);

const templateWithTherapists = emailHtmlTemplate.replace("{{ therapist_grid }}", buildTherapistGrid(todaysTherapists));

const personalizedHtml = templateWithTherapists.replace(
  "{{ unsubscribe_url }}",
  `https://www.tranquilluxemassage.fit/unsubscribe?email=${encodeURIComponent(TARGET_EMAIL)}`
);

const { data, error } = await resend.emails.send({
  from: "Tranquil Luxe <info@tranquilluxemassage.fit>",
  to: TARGET_EMAIL,
  subject: "Meet Our Elite Therapists ✨ 10% Off Your First Session",
  html: personalizedHtml,
});

if (error) {
  console.error("Failed to send:", error);
  process.exit(1);
} else {
  console.log(`✅ Newsletter sent to ${TARGET_EMAIL} — ID: ${data.id}`);
  process.exit(0);
}
