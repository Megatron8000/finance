import { create } from 'zustand';
import { authApi, type AuthPayload } from '../api/authApi';
import { getStoredToken, setStoredToken } from '../api/axios';

// Состояние и действия для авторизации пользователя.
interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (payload: AuthPayload) => Promise<void>;
    register: (payload: AuthPayload) => Promise<void>;
    logout: () => void;
}

// Преобразует неизвестную ошибку в строку для отображения в UI.
const extractError = (error: unknown) =>
    error instanceof Error ? error.message : 'Не удалось выполнить запрос';

export const useAuthStore = create<AuthState>((set) => ({
    // Инициализация стора значениями из localStorage (если токен уже есть).
    token: getStoredToken(),
    isAuthenticated: Boolean(getStoredToken()),
    isLoading: false,
    error: null,
    // Вход пользователя: запрашивает токен и сохраняет его в стор и localStorage.
    login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.login(payload);
            setStoredToken(response.accessToken);
            set({ token: response.accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: extractError(error), isLoading: false });
            throw error;
        }
    },
    // Регистрация пользователя: создает аккаунт, получает и сохраняет токен.
    register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.register(payload);
            setStoredToken(response.accessToken);
            set({ token: response.accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: extractError(error), isLoading: false });
            throw error;
        }
    },
    // Выход пользователя: очищает токен и сбрасывает состояние авторизации.
    logout: () => {
        setStoredToken(null);
        set({ token: null, isAuthenticated: false, error: null });
    }
}));
