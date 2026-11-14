
// The 5 hazards, with their NASA pages.
export const HAZARDS = {
  radiation: { name: "Space Radiation", url: "https://www.nasa.gov/hrp/hazard-space-radiation/" },
  isolation: { name: "Isolation and Confinement", url: "https://www.nasa.gov/hrp/hazard-isolation-and-confinement/" },
  distance: { name: "Distance from Earth", url: "https://www.nasa.gov/hrp/hazard-distance-from-earth/" },
  gravity: { name: "Gravity Fields", url: "https://www.nasa.gov/hrp/hazard-gravity-fields/" },
  environment: { name: "Hostile/Closed Environments", url: "https://www.nasa.gov/hrp/hazard-hostile-closed-environments/" },
};

// The 17 risks, with their NASA pages.
export const RISKS = {
  immune: { name: "Altered Immune System Responses", url: "https://www.nasa.gov/reference/risk-of-altered-immune-system-responses/" },
  sensorimotor: { name: "Altered Sensorimotor and Vestibular Function", url: "https://www.nasa.gov/reference/risk-of-altered-sensorimotor-and-vestibular-function/" },
  cardiovascular: { name: "Cardiovascular Adaptations", url: "https://www.nasa.gov/reference/risk-of-cardiovascular-adaptations/" },
  decompression: { name: "Decompression Sickness", url: "https://www.nasa.gov/reference/risk-of-decompression-sickness/" },
  microbes: { name: "Host-Microorganism Interactions", url: "https://www.nasa.gov/reference/risk-of-host-microorganism-interactions/" },
  hypoxia: { name: "Hypoxia", url: "https://www.nasa.gov/reference/risk-of-hypoxia/" },
  nutrition: { name: "Inadequate Food and Nutrition", url: "https://www.nasa.gov/reference/risk-of-inadequate-food-and-nutrition/" },
  eva: { name: "Injury and Compromised Performance from Spacewalks (EVA)", url: "https://www.nasa.gov/reference/risk-of-injury-and-compromised-performance-from-extravehicular-activity-eva/" },
  fitness: { name: "Reduced Cardiorespiratory and Musculoskeletal Fitness", url: "https://www.nasa.gov/reference/risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/" },
  sans: { name: "Spaceflight Associated Neuro-ocular Syndrome (SANS)", url: "https://www.nasa.gov/reference/risk-of-spaceflight-associated-neuro-ocular-syndrome-sans/" },
  bone: { name: "Spaceflight-Induced Bone Changes", url: "https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/" },
  behavioural: { name: "Behavioural Conditions and Psychiatric Disorders", url: "https://www.nasa.gov/reference/risk-of-behavioral-conditions-and-psychiatric-disorders/" },
  teamwork: { name: "Inadequate Teamwork", url: "https://www.nasa.gov/reference/risk-of-inadequate-teamwork/" },
  sleep: { name: "Inadequate Sleep and Irregular Schedules", url: "https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/" },
  systemsSupport: { name: "Inadequate Systems Operations Support", url: "https://www.nasa.gov/reference/risk-of-inadequate-systems-operations-support/" },
  dynamicLoads: { name: "Injury from Dynamic Loads", url: "https://www.nasa.gov/reference/risk-of-injury-from-dynamic-loads/" },
  radiationCancer: { name: "Radiation-Induced Cancers", url: "https://www.nasa.gov/reference/risk-of-radiation-induced-cancers/" },
};

