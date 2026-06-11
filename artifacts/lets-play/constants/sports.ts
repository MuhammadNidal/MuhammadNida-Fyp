export interface Sport {
  id: string;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  iconName: string;
}

export const SPORTS: Sport[] = [
  { id: "cricket", name: "Cricket", description: "The gentleman's game. Batting, bowling and tactical mastery.", color: "#2563EB", bgColor: "#EFF6FF", iconName: "cricket" },
  { id: "soccer", name: "Soccer", description: "The beautiful game. Speed, precision and team spirit.", color: "#22C55E", bgColor: "#ECFDF5", iconName: "soccer" },
  { id: "football", name: "Football", description: "High impact strategy and athleticism on the gridiron.", color: "#DC2626", bgColor: "#FEF2F2", iconName: "american-football" },
  { id: "basketball", name: "Basketball", description: "Fast-paced hoops action. Dribble, shoot and score.", color: "#EA580C", bgColor: "#FFF7ED", iconName: "basketball" },
  { id: "tennis", name: "Tennis", description: "Elite racket sports. Singles or doubles on the court.", color: "#16A34A", bgColor: "#F0FDF4", iconName: "tennis" },
  { id: "golf", name: "Golf", description: "Precision and patience on the green. 18 holes of focus.", color: "#0EA5E9", bgColor: "#F0F9FF", iconName: "golf" },
  { id: "pickleball", name: "Pickleball", description: "The fastest growing social sport. Fun for all ages.", color: "#8B5CF6", bgColor: "#F5F3FF", iconName: "racquetball" },
  { id: "chess", name: "Chess", description: "Ultimate mental warfare. Checkmate your opponent.", color: "#374151", bgColor: "#F9FAFB", iconName: "chess-knight" },
  { id: "pokemon", name: "Pokémon", description: "Strategic card battles. Catch 'em all and be the champion.", color: "#EAB308", bgColor: "#FEFCE8", iconName: "cards-playing-outline" },
  { id: "poker", name: "Poker", description: "High stakes bluffing and probability. All in.", color: "#DC2626", bgColor: "#FEF2F2", iconName: "poker-chip" },
  { id: "badminton", name: "Badminton", description: "Light speed shuttlecocks and intense rallies.", color: "#06B6D4", bgColor: "#ECFEFF", iconName: "badminton" },
  { id: "padel", name: "Padel", description: "The social racket sport craze from Spain.", color: "#F43F5E", bgColor: "#FFF1F2", iconName: "racquetball" },
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
