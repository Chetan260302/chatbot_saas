import { create } from "zustand"
import type { UserProfile } from "../api/auth"

interface AuthState {
    user:         UserProfile | null
    accessToken:  string | null
    isLoggedIn:   boolean
    setAuth:      (token: string, refresh: string, user: UserProfile, rememberMe?: boolean) => void
    setUser:      (user: UserProfile) => void
    logout:       () => void
}

const getStoredItem = (key: string) => {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
};

const getStoredUser = (): UserProfile | null => {
    const u = getStoredItem('user_profile');
    if (!u) return null;
    try {
        return JSON.parse(u);
    } catch {
        return null;
    }
};

export const useAuthStore = create<AuthState>()((set) => {
    const accessToken = getStoredItem('access_token');
    const user = getStoredUser();

    return {
        user,
        accessToken,
        isLoggedIn: !!accessToken,

        setAuth: (token, refresh, user, rememberMe = true) => {
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('access_token', token);
            storage.setItem('refresh_token', refresh);
            storage.setItem('user_profile', JSON.stringify(user));
            localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');
            set({ user, accessToken: token, isLoggedIn: true });
        },
        setUser: (user) => {
            const isRememberMe = localStorage.getItem('remember_me') === 'true';
            const storage = isRememberMe ? localStorage : sessionStorage;
            storage.setItem('user_profile', JSON.stringify(user));
            set({ user });
        },
        logout: () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_profile');
            localStorage.removeItem('remember_me');
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
            sessionStorage.removeItem('user_profile');
            set({ user: null, accessToken: null, isLoggedIn: false });
        },
    };
});