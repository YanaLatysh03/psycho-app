
const API_BASE_URL = 'http://localhost:8090/v1/api';

export enum Role {
    USER = 'USER',
    SPECIALIST = 'SPECIALIST',
    ADMIN = 'ADMIN'
}

export interface AuthRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    role?: Role;
}

export interface AuthResponse {
    token: string;
    email: string;
    role: string;
}

export interface User {
    email: string;
    role: string;
}

export const authApi = {
    // Логин (вход)
    async login(credentials: AuthRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Неверный email или пароль');
            }
            throw new Error(`Ошибка входа: ${response.status}`);
        }

        const data: AuthResponse = await response.json();
        console.log(data.role)

        // Сохраняем токен в localStorage
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_email', data.email);
        localStorage.setItem('user_role', data.role.replaceAll('ROLE_', ''));

        return data;
    },

    // Регистрация
    async register(userData: RegisterRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...userData,
                role: userData.role || Role.USER
            }),
        });

        if (!response.ok) {
            if (response.status === 409) {
                throw new Error('Пользователь с таким email уже существует');
            }
            throw new Error(`Ошибка регистрации: ${response.status}`);
        }

        const data: AuthResponse = await response.json();

        // Сохраняем токен в localStorage
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_email', data.email);
        localStorage.setItem('user_role', data.role.replaceAll('ROLE_', ''));

        return data;
    },

    // Выход
    logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
    },

    // Получить токен
    getToken(): string | null {
        return localStorage.getItem('jwt_token');
    },

    // Получить роль пользователя
    getUserRole(): string | null {
        return localStorage.getItem('user_role');
    },

    isAuthenticated(): boolean {
        if (typeof window === 'undefined') {
            return false; // SSR защита
        }
        return !!localStorage.getItem('jwt_token');
    },

    getCurrentUser(): User | null {
        if (typeof window === 'undefined') {
            return null; // SSR защита
        }

        const token = localStorage.getItem('jwt_token');
        const email = localStorage.getItem('user_email');
        const role = localStorage.getItem('user_role');

        if (!token || !email) {
            return null;
        }

        return { email, role: role || 'USER' };
    }
};
