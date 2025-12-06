import { UserProfile, DailyLog, Post, UserBadge, Badge, PostStatus, Course } from '../types';

// Initial Seed Data
const MOCK_BADGES: Badge[] = [
  { 
    id: 'first-log', 
    name: 'First Step', 
    description: 'Logged your first entry!', 
    icon: '🌱', 
    category: 'starter',
    condition: (u, logs) => logs.length >= 1 
  },
  { 
    id: 'week-warrior', 
    name: 'Week Warrior', 
    description: 'Logged for 7 days in a row', 
    icon: '🔥', 
    category: 'streak',
    condition: (u) => u.currentStreak >= 7 
  },
  { 
    id: 'community-voice', 
    name: 'Community Voice', 
    description: 'Created 3 approved posts', 
    icon: '🗣️', 
    category: 'engagement',
    condition: (u, logs, posts) => posts.filter(p => p.userId === u.id && p.status === 'approved').length >= 3 
  },
  { 
    id: 'super-star', 
    name: 'Super Star', 
    description: 'Reached 100 points', 
    icon: '⭐', 
    category: 'engagement',
    condition: (u) => u.points >= 100 
  },
];

const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Understanding Your Cycle',
    description: 'A beginner guide to what happens during your 28 days.',
    content: '<p>The menstrual cycle is a natural process...</p>',
    thumbnail: '🗓️',
    createdAt: new Date().toISOString()
  },
  {
    id: 'c2',
    title: 'Managing Cramps',
    description: 'Natural remedies and tips to feel better.',
    content: '<p>Heat pads and hydration are key...</p>',
    thumbnail: '🍵',
    createdAt: new Date().toISOString()
  }
];

// Add some fake users for the leaderboard
const MOCK_USERS: UserProfile[] = [
  { id: 'u1', email: 'alice@test.com', username: 'MoonChild', age: 14, role: 'user', points: 450, currentStreak: 12, joinedAt: new Date().toISOString() },
  { id: 'u2', email: 'bea@test.com', username: 'SunFlower', age: 15, role: 'user', points: 320, currentStreak: 5, joinedAt: new Date().toISOString() },
  { id: 'u3', email: 'charlie@test.com', username: 'StarDust', age: 13, role: 'user', points: 150, currentStreak: 2, joinedAt: new Date().toISOString() },
];

const STORAGE_KEYS = {
  USERS: 'fw_users',
  LOGS: 'fw_logs',
  POSTS: 'fw_posts',
  BADGES: 'fw_user_badges',
  SESSION: 'fw_session',
  COURSES: 'fw_courses'
};

// Helper to get data
const getStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

// Helper to set data
const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize some data if empty
if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
  setStorage(STORAGE_KEYS.USERS, MOCK_USERS);
}
if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
  setStorage(STORAGE_KEYS.COURSES, MOCK_COURSES);
}

// --- AUTH SERVICES ---

export const loginUser = async (email: string): Promise<UserProfile | null> => {
  await new Promise(r => setTimeout(r, 500)); // Simulate latency
  const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
  const user = users.find(u => u.email === email);
  if (user) {
    setStorage(STORAGE_KEYS.SESSION, user.id);
    return user;
  }
  return null;
};

export const registerUser = async (email: string, username: string, age: number): Promise<UserProfile> => {
  await new Promise(r => setTimeout(r, 500));
  const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
  
  if (users.find(u => u.email === email)) throw new Error('Email already exists');

  const newUser: UserProfile = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    username,
    age,
    role: email.includes('admin') ? 'admin' : 'user', // Simple admin backdoor for demo
    points: 0,
    currentStreak: 0,
    joinedAt: new Date().toISOString(),
  };

  users.push(newUser);
  setStorage(STORAGE_KEYS.USERS, users);
  setStorage(STORAGE_KEYS.SESSION, newUser.id);
  return newUser;
};

