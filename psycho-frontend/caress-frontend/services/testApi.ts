const API_BASE_URL = 'http://localhost:8080/v1/api';

export interface Test {
    id: number;
    name: string;
    description: string;
    categoryId: number;
    categoryName: string;
    minScore: number;
    maxScore: number;
}

export interface TestDetails extends Test {
    testQuestions: TestQuestion[];
}

export interface TestQuestion {
    id: number;
    question: string;
    answerOptions: AnswerOption[];
}

export interface AnswerOption {
    id: number;
    answer: string;
    score: number;
}

export interface QuestionAnswer {
    questionId: number;
    answerOptionId: number;
}

export interface SubmitTestRequest {
    answers: QuestionAnswer[];
}

export interface TestCategory {
    id: number;
    name: string;
}

export const testApi = {
    // Получить все тесты
    async getAllTests(token?: string): Promise<Test[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tests/`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch tests: ${response.status}`);
        }

        return response.json();
    },

    // Получить тест по ID
    async getTestById(id: number, token?: string): Promise<TestDetails> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch test: ${response.status}`);
        }

        return response.json();
    },

    // Получить тесты по категории
    async getTestsByCategory(categoryId: number, token?: string): Promise<Test[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tests/category/${categoryId}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch tests by category: ${response.status}`);
        }

        return response.json();
    },

    // Отправить ответы на тест
    async submitTest(testId: number, answers: QuestionAnswer[], token?: string): Promise<TestResult> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const body: SubmitTestRequest = {
            answers: answers
        };

        const response = await fetch(`${API_BASE_URL}/tests/${testId}/submit`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Failed to submit test: ${response.status}`);
        }

        return response.json();
    },

    // Получить все категории
    async getAllCategories(token?: string): Promise<TestCategory[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tests/category/`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        return response.json();
    },

    // Получить рекомендованные тесты для пользователя
    async getSuggestedTests(token?: string): Promise<Test[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/tests/suggested`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch suggested tests: ${response.status}`);
        }

        return response.json();
    },
};
