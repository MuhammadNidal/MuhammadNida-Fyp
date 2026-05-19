export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  role: "player" | "coach" | "pro";
  sports: string[];
  location: string;
  bio: string;
  verificationStatus: "none" | "pending" | "verified";
  followingIds: string[];
  rating: number;
  gamesPlayed: number;
  onboardingComplete: boolean;
}

export interface GameMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  isHidden: boolean;
}

export interface Game {
  id: string;
  createdBy: string;
  organizerId: string;
  sport: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  city: string;
  ageGroup: "young_adult" | "adult" | "senior" | "all";
  participationGroup: "male" | "female" | "all";
  skillLevel: "beginner" | "intermediate" | "advanced" | "all";
  maxPlayers: number;
  participants: string[];
  type: "game" | "lesson" | "pro_game";
  isPaid: boolean;
  price?: number;
  status: "active" | "canceled";
  messages: GameMessage[];
}

export interface DirectMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  title?: string;
  participantIds: string[];
  messages: DirectMessage[];
  lastMessageAt: string;
}
