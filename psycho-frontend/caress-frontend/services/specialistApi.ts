const API_BASE_URL = 'http://localhost:8081/v1/api';

import { ProfileResponse } from './profileApi';

export const specialistApi = {
    // Получить список моих пациентов
    async getMyPatients(token?: string): Promise<ProfileResponse[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/specialist/users`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch patients: ${response.status}`);
        }

        return response.json();
    },

    // Получить моего терапевта (для USER)
    async getSpecialistForPatient(token?: string): Promise<ProfileResponse> {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/specialist/for-patient`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            // Читаем тело ошибки — там будет detailMessage с ErrorCode
            let errorCode = `HTTP_${response.status}`;
            try {
                const errorBody = await response.json();
                if (errorBody.detailMessage) {
                    errorCode = errorBody.detailMessage;
                }
            } catch (_) {}
            throw new Error(errorCode);
        }

        return response.json();
    },

    // Завершить терапию с пациентом (для SPECIALIST)
    async endTherapyWithPatient(patientUserId: number, token?: string): Promise<void> {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/specialist/patients/${patientUserId}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            let errorCode = `HTTP_${response.status}`;
            try {
                const errorBody = await response.json();
                if (errorBody.detailMessage) errorCode = errorBody.detailMessage;
            } catch (_) {}
            throw new Error(errorCode);
        }
    },

    // Завершить терапию со специалистом (для USER)
    async endTherapyWithSpecialist(specialistId: number, rating: number, token?: string): Promise<void> {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/specialist/patient-connection/${specialistId}`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ rating }),   // ← передаём рейтинг
        });

        if (!response.ok) {
            let errorCode = `HTTP_${response.status}`;
            try {
                const errorBody = await response.json();
                if (errorBody.detailMessage) errorCode = errorBody.detailMessage;
            } catch (_) {}
            throw new Error(errorCode);
        }
    },

};
