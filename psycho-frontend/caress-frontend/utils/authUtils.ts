import { NextRouter } from 'next/router';

const AUTH_API_URL = 'http://localhost:8090/v1/api';

/**
 * Проверяет авторизацию: наличие токена + валидность на сервере.
 * При неудаче — редиректит на /auth/login.
 *
 * @param router     — next/router для редиректа
 * @param requiredRole — опционально: 'USER' | 'SPECIALIST' | 'ADMIN'
 * @returns true если авторизован (и роль совпадает), иначе false + редирект
 */
export const checkAuth = async (
    router: NextRouter,
    requiredRole?: string
): Promise<boolean> => {
    // 1. Проверка наличия токена в localStorage
    const token = localStorage.getItem('jwt_token');
    console.log('check-token: ', token)
    if (!token) {
        console.log('redirect to login')
        router.push('/auth/login');
        return false;
    }

    // 2. Валидация токена на сервере
    try {
        const response = await fetch(`${AUTH_API_URL}/auth/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });

        console.log('response: ', response)

        if (!response.ok) {
            console.log('response NOT OK: ', response)
            clearAuthAndRedirect(router);
            return false;
        }

        const data: { valid: boolean; message: string } = await response.json();

        if (!data.valid) {
            console.log('token NOT valid: ')
            clearAuthAndRedirect(router);
            return false;
        }
    } catch (err) {
        // Сервер недоступен — не редиректим, токен может быть валидным
        console.warn('Auth server unavailable, skipping server validation');
    }

    // 3. Проверка роли (если требуется)
    if (requiredRole) {
        const userRole = localStorage.getItem('user_role');
        console.log('requiredRole: ', requiredRole)
        console.log('userRole: ', userRole)
        if (userRole !== requiredRole) {
            // Роль не совпадает — на главную по роли, не на логин
            const homeRoute = userRole === 'SPECIALIST' ? '/specialist/home' : '/home';
            router.push(homeRoute);
            return false;
        }
    }

    return true;
};

// Очищает localStorage и редиректит на логин
const clearAuthAndRedirect = (router: NextRouter): void => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    router.push('/auth/login');
};
