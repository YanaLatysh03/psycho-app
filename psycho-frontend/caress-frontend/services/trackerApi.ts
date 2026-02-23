const API_BASE_URL = 'http://localhost:8082/v1/api'; // Порт для tracker-app

export enum Emotion {
    JOY = 'JOY',
    HAPPINESS = 'HAPPINESS',
    EUPHORIA = 'EUPHORIA',
    EXCITEMENT = 'EXCITEMENT',
    PRIDE = 'PRIDE',
    PEACE = 'PEACE',
    LOVE = 'LOVE',
    SADNESS = 'SADNESS',
    MELANCHOLY = 'MELANCHOLY',
    LONELINESS = 'LONELINESS',
    DISAPPOINTMENT = 'DISAPPOINTMENT',
    DESPAIR = 'DESPAIR',
    ANGER = 'ANGER',
    IRRITATION = 'IRRITATION',
    RESENTMENT = 'RESENTMENT',
    FEAR = 'FEAR',
    ANXIETY = 'ANXIETY',
    SHAME = 'SHAME',
    GUILT = 'GUILT',
    DISGUST = 'DISGUST',
    JEALOUSY = 'JEALOUSY',
    ENVY = 'ENVY',
    TIRED = 'TIRED',
    OVERWHELMED = 'OVERWHELMED',
    STRESSED = 'STRESSED'
}

export interface TrackerEntryRequest {
    thoughts?: string;
    thoughtsLevel?: number;
    emotions?: Emotion[];
    energyLevel?: number;
    sleepQuality?: number;
    stressLevel?: number;
    stressTriggers?: string;
    productivityLevel?: number;
    entryDatetime?: string;
}

export interface TrackerEntryResponse {
    id: number;
    entryDatetime: string;
    thoughts?: string;
    thoughtsLevel?: number;
    emotions?: Emotion[];
    energyLevel?: number;
    sleepQuality?: number;
    stressLevel?: number;
    stressTriggers?: string;
    productivityLevel?: number;
    userId: number;
}

export enum GeneralState {
    HAPPY = 'HAPPY',
    SAD = 'SAD',
    ANGRY = 'ANGRY',
    SLEEPY = 'SLEEPY'
}

export interface GeneralStateRequest {
    generalState: GeneralState;
}

export interface GeneralStateResponse {
    id: number;
    generalState: GeneralState;
}

export interface TrackerEntrySummary {
    id: number;
    entryDatetime: string;
    emotionsSummary: Emotion[];
    userId: number;
}

export interface TrackerEntryDetail {
    id: number;
    entryDatetime: string;
    thoughts?: string;
    thoughtsLevel?: number;
    emotions?: Emotion[];
    energyLevel?: number;
    sleepQuality?: number;
    stressLevel?: number;
    stressTriggers?: string;
    productivityLevel?: number;
    userId: number;
}

export const trackerApi = {
    async createEntry(entry: TrackerEntryRequest, token?: string): Promise<TrackerEntryResponse> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/trackers`, {
            method: 'POST',
            headers,
            body: JSON.stringify(entry),
        });

        if (!response.ok) {
            throw new Error(`Failed to create tracker entry: ${response.status}`);
        }

        return response.json();
    },

    async createGeneralState(state: GeneralState, token?: string): Promise<GeneralStateResponse> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const body: GeneralStateRequest = {
            generalState: state
        };

        const response = await fetch(`${API_BASE_URL}/trackers/general-state`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Failed to create general state: ${response.status}`);
        }

        return response.json();
    },

    async getRecentGeneralStates(token?: string): Promise<GeneralStateResponse[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/trackers/general-states`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch general states: ${response.status}`);
        }

        return response.json();
    },

    // получить сегодняшнюю последнюю запись из трекера
    async getTodayLatestEntry(token?: string): Promise<TrackerEntrySummary | null> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/trackers/me/today/latest`, {
            method: 'GET',
            headers,
        });

        if (response.status === 204) {
            // No Content - записи нет
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch today's entry: ${response.status}`);
        }

        return response.json();
    },

    // Получить все мои записи
    async getMyEntries(page: number = 0, size: number = 50, token?: string): Promise<TrackerEntrySummary[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/trackers/me?page=${page}&size=${size}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch entries: ${response.status}`);
        }

        return response.json();
    },

    // Получить запись по ID
    async getEntryById(id: number, token?: string): Promise<TrackerEntryDetail> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/trackers/${id}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch entry: ${response.status}`);
        }

        return response.json();
    },

    // Удалить запись
    async deleteEntry(id: number, token?: string): Promise<void> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/trackers/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to delete entry: ${response.status}`);
        }
    },

    // Обновить запись
    async updateEntry(id: number, entry: TrackerEntryRequest, token?: string): Promise<TrackerEntryDetail> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/trackers/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(entry),
        });

        if (!response.ok) {
            throw new Error(`Failed to update entry: ${response.status}`);
        }

        return response.json();
    },

    // Для специалиста: получить записи трекера пациента
    async getUserEntries(
        userId: number,
        page: number = 0,
        size: number = 10,
        start?: string,
        end?: string,
        token?: string
    ): Promise<TrackerEntryDetail[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());
        if (start) params.append('start', start);
        if (end) params.append('end', end);

        const response = await fetch(
            `${API_BASE_URL}/trackers/users/${userId}?${params.toString()}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch user entries: ${response.status}`);
        }

        return response.json();
    },
};
