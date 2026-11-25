import fs from "node:fs/promises";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "demo");
await fs.mkdir(dir, { recursive: true });

const proofs = [
  { key: "gym", emoji: "🏋️", label: "الجيم", sub: "يوم ٤ على التوالي", from: "#2B124C", to: "#854F6C" },
  { key: "book", emoji: "📚", label: "٢٠ صفحة", sub: "قبل النوم", from: "#190019", to: "#522B5B" },
  { key: "water", emoji: "💧", label: "٨ كوبايات", sub: "مياه على مدار اليوم", from: "#2B124C", to: "#3D6B75" },
  { key: "walk", emoji: "🚶", label: "مشي الصبح", sub: "٣٠ دقيقة", from: "#2B124C", to: "#854F6C" },
  { key: "study", emoji: "📝", label: "ساعة مذاكرة", sub: "من غير موبايل", from: "#190019", to: "#522B5B" },
  { key: "meditate", emoji: "🧘", label: "تأمل", sub: "١٠ دقايق هدوء", from: "#2B124C", to: "#6A4C7A" },
  { key: "sugar", emoji: "🍏", label: "مفيش سكريات", sub: "اليوم التالت", from: "#190019", to: "#854F6C" },
  { key: "fajr", emoji: "🕌", label: "الفجر", sub: "في وقتها", from: "#2B124C", to: "#522B5B" },
];

for (const p of proofs) {
  const svg = `<svg width="900" height="1200" viewBox="0 0 900 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.from}"/>
      <stop offset="100%" stop-color="${p.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="20%" r="70%">
      <stop offset="0%" stop-color="#FBE4D8" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#190019" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FBE4D8" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#FBE4D8" stop-opacity="0.04"/>
    </linearGradient>
  </defs>
  <rect width="900" height="1200" fill="url(#g)"/>
  <rect width="900" height="1200" fill="url(#glow)"/>
  <g opacity="0.14" stroke="#FBE4D8">
    ${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 70}" y1="0" x2="${i * 70 - 300}" y2="1200" stroke-width="1"/>`).join("\n")}
  </g>
  <circle cx="760" cy="220" r="180" fill="none" stroke="#FBE4D8" stroke-opacity="0.14" stroke-width="1.5"/>
  <circle cx="760" cy="220" r="240" fill="none" stroke="#FBE4D8" stroke-opacity="0.08" stroke-width="1"/>
  <circle cx="690" cy="1000" r="260" fill="#DFB6B2" fill-opacity="0.07"/>
  <rect x="250" y="300" width="400" height="400" rx="110" fill="url(#glass)" stroke="#FBE4D8" stroke-opacity="0.2"/>
  <text x="450" y="580" font-size="190" text-anchor="middle">${p.emoji}</text>
  <text x="450" y="790" font-family="Cairo, Tajawal, 'Noto Kufi Arabic', 'Segoe UI', sans-serif" font-size="54" font-weight="700" fill="#FBE4D8" text-anchor="middle">${p.label}</text>
  <text x="450" y="845" font-family="Cairo, Tajawal, 'Noto Kufi Arabic', 'Segoe UI', sans-serif" font-size="27" fill="#DFB6B2" text-anchor="middle">${p.sub}</text>
  <rect x="390" y="900" width="120" height="5" rx="2.5" fill="#DFB6B2" opacity="0.5"/>
  <text x="450" y="960" font-family="'Space Grotesk', sans-serif" font-size="20" letter-spacing="6" fill="#FBE4D8" opacity="0.4" text-anchor="middle">TAKHMIS</text>
</svg>`;
  await fs.writeFile(path.join(dir, `proof-${p.key}.svg`), svg);
}

const avatars = [
  { key: "y", letter: "ي", from: "#854F6C", to: "#2B124C" },
  { key: "o", letter: "ع", from: "#522B5B", to: "#190019" },
  { key: "z", letter: "ز", from: "#DFB6B2", to: "#854F6C", dark: true },
  { key: "k", letter: "ك", from: "#2B124C", to: "#854F6C" },
  { key: "m", letter: "م", from: "#6A4C7A", to: "#2B124C" },
  { key: "n", letter: "ن", from: "#854F6C", to: "#522B5B" },
  { key: "h", letter: "ه", from: "#522B5B", to: "#854F6C" },
  { key: "a", letter: "أ", from: "#DFB6B2", to: "#522B5B", dark: true },
];

for (const a of avatars) {
  const fg = a.dark ? "#190019" : "#FBE4D8";
  const svg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a.from}"/>
      <stop offset="100%" stop-color="${a.to}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="330" cy="70" r="120" fill="#FBE4D8" opacity="0.1"/>
  <circle cx="70" cy="350" r="110" fill="#190019" opacity="0.12"/>
  <text x="200" y="258" font-family="Cairo, Tajawal, 'Noto Kufi Arabic', sans-serif" font-size="190" font-weight="700" fill="${fg}" text-anchor="middle">${a.letter}</text>
</svg>`;
  await fs.writeFile(path.join(dir, `avatar-${a.key}.svg`), svg);
}

console.log(`✓ generated ${proofs.length} proof images and ${avatars.length} avatars`);
