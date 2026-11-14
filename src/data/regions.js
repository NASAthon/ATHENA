// The 8 clickable body-map regions (docs/BODY_MAP.md, verified 14 Nov 2026).
// Card text follows docs/DECISIONS.md > Content Style: glance first, "Learn more" second.
// riskNotes / hazards / facts / indicatorNotes: per-region detail for the body map card (Mercy, PR #9).

export const REGIONS = [
  {
    id: "brain",
    name: "Brain and nerves",
    bodyParts: ["Brain", "Inner ear (balance)", "Nerves"],
    glance: "Balance, thinking and reaction speed.",
    learnMore:
      "Changing gravity confuses the balance system, so most astronauts get motion sickness at first. Low oxygen (hypoxia) can cause confusion and headaches, and space radiation can affect thinking and movement over time.",
    risks: ["sensorimotor", "hypoxia", "cancer", "sans"],
    // Region-specific detail (Mercy, PR #9). basis: "stated" = NASA page says it; "inferred" = ATHENA's interpretation.
    riskNotes: {
      sensorimotor: { note: "Orientation and motion sickness", basis: "stated" },
      hypoxia: { note: "Confusion, headaches, vision problems and trouble sleeping", basis: "stated" },
      cancer: { note: "Central nervous system effects; cognitive or performance impairment", basis: "stated" },
      sans: { note: "Brain swelling", basis: "stated" },
    },
    hazards: [
      { id: "gravity", note: "Dizziness, spatial orientation and coordination", basis: "stated" },
      { id: "radiation", note: "Damages the central nervous system; affects thinking and movement", basis: "stated" },
      { id: "hostile", note: "Hypoxia from cabin pressure changes", basis: "inferred" },
    ],
    facts: [
      { text: "Most astronauts get motion sickness in spaceflight.", sourceId: "nasa-risk-sensorimotor" },
    ],
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
    // Region-specific detail (Mercy, PR #9). basis: "stated" = NASA page says it; "inferred" = ATHENA's interpretation.
    riskNotes: {
      sans: { note: "Optic nerve swelling, retinal folds, flattened back of the eye", basis: "stated" },
      hypoxia: { note: "Vision problems", basis: "stated" },
      cancer: { note: "Degenerative disorders, including of the eyes", basis: "stated" },
    },
    hazards: [
      { id: "gravity", note: "Fluid shifts toward the head can press on the eyes", basis: "stated" },
      { id: "radiation", note: "Through the radiation risk page", basis: "inferred" },
    ],
    facts: [
      { text: "About 70% of ISS crew show some swelling at the back of the eye.", sourceId: "nasa-risk-sans" },
    ],
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
    // Region-specific detail (Mercy, PR #9). basis: "stated" = NASA page says it; "inferred" = ATHENA's interpretation.
    riskNotes: {
      behavioural: { note: "Anxiety, depression, sleep, morale and decision making", basis: "stated" },
      sleep: { note: "Sleep-wake cycle, body clock and work overload", basis: "stated" },
      teamwork: { note: "Cooperation, communication and adapting to the group", basis: "stated" },
      ops: { note: "Crew performance without real-time help from the ground", basis: "stated" },
    },
    hazards: [
      { id: "isolation", note: "Named cause of behavioural risks; sleep loss and body-clock disruption", basis: "stated" },
      { id: "distance", note: "Communication delays and working without Earth's help", basis: "inferred" },
      { id: "radiation", note: "Behavioural changes and altered thinking", basis: "stated" },
    ],
    facts: [],
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
    // Region-specific detail (Mercy, PR #9). basis: "stated" = NASA page says it; "inferred" = ATHENA's interpretation.
    riskNotes: {
      cardio: { note: "Blood clots, irregular heartbeat, low blood pressure and fainting at landing", basis: "stated" },
      fitness: { note: "Heart and lung fitness", basis: "stated" },
      cancer: { note: "Degenerative disorders of the heart and blood vessels", basis: "stated" },
      dcs: { note: "Nitrogen bubbles in the blood; blood vessels in severe cases", basis: "stated" },
    },
    hazards: [
      { id: "gravity", note: "Low gravity; lightheadedness or fainting on return to gravity", basis: "stated" },
      { id: "radiation", note: "Through the radiation risk page", basis: "inferred" },
    ],
    facts: [],
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
    // Region-specific detail (Mercy, PR #9). basis: "stated" = NASA page says it; "inferred" = ATHENA's interpretation.
    riskNotes: {
      hypoxia: { note: "Oxygen in body tissues falls below normal", basis: "stated" },
      dcs: { note: "Breathing affected in severe cases", basis: "stated" },
      eva: { note: "Physical demands of spacewalks, linked to decompression sickness", basis: "stated" },
    },
    hazards: [
      { id: "hostile", note: "Cabin and spacesuit pressure", basis: "inferred" },
    ],
    facts: [],
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
    // Region-specific detail (Mercy, PR #9). basis: "stated" = NASA page says it; "inferred" = ATHENA's interpretation.
    riskNotes: {
      bone: { note: "Bone density loss, a longer spine and higher fracture risk", basis: "stated" },
      fitness: { note: "Loss of muscle fitness; falls when gravity changes", basis: "stated" },
      dynamic: { note: "Weakened bones and muscles; landing injuries", basis: "stated" },
      eva: { note: "Bone and muscle strength for spacewalks", basis: "stated" },
    },
    hazards: [
      { id: "gravity", note: "Bone and muscle loss, balance and movement", basis: "stated" },
    ],
    facts: [
      { text: "Bones lose 1–1.5% of their density per month in spaceflight.", sourceId: "nasa-risk-bone" },
      { text: "The spine can lengthen, adding up to 3% to height.", sourceId: "nasa-risk-bone" },
      { text: "Fitness falls by 10–12% on average, and 12–38% of crew lose more than 20%.", sourceId: "nasa-risk-fitness" },
      { text: "Countermeasure: exercise 6–7 days a week, about 1.5 hours a day.", sourceId: "nasa-risk-fitness" },
    ],
    indicators: ["exercise"],
    symptoms: ["back-pain", "joint-pain", "injury", "bleeding", "suspected-fracture"],
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
    // Region-specific detail (Mercy, PR #9). basis: "stated" = NASA page says it; "inferred" = ATHENA's interpretation.
    riskNotes: {
      nutrition: { note: "General health of body and mind; longer missions without resupply", basis: "stated" },
      microbes: { note: "Gut and skin microbiome", basis: "stated" },
    },
    hazards: [
      { id: "distance", note: "Rationing food and supplies", basis: "stated" },
      { id: "hostile", note: "Microbes change and spread more easily", basis: "stated" },
      { id: "gravity", note: "Kidney stones (named on the hazard page, not a separate risk)", basis: "stated" },
    ],
    facts: [],
    indicatorNotes: {
      glucose: "Our choice: NASA's nutrition page gives no measurable signs.",
    },
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
    // Region-specific detail (Mercy, PR #9). basis: "stated" = NASA page says it; "inferred" = ATHENA's interpretation.
    riskNotes: {
      immune: { note: "Dormant viruses reactivating (cold sores, shingles), rashes, allergies and infections", basis: "stated" },
      microbes: { note: "Skin microbiome; microbes become more harmful in spaceflight", basis: "stated" },
      cancer: { note: "Cancer", basis: "stated" },
    },
    hazards: [
      { id: "radiation", note: "Increases cancer risk", basis: "stated" },
      { id: "hostile", note: "Altered immune system, stress hormones and microbes", basis: "stated" },
      { id: "gravity", note: "The immune risk page names microgravity", basis: "inferred" },
    ],
    facts: [],
    indicators: ["temperature", "radiation"],
    symptoms: ["fever", "rash", "cold-sore", "infection"],
    keywords: ["immune", "skin", "infection", "fever", "rash", "cold sore", "allergy", "sick", "temperature"],
  },
];
