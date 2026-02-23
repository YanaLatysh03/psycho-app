// psycho-frontend/caress-frontend/pages/test-result/[id].tsx
import Bottombar from '@/components/bottombar';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styles from '@/styles/results.module.css';
import Head from 'next/head';
import { testResultApi, TestResultDetails } from '@/services/testResultApi';
import TopBar from "@/components/topbar";

export default function TestResult() {
    const router = useRouter();
    const { id } = router.query;

    const [result, setResult] = useState<TestResultDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function fetchResultDetails() {
            try {
                setIsLoading(true);
                setError(null);

                const resultId = parseInt(id as string);

                // Получаем JWT токен
                const token = localStorage.getItem('jwt_token');

                const resultData = await testResultApi.getResultDetailsById(resultId, token);
                setResult(resultData);
            } catch (err) {
                console.error('Error loading result:', err);
                setError('Не удалось загрузить результаты теста');
            } finally {
                setIsLoading(false);
            }
        }

        fetchResultDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.title}>Загрузка результатов...</div>
                </div>
                <Bottombar />
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className={styles.content}>
                <Head>
                    <title>Ошибка</title>
                </Head>
                <TopBar />
                <div className={styles.container}>
                    <div className={styles.title}>Ошибка</div>
                    <div style={{ color: 'red', marginBottom: '20px' }}>
                        {error || 'Результат не найден'}
                    </div>
                    <button
                        className={styles.btn}
                        onClick={() => router.push('/quizes')}
                    >
                        Вернуться к списку тестов
                    </button>
                </div>
                <Bottombar />
            </div>
        );
    }

    // Форматирование даты
    const formattedDate = new Date(result.testDatetime).toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <>
            <Head>
                <title>Результат теста - {result.testName}</title>
            </Head>
            <TopBar />
        <div className={styles.content}>
            <div className={styles.row}>
                {/* Основной контейнер с результатом */}
                <div className={styles.container}>
                    <div className={styles.title}>{result.testName}</div>

                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                        Пройден: {formattedDate}
                    </div>

                    {/* Итоговый балл */}
                    <div className={styles.resultContainer}>
                        <div className={styles.score}>
                            <span className={styles.label}>Ваш результат:</span>
                            <span className={styles.value}>
                                {result.score} / {result.maxScore}
                            </span>
                        </div>
                    </div>

                    {/* Интерпретация */}
                    <div className={styles.resultContainer} style={{ marginTop: '20px' }}>
                        <div className={styles.result}>
                            <span className={styles.label}>Интерпретация:</span>
                            <span className={styles.value} style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: getInterpretationColor(result.interpretation)
                            }}>
                                {result.interpretation}
                            </span>
                        </div>
                    </div>

                    {/* Процентное соотношение */}
                    <div style={{
                        width: '100%',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '10px',
                        height: '20px',
                        marginTop: '20px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${(result.score / result.maxScore) * 100}%`,
                            backgroundColor: getProgressBarColor(result.interpretation),
                            height: '100%',
                            borderRadius: '10px',
                            transition: 'width 0.5s ease'
                        }}></div>
                    </div>
                    <div style={{
                        fontSize: '14px',
                        marginTop: '10px',
                        color: '#666'
                    }}>
                        {Math.round((result.score / result.maxScore) * 100)}%
                    </div>

                    {/* Детальные ответы */}
                    {result.testAnswers && result.testAnswers.length > 0 && (
                        <div style={{ width: '100%', marginTop: '30px' }}>
                            <div className={styles.label} style={{ marginBottom: '15px' }}>
                                Детальные ответы:
                            </div>
                            {result.testAnswers.map((answer, index) => (
                                <div
                                    key={answer.testQuestionId}
                                    style={{
                                        backgroundColor: 'white',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        marginBottom: '10px',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        marginBottom: '8px',
                                        color: '#333'
                                    }}>
                                        Вопрос {index + 1}: {answer.questionText}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        Ваш ответ: <span style={{ color: '#000' }}>{answer.answer}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                                        Баллов: {answer.score}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Кнопка возврата */}
                    <button
                        style={{
                            marginTop: '30px',
                            padding: '12px 24px',
                            backgroundColor: '#7C3AED',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                        onClick={() => router.back()}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D28D9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                    >
                        Назад
                    </button>
                </div>
            </div>

            <Bottombar />
        </div>
        </>
    );
}

// Вспомогательная функция для определения цвета интерпретации
function getInterpretationColor(interpretation: string): string {
    if (interpretation.includes('Очень низкий')) return '#22c55e'; // зеленый для очень низкого стресса/тревоги
    if (interpretation.includes('Низкий')) return '#84cc16'; // светло-зеленый
    if (interpretation.includes('Средний')) return '#f59e0b'; // оранжевый
    if (interpretation.includes('Высокий')) return '#ef4444'; // красный
    return '#6b7280'; // серый по умолчанию
}

// Вспомогательная функция для цвета прогресс-бара
function getProgressBarColor(interpretation: string): string {
    if (interpretation.includes('Очень низкий')) return '#22c55e';
    if (interpretation.includes('Низкий')) return '#84cc16';
    if (interpretation.includes('Средний')) return '#f59e0b';
    if (interpretation.includes('Высокий')) return '#ef4444';
    return '#7C3AED';
}
