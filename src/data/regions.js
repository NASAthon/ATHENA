// The 8 clickable body-map regions (docs/BODY_MAP.md, verified 14 Nov 2026).
// Card text follows docs/DECISIONS.md > Content Style: glance first, "Learn more" second.

export const REGIONS = [
  {
    id: "brain",
    name: "Brain and nerves",
    bodyParts: ["Brain", "Inner ear (balance)", "Nerves"],
    glance: "Balance, thinking and reaction speed.",
    learnMore:
      "Changing gravity confuses the balance system, so most astronauts get motion sickness at first. Low oxygen (hypoxia) can cause confusion and headaches, and space radiation can affect thinking and movement over time.",
    risks: ["sensorimotor", "hypoxia", "cancer", "sans"],
    indicators: ["reaction"],
    symptoms: ["dizziness", "headache", "confusion", "nausea"],
    keywords: ["brain", "head", "nerves", "balance", "thinking", "memory", "focus", "reaction", "dizzy", "headache"],
  },
  {
    id: "eyes",
    name: "Eyes",
    bodyParts: ["Eyes", "Optic nerve", "Retina"],
    glance: "Vision changes from fluid shifting toward the head.",
    learnMore:
      "Weightlessness pushes fluid toward the head, which can swell the optic nerve and flatten the back of the eye (SANS). About 70% of ISS crew show some swelling. Low oxygen and radiation can also affect the eyes.",
    risks: ["sans", "hypoxia", "cancer"],
    indicators: [],
    symptoms: ["vision-change", "headache"],
    keywords: ["eyes", "eye", "vision", "sight", "blurry", "blurred", "see", "optic"],
  },
  {
    id: "mind",
    name: "Mind and sleep",
    bodyParts: ["Mood", "Stress", "Sleep", "Alertness", "Teamwork"],
    glance: "Mood, sleep and staying sharp.",
    learnMore:
      "Months of isolation and confinement can lead to anxiety, low mood and poor sleep. Odd light-dark cycles and heavy workloads upset the body clock. Tiredness slows reactions and makes mistakes more likely.",
    risks: ["behavioural", "sleep", "teamwork", "ops"],
    indicators: ["mood", "sleep", "reaction"],
    symptoms: ["low-mood", "anxiety", "poor-sleep", "fatigue"],
    keywords: ["mind", "mood", "mental", "sleep", "stress", "anxiety", "tired", "sad", "lonely", "focus"],
  },
  {
    id: "heart",
    name: "Heart and blood vessels",
    bodyParts: ["Heart", "Blood vessels", "Blood pressure"],
    glance: "Heart rate, blood pressure and circulation.",
    learnMore:
      "In low gravity the heart and blood vessels adapt. This can cause irregular heartbeats, blood clots, and low blood pressure that leads to fainting when gravity returns. Exercise, fluids and compression garments help.",
    risks: ["cardio", "fitness", "cancer", "dcs"],
    indicators: ["heartRate", "bloodPressure", "exercise"],
    symptoms: ["chest-pain", "palpitations", "fainting", "shortness-of-breath"],
    keywords: ["heart", "chest", "pulse", "heartbeat", "blood pressure", "bp", "circulation", "palpitations", "faint"],
  },
  {
    id: "lungs",
    name: "Breathing and oxygen",
    bodyParts: ["Lungs", "Breathing", "Oxygen in the body"],
    glance: "Breathing and oxygen levels.",
    learnMore:
      "If cabin or suit pressure drops, oxygen in the body can fall (hypoxia), and pressure changes during spacewalks can cause decompression sickness. Both can affect breathing.",
    risks: ["hypoxia", "dcs", "eva"],
    indicators: ["spo2"],
    symptoms: ["shortness-of-breath", "confusion", "headache"],
    keywords: ["lungs", "breathing", "breath", "oxygen", "spo2", "can't breathe", "short of breath", "air"],
  },
  {
    id: "muscles",
    name: "Muscles and bones",
    bodyParts: ["Spine", "Hips", "Weight-bearing bones", "Muscles"],
    glance: "Bone strength and muscle fitness.",
    learnMore:
      "Without gravity, weight-bearing bones lose 1 to 1.5% of their density each month and fitness drops by about 10 to 12%. Daily resistance and aerobic exercise (about 1.5 hours a day, 6 to 7 days a week) is the main protection.",
    risks: ["bone", "fitness", "dynamic", "eva"],
    indicators: ["exercise"],
    symptoms: ["back-pain", "joint-pain", "injury"],
    keywords: ["muscles", "bones", "spine", "back", "hips", "joints", "fracture", "strength", "exercise"],
  },
  {
    id: "gut",
    name: "Gut, kidneys and nutrition",
    bodyParts: ["Stomach", "Intestines", "Gut microbiome", "Kidneys", "Diet"],
    glance: "Food, digestion and blood sugar.",
    learnMore:
      "Long missions without resupply make good nutrition harder. Germs act differently in space and can affect gut health, and the gravity change raises the risk of kidney stones. Blood sugar is tracked here as our choice: NASA's nutrition page gives no measurable signs.",
    risks: ["nutrition", "microbes"],
    indicators: ["glucose"],
    symptoms: ["nausea", "appetite-change"],
    keywords: ["gut", "stomach", "food", "diet", "nutrition", "digestion", "kidney", "sugar", "glucose", "nausea", "appetite"],
  },
  {
    id: "immune",
    name: "Immune system, skin and blood",
    bodyParts: ["Immune system", "Skin", "Whole body"],
    glance: "Fighting infection; fever and skin changes.",
    learnMore:
      "Radiation, microgravity and poor sleep can weaken the immune system, so dormant viruses can wake up (cold sores, shingles), and rashes, allergies or infections can appear. Space radiation also raises lifetime cancer risk.",
    risks: ["immune", "microbes", "cancer"],
    indicators: ["temperature", "radiation"],
    symptoms: ["fever", "rash", "cold-sore", "infection"],
    keywords: ["immune", "skin", "infection", "fever", "rash", "cold sore", "allergy", "sick", "temperature"],
  },
];
