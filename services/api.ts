import { UserProfile, DailyLog, Post, Course, Badge, UserBadge } from '../types';

const API_URL = 'http://localhost:5000/api';

// Helper for requests
const request = async (endpoint: string, options?: RequestInit) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'API Error' }));
        throw new Error(error.message || `Error ${res.status}`);
    }
    return res.json();
};

// --- AUTH ---
export const loginUser = async (email: string): Promise<UserProfile | null> => {
    try {
        const user = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        localStorage.setItem('fw_session', user._id);
        return { ...user, id: user._id }; // Map _id to id
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const registerUser = async (email: string, username: string, age: number): Promise<UserProfile> => {
    const user = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, age }),
    });
    localStorage.setItem('fw_session', user._id);
    return { ...user, id: user._id };
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    const userId = localStorage.getItem('fw_session');
    if (!userId) return null;
    try {
        const user = await request(`/auth/me/${userId}`);
        return { ...user, id: user._id };
    } catch (e) {
        return null;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('fw_session');
};

// --- LOGS ---
export const getLogs = async (userId: string): Promise<DailyLog[]> => {
    return request(`/logs/${userId}`);
};

export const addLog = async (userId: string, data: any): Promise<void> => {
    await request('/logs', {
        method: 'POST',
        body: JSON.stringify({ userId, ...data }),
    });
};

// --- POSTS ---
export const getPosts = async (): Promise<Post[]> => {
    const posts = await request('/posts');
    return posts.map((p: any) => ({ ...p, id: p._id }));
};

export const createPost = async (userId: string, username: string, content: string): Promise<void> => {
    await request('/posts', {
        method: 'POST',
        body: JSON.stringify({ userId, username, content }),
    });
};

export const toggleLike = async (postId: string, userId: string): Promise<void> => {
    await request(`/posts/${postId}/like`, {
        method: 'PUT',
        body: JSON.stringify({ userId }),
    });
};

export const moderatePost = async (postId: string, status: string): Promise<void> => {
    await request(`/posts/${postId}/moderate`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

// --- COURSES ---
export const getCourses = async (): Promise<Course[]> => {
    const courses = await request('/courses');
    return courses.map((c: any) => ({ ...c, id: c._id }));
};

// --- AI ---
export const chatWithAi = async (message: string, history: any[]): Promise<string> => {
    const res = await request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
    });
    return res.text;
};

// --- BADGES & LEADERBOARD ---
export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
    return request(`/logs/badges/${userId}`);
};

export const getLeaderboard = async (): Promise<UserProfile[]> => {
    const users = await request('/logs/leaderboard/top');
    return users.map((u: any) => ({ ...u, id: u._id }));
};