// The 8 regions, in docs/BODY_MAP.md order.
// risks / hazards: { id, note, basis }   note = what the page says, in our words
// indicators: daily readings that colour the region
// symptoms: symptom tick-boxes that colour the region
// facts: verified numbers for the "Learn more" layer, each with its source
// keywords: extra search terms (docs/DECISIONS.md > Search)
export const REGIONS = [
  {
    id: "brain",
    name: "Brain and nerves",
    bodyParts: ["brain", "inner ear (balance)", "central nervous system"],
    risks: [
      { id: "sensorimotor", note: "Orientation and motion sickness", basis: "stated" },
      { id: "hypoxia", note: "Confusion, headaches, vision problems and trouble sleeping", basis: "stated" },
      { id: "radiationCancer", note: "Central nervous system effects; cognitive or performance impairment", basis: "stated" },
      { id: "sans", note: "Brain swelling", basis: "stated" },
    ],
    hazards: [
      { id: "gravity", note: "Dizziness, spatial orientation and coordination", basis: "stated" },
      { id: "radiation", note: "Damages the central nervous system; affects thinking and movement", basis: "stated" },
      { id: "environment", note: "Hypoxia from cabin pressure changes", basis: "inferred" },
    ],
    indicators: ["reactionMedian", "lapses"],
    symptoms: ["dizziness", "headache", "motionSickness", "confusion"],
    facts: [
      { text: "Most astronauts get motion sickness in spaceflight.", source: "sensorimotor" },
    ],
    keywords: ["brain", "head", "nerves", "balance", "inner ear", "dizzy", "dizziness", "vertigo", "headache", "confused", "confusion", "motion sickness", "space sickness", "reaction", "coordination"],
  },
  {
    id: "eyes",
    name: "Eyes",
    bodyParts: ["eyes", "optic nerve", "retina"],
    risks: [
      { id: "sans", note: "Optic nerve swelling, retinal folds, flattened back of the eye", basis: "stated" },
      { id: "hypoxia", note: "Vision problems", basis: "stated" },
      { id: "radiationCancer", note: "Degenerative disorders, including of the eyes", basis: "stated" },
    ],
    hazards: [
      { id: "gravity", note: "Fluid shifts toward the head can press on the eyes", basis: "stated" },
      { id: "radiation", note: "Through the radiation risk page", basis: "inferred" },
    ],
    indicators: [],
    symptoms: ["visionChange", "headache"],
    facts: [
      { text: "About 70% of ISS crew show some swelling at the back of the eye.", source: "sans" },
    ],
    keywords: ["eye", "eyes", "vision", "sight", "blurry", "blurred vision", "can't see", "optic", "retina", "SANS"],
  },
  {
    id: "mind",
    name: "Mind and sleep",
    bodyParts: ["mood", "stress", "sleep", "body clock", "alertness", "teamwork", "decision making"],
    risks: [
      { id: "behavioural", note: "Anxiety, depression, sleep, morale and decision making", basis: "stated" },
      { id: "sleep", note: "Sleep-wake cycle, body clock and work overload", basis: "stated" },
      { id: "teamwork", note: "Cooperation, communication and adapting to the group", basis: "stated" },
      { id: "systemsSupport", note: "Crew performance without real-time help from the ground", basis: "stated" },
    ],
    hazards: [
      { id: "isolation", note: "Named cause of behavioural risks; sleep loss and body-clock disruption", basis: "stated" },
      { id: "distance", note: "Communication delays and working without Earth's help", basis: "inferred" },
      { id: "radiation", note: "Behavioural changes and altered thinking", basis: "stated" },
    ],
    indicators: ["mood", "sleepHours", "reactionMedian", "lapses"],
    symptoms: [],
    facts: [],
    keywords: ["mind", "mood", "sad", "low", "stress", "stressed", "anxious", "anxiety", "depressed", "sleep", "can't sleep", "insomnia", "tired", "fatigue", "exhausted", "body clock", "teamwork", "lonely"],
  },
  {
    id: "heart",
    name: "Heart and blood vessels",
    bodyParts: ["heart", "blood vessels", "blood pressure", "blood flow"],
    risks: [
      { id: "cardiovascular", note: "Blood clots, irregular heartbeat, low blood pressure and fainting at landing", basis: "stated" },
      { id: "fitness", note: "Heart and lung fitness", basis: "stated" },
      { id: "radiationCancer", note: "Degenerative disorders of the heart and blood vessels", basis: "stated" },
      { id: "decompression", note: "Nitrogen bubbles in the blood; blood vessels in severe cases", basis: "stated" },
    ],
    hazards: [
      { id: "gravity", note: "Low gravity; lightheadedness or fainting on return to gravity", basis: "stated" },
      { id: "radiation", note: "Through the radiation risk page", basis: "inferred" },
    ],
    indicators: ["heartRate", "systolic", "diastolic", "exerciseMinutes"],
    symptoms: ["chestPain", "palpitations", "faint"],
    facts: [],
    keywords: ["heart", "chest", "pulse", "heartbeat", "heart rate", "palpitations", "blood pressure", "BP", "faint", "fainting", "lightheaded", "chest pain"],
  },
  {
    id: "breathing",
    name: "Breathing and oxygen",
    bodyParts: ["lungs", "breathing", "oxygen in the body"],
    risks: [
      { id: "hypoxia", note: "Oxygen in body tissues falls below normal", basis: "stated" },
      { id: "decompression", note: "Breathing affected in severe cases", basis: "stated" },
      { id: "eva", note: "Physical demands of spacewalks, linked to decompression sickness", basis: "stated" },
    ],
    hazards: [
      { id: "environment", note: "Cabin and spacesuit pressure", basis: "inferred" },
    ],
    indicators: ["spo2"],
    symptoms: ["shortOfBreath"],
    facts: [],
    keywords: ["lungs", "breathing", "breath", "short of breath", "breathless", "can't breathe", "oxygen", "low oxygen", "hypoxia", "SpO2", "oximeter"],
  },
  {
    id: "musculoskeletal",
    name: "Muscles and bones",
    bodyParts: ["spine", "hips", "weight-bearing bones", "muscles"],
    risks: [
      { id: "bone", note: "Bone density loss, a longer spine and higher fracture risk", basis: "stated" },
      { id: "fitness", note: "Loss of muscle fitness; falls when gravity changes", basis: "stated" },
      { id: "dynamicLoads", note: "Weakened bones and muscles; landing injuries", basis: "stated" },
      { id: "eva", note: "Bone and muscle strength for spacewalks", basis: "stated" },
    ],
    hazards: [
      { id: "gravity", note: "Bone and muscle loss, balance and movement", basis: "stated" },
    ],
    indicators: ["exerciseMinutes"],
    symptoms: ["backPain", "jointPain"],
    facts: [
      { text: "Bones lose 1–1.5% of their density per month in spaceflight.", source: "bone" },
      { text: "The spine can lengthen, adding up to 3% to height.", source: "bone" },
      { text: "Fitness falls by 10–12% on average, and 12–38% of crew lose more than 20%.", source: "fitness" },
      { text: "Countermeasure: exercise 6–7 days a week, about 1.5 hours a day.", source: "fitness" },
    ],
    keywords: ["muscles", "bones", "bone loss", "spine", "back", "back pain", "hips", "joints", "joint pain", "fracture", "exercise", "workout", "strength"],
  },
  {
    id: "gut",
    name: "Gut, kidneys and nutrition",
    bodyParts: ["stomach", "intestines", "gut microbiome", "kidneys", "diet"],
    risks: [
      { id: "nutrition", note: "General health of body and mind; longer missions without resupply", basis: "stated" },
      { id: "microbes", note: "Gut and skin microbiome", basis: "stated" },
    ],
    hazards: [
      { id: "distance", note: "Rationing food and supplies", basis: "stated" },
      { id: "environment", note: "Microbes change and spread more easily", basis: "stated" },
      { id: "gravity", note: "Kidney stones (named on the hazard page, not a separate risk)", basis: "stated" },
    ],
    // Blood sugar here is ATHENA's choice: the nutrition page names no measurable sign.
    indicators: ["bloodSugar"],
    indicatorNotes: { bloodSugar: "Our choice: NASA's nutrition page gives no measurable signs." },
    symptoms: ["nausea", "appetiteChange"],
    facts: [],
    keywords: ["stomach", "gut", "belly", "intestines", "kidneys", "kidney stones", "food", "diet", "nutrition", "appetite", "hungry", "nausea", "sick", "blood sugar", "glucose", "sugar"],
  },
  {
    id: "immune",
    name: "Immune system, skin and blood",
    bodyParts: ["immune system", "skin", "whole body"],
    risks: [
      { id: "immune", note: "Dormant viruses reactivating (cold sores, shingles), rashes, allergies and infections", basis: "stated" },
      { id: "microbes", note: "Skin microbiome; microbes become more harmful in spaceflight", basis: "stated" },
      { id: "radiationCancer", note: "Cancer", basis: "stated" },
    ],
    hazards: [
      { id: "radiation", note: "Increases cancer risk", basis: "stated" },
      { id: "environment", note: "Altered immune system, stress hormones and microbes", basis: "stated" },
      { id: "gravity", note: "The immune risk page names microgravity", basis: "inferred" },
    ],
    indicators: ["temperature", "radiationDose"],
    symptoms: ["fever", "rash", "coldSore", "infection"],
    facts: [],
    keywords: ["immune", "immunity", "skin", "rash", "itchy", "fever", "temperature", "hot", "chills", "cold sore", "shingles", "infection", "allergy", "radiation", "dose", "cancer"],
  },
];

export const getRegion = (id) => REGIONS.find((r) => r.id === id);

// Every region linked to an indicator or symptom (one reading can colour several regions).
export const regionsFor = (indicatorOrSymptom) =>
  REGIONS.filter(
    (r) => r.indicators.includes(indicatorOrSymptom) || r.symptoms.includes(indicatorOrSymptom)
  ).map((r) => r.id);