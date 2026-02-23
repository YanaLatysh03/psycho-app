const API_BASE_URL = 'http://localhost:8080/v1/api';

export interface TestResult {
    id: number;
    testDatetime: string;
    score: number;
    testId: number;
    testName: string;
    userId: number;
    interpretation: string;
}

export interface TestAnswer {
    testQuestionId: number;
    questionText: string;
    answer: string;
    score: number;
}

export interface TestResultDetails extends TestResult{
    maxScore: number,
    testAnswers: TestAnswer[];
}

export interface TestResult {
    id: number;
    testDatetime: string;
    score: number;
    testId: number;
    testName: string;
    userId: number;
    interpretation: string;
}

export interface AnonymousTestResult {
    id: number;
    testDatetime: string;
    score: number;
    testId: number;
    testName: string;
    interpretation: string;
}

export const testResultApi = {
    // Получить мои результаты тестов
    async getMyTestResults(token?: string): Promise<TestResult[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tests/results/me`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch my test results: ${response.status}`);
        }

        return response.json();
    },

    // Получить детальный результат теста
    async getResultDetailsById(resultId: number, token?: string): Promise<TestResultDetails> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tests/results/details/${resultId}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch result details: ${response.status}`);
        }

        return response.json();
    },

    async getResultsByTestId(testId: number, token?: string): Promise<AnonymousTestResult[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tests/results/by-test/${testId}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch test results: ${response.status}`);
        }

        return response.json();
    },
    // Для специалиста: получить результаты тестов пациента
    async getResultsByUserId(userId: number, token?: string): Promise<TestResult[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tests/results/users/${userId}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user results: ${response.status}`);
        }

        return response.json();
    },
}

