import Axios from 'axios';

// Ключ для хранения access-токена в localStorage.
const TOKEN_KEY = 'finance_access_token';

// Возвращает текущий токен из localStorage.
export const getStoredToken = () => window.localStorage.getItem(TOKEN_KEY);

// Сохраняет токен или удаляет его, если передано null.
export const setStoredToken = (token: string | null) => {
    if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
        return;
    }

    window.localStorage.removeItem(TOKEN_KEY);
};

// Базовый HTTP-клиент для запросов к backend API.
export const api = Axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api'
});

// Перед каждым запросом подставляет Bearer-токен, если он есть.
api.interceptors.request.use((config) => {
    const token = getStoredToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// При 401/403 очищает токен, чтобы пользователь прошёл повторную авторизацию.
// Пропускает эндпоинты авторизации, чтобы не зациклить редирект.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url ?? '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

        if (!isAuthEndpoint && (error.response?.status === 401 || error.response?.status === 403)) {
            setStoredToken(null);
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);
