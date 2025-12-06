export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  age: number;
  role: UserRole;
  points: number;
  currentStreak: number;
  joinedAt: string;
}

export type FlowLevel = 'Light' | 'Medium' | 'Heavy' | 'Spotting';
export type Mood = 'Happy' | 'Okay' | 'Sad' | 'Stressed' | 'Energetic';

export interface DailyLog {
  id: string;
  userId: string;
  date: string; // ISO string YYYY-MM-DD
  flowLevel?: FlowLevel;
  mood: Mood;
  symptoms: string[];
  notes?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'engagement' | 'starter';
  condition: (user: UserProfile, logs: DailyLog[], posts: Post[]) => boolean;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  unlockedAt: string;
}

export type PostStatus = 'pending' | 'approved' | 'rejected';

export interface Post {
  id: string;
  userId: string;
  username: string; // Denormalized for ease
  content: string;
  status: PostStatus;
  likes: number;
  likedBy: string[]; // Array of user IDs
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  content: string; // HTML supported
  thumbnail: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const SYMPTOMS_LIST = [
  'Cramps', 'Headache', 'Fatigue', 'Bloating', 
  'Back Pain', 'Nausea', 'Acne', 'Cravings', 'Mood Swings'
];

export const MOODS_LIST: { label: Mood; emoji: string }[] = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Energetic', emoji: '⚡' },
  { label: 'Okay', emoji: '😐' },
  { label: 'Sad', emoji: '😢' },
  { label: 'Stressed', emoji: '😰' },
];