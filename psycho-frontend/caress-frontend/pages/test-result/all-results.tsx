import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { testResultApi, TestResult } from '@/services/testResultApi';
import {checkAuth} from "@/utils/authUtils";

export default function AllResultsView() {
    const router = useRouter();
    const [results, setResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const isAuthed = await checkAuth(router, 'USER');
            if (!isAuthed) return;

            try {
                setIsLoading(true);
                setError(null);
                const token = localStorage.getItem('jwt_token');
                const testResults = await testResultApi.getMyTestResults(token);
                setResults(testResults);
            } catch (err) {
                console.error('Error loading test results:', err);
                setError('Не удалось загрузить результаты тестов');
            } finally {
                setIsLoading(false);
            }
        };

        void init();
    }, [router]);

    // Функция для определения цвета на основе интерпретации
    const getInterpretationColor = (interpretation: string): string => {
        if (interpretation.includes('Низкий') || interpretation.includes('низкий')) {
            return '#22c55e';
        }
        if (interpretation.includes('Средний') || interpretation.includes('средний')) {
            return '#f59e0b';
        }
        if (interpretation.includes('Высокий') || interpretation.includes('высокий')) {
            return '#ef4444';
        }
        return '#6b7280';
    };

    // Функция для форматирования даты
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <>
                <Head>
                    <title>Мои результаты тестов</title>
                </Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Загрузка...</div>
                </div>
                <Bottombar />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Head>
                    <title>Мои результаты тестов</title>
                </Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Ошибка</div>
                    <div className={styles.card}>
                        <div style={{ color: '#ef4444', marginBottom: '20px' }}>
                            {error}
                        </div>
                        <button
                            className={styles.btn}
                            onClick={() => window.location.reload()}
                        >
                            Попробовать снова
                        </button>
                    </div>
                </div>
                <Bottombar />
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Мои результаты тестов</title>
            </Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    📊 Мои результаты тестов
                </div>

                {results.length === 0 ? (
                    <div className={styles.card}>
                        <div className={styles.title}>Нет пройденных тестов</div>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            Вы еще не прошли ни одного теста
                        </p>
                        <button
                            className={styles.btn}
                            onClick={() => router.push('/quizes')}
                        >
                            Пройти тест
                        </button>
                    </div>
                ) : (
                    results.map((result) => (
                        <div
                            key={result.id}
                            className={styles.card}
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                            onClick={() => router.push(`/test-result/${result.id}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0px 0px 4px rgba(0, 0, 0, 0.4)';
                            }}
                        >
                            <div className={styles.title} style={{ marginBottom: '10px' }}>
                                {result.testName}
                            </div>

                            <div style={{
                                fontSize: '13px',
                                color: '#666',
                                marginBottom: '15px'
                            }}>
                                🕐 {formatDate(result.testDatetime)}
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <div style={{ fontSize: '14px', color: '#333' }}>
                                    <strong>Результат:</strong> {result.score} баллов
                                </div>
                                <div
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        color: getInterpretationColor(result.interpretation),
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        backgroundColor: `${getInterpretationColor(result.interpretation)}20`
                                    }}
                                >
                                    {result.interpretation}
                                </div>
                            </div>

                            <div style={{
                                fontSize: '12px',
                                color: '#7C3AED',
                                textAlign: 'right',
                                fontWeight: '500'
                            }}>
                                Нажмите для подробностей →
                            </div>
                        </div>
                    ))
                )}

                {results.length > 0 && (
                    <div style={{
                        textAlign: 'center',
                        marginTop: '20px',
                        marginBottom: '30px'
                    }}>
                        <button
                            className={styles.btn}
                            onClick={() => router.push('/quizes')}
                            style={{
                                background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                                color: 'white'
                            }}
                        >
                            Пройти еще один тест
                        </button>
                    </div>
                )}
            </div>

            <Bottombar />
        </>
    );
}
