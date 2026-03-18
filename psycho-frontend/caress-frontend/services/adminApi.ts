const API_BASE_URL = 'http://localhost:8081/v1/api';

export interface AdminUser {
    id: number;
    email: string;
    role: string;
    createdAt: string;
}

export const adminApi = {
    async searchUsers(page: number = 0, size: number = 10, token?: string): Promise<AdminUser[]> {
        const response = await fetch(
            `${API_BASE_URL}/admin/users/search?page=${page}&size=${size}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            }
        );
        if (response.status === 403) throw new Error('Нет доступа');
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        return response.json();
    },

    async updateUserPassword(userId: number, newPassword: string, token?: string): Promise<void> {
        const response = await fetch(
            `${API_BASE_URL}/admin/users/${userId}/password`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ password: newPassword })
            }
        );
        if (response.status === 403) throw new Error('Нет доступа');
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
    }

};

