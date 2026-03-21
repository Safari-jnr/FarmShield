export const MOCK_FARMERS = [
  { id: 1, name: "Emeka Okafor", dist: "0.8 km", status: "safe" },
  { id: 2, name: "Fatima Bello",  dist: "1.2 km", status: "warn" },
  { id: 3, name: "Chidi Eze",     dist: "2.1 km", status: "safe" },
  { id: 4, name: "Amaka Nwosu",   dist: "3.5 km", status: "danger" },
];

export const THREAT_TYPES = [
  { id: "flood",   label: "Flood" },
  { id: "fire",    label: "Fire" },
  { id: "pest",    label: "Pests" },
  { id: "drought", label: "Drought" },
  { id: "theft",   label: "Theft" },
  { id: "other",   label: "Other" },
];

export const RISK_DESC = {
  GREEN:  "All clear. Safe to farm today.",
  YELLOW: "Exercise caution. Monitor alerts.",
  RED:    "Danger reported nearby. Stay alert.",
};