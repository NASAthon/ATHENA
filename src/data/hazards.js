// The five hazards of human spaceflight (NASA Human Research Program).
// Summaries are our plain-English wording of what each hazard page says (verified 14 Nov 2026).

export const HAZARDS = [
  {
    id: "radiation",
    name: "Space Radiation",
    summary:
      "Outside Earth's protection, radiation raises cancer risk and can damage the brain and nerves, changing thinking, movement and behaviour.",
    effects: ["Higher cancer risk", "Brain and nerve damage", "Changes in thinking", "Slower movement", "Behaviour changes"],
    regions: ["brain", "eyes", "heart", "immune"],
    sourceIds: ["nasa-hazard-radiation"],
    keywords: ["radiation", "cosmic rays", "dose", "cancer", "solar particle event", "rads", "sievert"],
  },
  {
    id: "isolation",
    name: "Isolation and Confinement",
    summary:
      "Living for months in a small, closed group can affect mood, behaviour, sleep and the body clock, which can lower performance and health.",
    effects: ["Mood and behaviour changes", "Sleep loss", "Body clock disruption", "Work overload", "Lower performance"],
    regions: ["mind"],
    sourceIds: ["nasa-hazard-isolation"],
    keywords: ["isolation", "confinement", "lonely", "loneliness", "cabin fever", "stress", "crew conflict"],
  },
  {
    id: "distance",
    name: "Distance from Earth",
    summary:
      "Far from Earth, help and supplies are slow to arrive. Messages can take up to 20 minutes each way, so the crew must handle medical problems themselves.",
    effects: ["Communication delays of up to 20 minutes one way", "Limited supplies and medical care", "Food rationing", "Crew must act without real-time help"],
    regions: ["mind", "gut"],
    sourceIds: ["nasa-hazard-distance"],
    keywords: ["distance", "earth", "delay", "communication", "signal", "mission control", "ground", "resupply"],
    note: "The NASA page names no direct body effects. It explains why ATHENA must work on its own and offline.",
  },
  {
    id: "gravity",
    name: "Gravity Fields",
    summary:
      "Weightlessness and switching between gravity levels affect balance, bones, muscles, eyes and blood flow. Bones can lose 1 to 1.5% of their mineral density each month.",
    effects: [
      "Dizziness and motion sickness",
      "Bone loss of 1 to 1.5% per month",
      "Muscle loss",
      "Vision problems from fluid shifting to the head",
      "Balance and coordination problems",
      "Light-headedness or fainting back in gravity",
      "Kidney stones",
    ],
    regions: ["brain", "eyes", "heart", "muscles", "gut", "immune"],
    sourceIds: ["nasa-hazard-gravity"],
    keywords: ["gravity", "microgravity", "weightless", "zero g", "bone loss", "muscle loss", "fluid shift"],
  },
  {
    id: "hostile",
    name: "Hostile/Closed Environments",
    summary:
      "The spacecraft is a sealed space where germs spread more easily, stress hormones can rise and the immune system can change. Temperature, pressure, light, noise and crowding all matter.",
    effects: ["Germs change and spread", "Higher stress hormones", "Immune system changes (allergies, illness)", "Pressure, temperature, light and noise stress"],
    regions: ["brain", "lungs", "muscles", "gut", "immune"],
    sourceIds: ["nasa-hazard-hostile"],
    keywords: ["environment", "closed", "cabin", "pressure", "air", "germs", "microbes", "noise", "temperature", "habitat"],
  },
];
