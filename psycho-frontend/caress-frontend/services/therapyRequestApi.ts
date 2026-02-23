const API_BASE_URL = 'http://localhost:8081/v1/api';

export enum RequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export interface TherapyRequest {
    id: number;
    userId: number;
    specialistId: number;
    status: RequestStatus;
    message: string;
    createdAt: string;
    updatedAt: string;
}

export const therapyRequestApi = {
    // Получить входящие запросы (для специалиста)
    async getIncomingRequests(token?: string): Promise<TherapyRequest[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/therapy-requests/incoming`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch incoming requests: ${response.status}`);
        }

        return response.json();
    },

    // Одобрить запрос
    async acceptRequest(requestId: number, token?: string): Promise<TherapyRequest> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/therapy-requests/${requestId}/accept`, {
            method: 'PUT',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to accept request: ${response.status}`);
        }

        return response.json();
    },

    // Отклонить запрос
    async rejectRequest(requestId: number, token?: string): Promise<TherapyRequest> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/therapy-requests/${requestId}/reject`, {
            method: 'PUT',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to reject request: ${response.status}`);
        }

        return response.json();
    },

    // Отправить запрос специалисту (для USER)
    async sendRequest(specialistId: number, message: string, token?: string): Promise<TherapyRequest> {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/therapy-requests/sent/${specialistId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            // Читаем тело ошибки от сервера
            let errorCode = `HTTP_${response.status}`;
            try {
                const errorBody = await response.json();
                // detailMessage содержит ErrorCode.name(), например "E_HAVE_ACTIVE_REQUEST"
                if (errorBody.detailMessage) {
                    errorCode = errorBody.detailMessage;
                }
            } catch (_) {
                // тело не JSON — используем дефолтный код
            }
            throw new Error(errorCode);
        }

        return response.json();
    },

    // Отменить запрос (для USER)
    async cancelRequest(requestId: number, token?: string): Promise<void> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/therapy-requests/${requestId}/cancel`, {
            method: 'PUT',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to cancel request: ${response.status}`);
        }
    },

    // Получить свои запросы (для USER)
    async getMyRequests(token?: string): Promise<TherapyRequest[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/therapy-requests/my`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch my requests: ${response.status}`);
        }

        return response.json();
    },
};
