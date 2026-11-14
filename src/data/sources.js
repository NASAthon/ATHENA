// Every source the app cites. Referenced by id from the other data files.
// Verified on 14 Nov 2026. See docs/SOURCES.md for licence notes.
// Licence: NASA and CDC = US Government works (public domain); ADA = facts only, our own wording.

export const SOURCES = {
  // NASA Human Research Program: hazards
  "nasa-hazards": { title: "5 Hazards of Human Spaceflight", publisher: "NASA HRP", url: "https://www.nasa.gov/hrp/hazards/" },
  "nasa-hazard-radiation": { title: "Hazard: Space Radiation", publisher: "NASA HRP", url: "https://www.nasa.gov/hrp/hazard-space-radiation/" },
  "nasa-hazard-isolation": { title: "Hazard: Isolation and Confinement", publisher: "NASA HRP", url: "https://www.nasa.gov/hrp/hazard-isolation-and-confinement/" },
  "nasa-hazard-distance": { title: "Hazard: Distance from Earth", publisher: "NASA HRP", url: "https://www.nasa.gov/hrp/hazard-distance-from-earth/" },
  "nasa-hazard-gravity": { title: "Hazard: Gravity Fields", publisher: "NASA HRP", url: "https://www.nasa.gov/hrp/hazard-gravity-fields/" },
  "nasa-hazard-hostile": { title: "Hazard: Hostile/Closed Environments", publisher: "NASA HRP", url: "https://www.nasa.gov/hrp/hazard-hostile-closed-environments/" },

  // NASA Human Research Program: risks
  "nasa-risks": { title: "Risks of Human Spaceflight", publisher: "NASA HRP", url: "https://www.nasa.gov/hrp/risks/" },
  "nasa-risk-immune": { title: "Risk of Altered Immune System Responses", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-altered-immune-system-responses/" },
  "nasa-risk-sensorimotor": { title: "Risk of Altered Sensorimotor and Vestibular Function", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-altered-sensorimotor-and-vestibular-function/" },
  "nasa-risk-cardio": { title: "Risk of Cardiovascular Adaptations", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-cardiovascular-adaptations/" },
  "nasa-risk-dcs": { title: "Risk of Decompression Sickness", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-decompression-sickness/" },
  "nasa-risk-microbes": { title: "Risk of Host-Microorganism Interactions", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-host-microorganism-interactions/" },
  "nasa-risk-hypoxia": { title: "Risk of Hypoxia", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-hypoxia/" },
  "nasa-risk-nutrition": { title: "Risk of Inadequate Food and Nutrition", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-inadequate-food-and-nutrition/" },
  "nasa-risk-eva": { title: "Risk of Injury and Compromised Performance from EVA", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-injury-and-compromised-performance-from-extravehicular-activity-eva/" },
  "nasa-risk-fitness": { title: "Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/" },
  "nasa-risk-sans": { title: "Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS)", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-spaceflight-associated-neuro-ocular-syndrome-sans/" },
  "nasa-risk-bone": { title: "Risk of Spaceflight-Induced Bone Changes", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/" },
  "nasa-risk-behavioural": { title: "Risk of Behavioral Conditions and Psychiatric Disorders", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-behavioral-conditions-and-psychiatric-disorders/" },
  "nasa-risk-teamwork": { title: "Risk of Inadequate Teamwork", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-inadequate-teamwork/" },
  "nasa-risk-sleep": { title: "Risk from Inadequate Sleep and Irregular Schedules", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/" },
  "nasa-risk-ops": { title: "Risk of Inadequate Systems Operations Support", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-inadequate-systems-operations-support/" },
  "nasa-risk-dynamic": { title: "Risk of Injury from Dynamic Loads", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-injury-from-dynamic-loads/" },
  "nasa-risk-cancer": { title: "Risk of Radiation-Induced Cancers", publisher: "NASA HRP", url: "https://www.nasa.gov/reference/risk-of-radiation-induced-cancers/" },

  // Clinical reference sources (docs/DECISIONS.md > Red-Limit Sources, Emergency Step Sources)
  "cdc-bp-about": { title: "About High Blood Pressure", publisher: "CDC (table based on ACC/AHA guidelines)", url: "https://www.cdc.gov/high-blood-pressure/about/index.html" },
  "cdc-bp-measure": { title: "Measure Your Blood Pressure", publisher: "CDC", url: "https://www.cdc.gov/high-blood-pressure/measure/index.html" },
  "cdc-heart-attack": { title: "Heart Attack Symptoms, Risk, and Recovery", publisher: "CDC", url: "https://www.cdc.gov/heart-disease/about/heart-attack.html" },
  "cdc-cardiac-arrest": { title: "Cardiac Arrest", publisher: "CDC", url: "https://www.cdc.gov/heart-disease/about/cardiac-arrest.html" },
  "cdc-cardiac-response": { title: "Cardiac Emergency Response Plans", publisher: "CDC", url: "https://www.cdc.gov/heart-disease/php/cardiac-arrest-response-plans/index.html" },
  "cdc-stroke": { title: "Signs and Symptoms of Stroke", publisher: "CDC", url: "https://www.cdc.gov/stroke/signs-symptoms/index.html" },
  "cdc-fever": { title: "Definitions of Signs, Symptoms, and Conditions of Ill Travelers", publisher: "CDC", url: "https://www.cdc.gov/quarantine/maritime/definitions-signs-symptoms-conditions-ill-travelers.html" },
  "cdc-hypothermia": { title: "Preventing Hypothermia", publisher: "CDC", url: "https://www.cdc.gov/winter-weather/prevention/index.html" },
  "cdc-sleep": { title: "About Sleep", publisher: "CDC", url: "https://www.cdc.gov/sleep/about/index.html" },
  "cdc-glucose-monitoring": { title: "Monitoring Your Blood Sugar", publisher: "CDC", url: "https://www.cdc.gov/diabetes/diabetes-testing/monitoring-blood-sugar.html" },
  "ada-diagnosis": { title: "Diagnosis", publisher: "American Diabetes Association", url: "https://diabetes.org/about-diabetes/diagnosis" },
  "ada-hypoglycemia": { title: "Hypoglycemia (Low Blood Glucose)", publisher: "American Diabetes Association", url: "https://diabetes.org/living-with-diabetes/treatment-care/hypoglycemia-low-blood-glucose" },
  "ada-hypoglycemia-treatment": { title: "Hypoglycemia Symptoms and Treatment", publisher: "American Diabetes Association", url: "https://diabetes.org/living-with-diabetes/hypoglycemia-low-blood-glucose/symptoms-treatment" },
  "ada-hyperglycemia": { title: "Hyperglycemia (High Blood Glucose)", publisher: "American Diabetes Association", url: "https://diabetes.org/living-with-diabetes/treatment-care/hyperglycemia" },
};
