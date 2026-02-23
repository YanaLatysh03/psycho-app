const API_BASE_URL = 'http://localhost:8082/v1/api';

export interface TrendData {
    trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
    changePercentage: number;
}

export interface StatisticsResponse {
    totalEntries: number;
    averageEnergyLevel: number;
    averageSleepQuality: number;
    averageStressLevel: number;
    averageProductivityLevel: number;
    emotionFrequency: Record<string, number>;
    energyTrend: TrendData;
    stressTrend: TrendData;
}

export interface DailyAveragesResponse {
    date: string;
    avgEnergyLevel: number;
    avgStressLevel: number;
    avgSleepQuality: number;
    avgProductivityLevel: number;
    entryCount: number;
}

export const statisticsApi = {
    // Получить общую статистику
    async getStatistics(start: string, end: string, token?: string): Promise<StatisticsResponse> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_BASE_URL}/tracker/statistics/general?start=${start}&end=${end}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch statistics: ${response.status}`);
        }

        return response.json();
    },

    // Получить средние показатели по дням
    async getDailyAverages(start: string, end: string, token?: string): Promise<DailyAveragesResponse[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_BASE_URL}/tracker/statistics/daily?start=${start}&end=${end}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch daily averages: ${response.status}`);
        }

        return response.json();
    },
};
