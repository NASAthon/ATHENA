// Periodic exams named on NASA risk pages (for the mission calendar).
// The NASA pages don't state how often these happen in flight, so `interval` is an
// ATHENA design choice for the demo (basis: "design"). Change it freely.

export const EXAMS = [
  { id: "eye-scan", name: "Eye scan (retinal imaging)", why: "Checks for SANS: optic nerve swelling and eye changes.", risk: "sans", region: "eyes",
    sourceId: "nasa-risk-sans", interval: { everyDays: 30, basis: "design" }, keywords: ["eye scan", "retina", "fundoscope", "eye exam", "vision test"] },
  { id: "heart-ultrasound", name: "Heart ultrasound", why: "Checks heart structure and function as it adapts to low gravity.", risk: "cardio", region: "heart",
    sourceId: "nasa-risk-cardio", interval: { everyDays: 30, basis: "design" }, keywords: ["ultrasound", "echo", "heart scan", "heart check"] },
  { id: "fitness-check", name: "Fitness self-check", why: "Tracks loss of heart, lung, bone and muscle fitness.", risk: "fitness", region: "muscles",
    sourceId: "nasa-risk-fitness", interval: { everyDays: 14, basis: "design" }, keywords: ["fitness test", "fitness check", "strength test"] },
  { id: "bio-samples", name: "Blood, saliva and urine samples", why: "Monitors immune system changes.", risk: "immune", region: "immune",
    sourceId: "nasa-risk-immune", interval: { everyDays: 30, basis: "design" }, keywords: ["blood test", "saliva", "urine", "samples", "bloods"] },
  { id: "bone-scan", name: "Bone scan", why: "Measures bone density loss. NASA does these before and after flight.", risk: "bone", region: "muscles",
    sourceId: "nasa-risk-bone", interval: { when: "pre- and post-flight", basis: "stated" }, keywords: ["bone scan", "bone density", "dexa"] },
];
