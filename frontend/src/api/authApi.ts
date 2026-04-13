import { api } from './axios';

// Данные, которые отправляются при авторизации и регистрации.
export interface AuthPayload {
    email: string;
    password: string;
}

// Ответ сервера с токеном после успешной авторизации/регистрации.
export interface AuthResponse {
    accessToken: string;
    tokenType: string;
}

export const authApi = {
    // Выполняет вход пользователя и возвращает токен доступа.
    login: async (payload: AuthPayload) => {
        const { data } = await api.post<AuthResponse>('/auth/login', payload);
        return data;
    },
    // Регистрирует нового пользователя и возвращает токен доступа.
    register: async (payload: AuthPayload) => {
        const { data } = await api.post<AuthResponse>('/auth/register', payload);
        return data;
    }
};