export const getCurrentUser = (): UserProfile | null => {
  const userId = getStorage<string | null>(STORAGE_KEYS.SESSION, null);
  if (!userId) return null;
  const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
  return users.find(u => u.id === userId) || null;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

// --- LOGGING SERVICES ---

export const getLogs = (userId: string): DailyLog[] => {
  const allLogs = getStorage<DailyLog[]>(STORAGE_KEYS.LOGS, []);
  return allLogs.filter(l => l.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addLog = async (userId: string, data: Omit<DailyLog, 'id' | 'userId' | 'createdAt'>): Promise<void> => {
  await new Promise(r => setTimeout(r, 300));
  const allLogs = getStorage<DailyLog[]>(STORAGE_KEYS.LOGS, []);
  
  // Check if already logged today
  const existingIndex = allLogs.findIndex(l => l.userId === userId && l.date === data.date);
  
  const newLog: DailyLog = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    createdAt: new Date().toISOString(),
    ...data,
  };

  if (existingIndex >= 0) {
    // Update existing
    allLogs[existingIndex] = { ...allLogs[existingIndex], ...data };
  } else {
    allLogs.push(newLog);
    
    // Gamification Logic: Points & Streak
    const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      const user = users[userIndex];
      const today = new Date(data.date);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const hasYesterdayLog = allLogs.some(l => l.userId === userId && l.date === yesterdayStr);
      
      let newStreak = user.currentStreak;
      if (hasYesterdayLog) {
        newStreak += 1;
      } else if (!allLogs.some(l => l.userId === userId && l.date === data.date && l.id !== newLog.id)) {
        newStreak = 1; 
      }

      user.points += 10; // Daily log points
      user.currentStreak = newStreak;
      users[userIndex] = user;
      setStorage(STORAGE_KEYS.USERS, users);
      
      checkBadges(userId);
    }
  }
  
  setStorage(STORAGE_KEYS.LOGS, allLogs);
};

// --- COMMUNITY SERVICES ---

export const getPosts = (): Post[] => {
  const allPosts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
  return allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createPost = async (userId: string, username: string, content: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 300));
  const allPosts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
  const newPost: Post = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    username,
    content,
    status: 'pending',
    likes: 0,
    likedBy: [],
    createdAt: new Date().toISOString(),
  };
  
  allPosts.push(newPost);
  setStorage(STORAGE_KEYS.POSTS, allPosts);
};

export const toggleLike = (postId: string, userId: string): void => {
  const allPosts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
  const postIndex = allPosts.findIndex(p => p.id === postId);
  if (postIndex >= 0) {
    const post = allPosts[postIndex];
    if (post.likedBy.includes(userId)) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes--;
    } else {
      post.likedBy.push(userId);
      post.likes++;
      // Award points to author
      const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
      const authorIndex = users.findIndex(u => u.id === post.userId);
      if (authorIndex >= 0) {
        users[authorIndex].points += 2;
        setStorage(STORAGE_KEYS.USERS, users);
      }
    }
    allPosts[postIndex] = post;
    setStorage(STORAGE_KEYS.POSTS, allPosts);
  }
};

// --- ADMIN SERVICES ---

export const moderatePost = (postId: string, status: PostStatus) => {
  const allPosts = getStorage<Post[]>(STORAGE_KEYS.POSTS, []);
  const postIndex = allPosts.findIndex(p => p.id === postId);
  if (postIndex >= 0) {
    allPosts[postIndex].status = status;
    
    // If approved, give points to creator
    if (status === 'approved') {
       const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
       const authorIndex = users.findIndex(u => u.id === allPosts[postIndex].userId);
       if (authorIndex >= 0) {
         users[authorIndex].points += 5;
         setStorage(STORAGE_KEYS.USERS, users);
         checkBadges(users[authorIndex].id);
       }
    }

    setStorage(STORAGE_KEYS.POSTS, allPosts);
  }
};

export const getAllUsers = (): UserProfile[] => {
  return getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
};

export const getCourses = (): Course[] => {
  return getStorage<Course[]>(STORAGE_KEYS.COURSES, []);
};

export const addCourse = (course: Omit<Course, 'id' | 'createdAt'>) => {
  const courses = getCourses();
  const newCourse: Course = {
    ...course,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  courses.push(newCourse);
  setStorage(STORAGE_KEYS.COURSES, courses);
};

export const deleteCourse = (id: string) => {
  const courses = getCourses().filter(c => c.id !== id);
  setStorage(STORAGE_KEYS.COURSES, courses);
};

// --- Gamification UTILS ---

export const getBadges = (): Badge[] => MOCK_BADGES;

export const getUserBadges = (userId: string): UserBadge[] => {
  const all = getStorage<UserBadge[]>(STORAGE_KEYS.BADGES, []);
  return all.filter(ub => ub.userId === userId);
};

export const getLeaderboard = (): UserProfile[] => {
  const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, []);
  return users.sort((a, b) => b.points - a.points).slice(0, 10);
};

const checkBadges = (userId: string) => {
  const user = getCurrentUser();
  if (!user) return;
  const logs = getLogs(userId);
  const posts = getPosts();
  const existingBadges = getUserBadges(userId);
  const allBadges = getBadges();

  const newBadges = getStorage<UserBadge[]>(STORAGE_KEYS.BADGES, []);

  allBadges.forEach(badge => {
    if (!existingBadges.find(eb => eb.badgeId === badge.id)) {
      if (badge.condition(user, logs, posts)) {
        newBadges.push({
          userId,
          badgeId: badge.id,
          unlockedAt: new Date().toISOString()
        });
      }
    }
  });
  
  setStorage(STORAGE_KEYS.BADGES, newBadges);
};