export interface Sport {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  iconName: string;
}

export const SPORTS: Sport[] = [
  { id: "basketball", name: "Basketball", color: "#EA580C", bgColor: "#FFF7ED", iconName: "basketball-outline" },
  { id: "tennis", name: "Tennis", color: "#16A34A", bgColor: "#F0FDF4", iconName: "tennisball-outline" },
  { id: "golf", name: "Golf", color: "#0EA5E9", bgColor: "#F0F9FF", iconName: "golf-outline" },
  { id: "pickleball", name: "Pickleball", color: "#8B5CF6", bgColor: "#F5F3FF", iconName: "tennisball-outline" },
  { id: "chess", name: "Chess", color: "#374151", bgColor: "#F9FAFB", iconName: "game-controller-outline" },
  { id: "pokemon", name: "Pokémon", color: "#EAB308", bgColor: "#FEFCE8", iconName: "flash-outline" },
  { id: "poker", name: "Poker", color: "#DC2626", bgColor: "#FEF2F2", iconName: "card-outline" },
];

export function getSport(id: string): Sport | undefined {
  return SPORTS.find((s) => s.id === id);
}

export const SKILL_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "all", label: "All Levels" },
];

export const AGE_GROUPS = [
  { id: "young_adult", label: "Young Adult (18-30)" },
  { id: "adult", label: "Adult (31-50)" },
  { id: "senior", label: "Senior (51+)" },
  { id: "all", label: "All Ages" },
];

export const PARTICIPATION_GROUPS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "all", label: "All" },
];
