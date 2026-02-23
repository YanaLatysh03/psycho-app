import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { testResultApi, AnonymousTestResult } from '@/services/testResultApi';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';

export default function TestStatistics() {
    const router = useRouter();
    const { id } = router.query;
    const [results, setResults] = useState<AnonymousTestResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const loadStatistics = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const token = localStorage.getItem('jwt_token');
                const testResults = await testResultApi.getResultsByTestId(Number(id), token);
                setResults(testResults);
            } catch (err) {
                console.error('Error loading statistics:', err);
                setError('Не удалось загрузить статистику');
            } finally {
                setIsLoading(false);
            }
        };

        loadStatistics();
    }, [id]);

    if (isLoading) {
        return (
            <>
                <Head><title>Статистика теста</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Загрузка...</div>
                </div>
                <Bottombar />
            </>
        );
    }

    if (error || results.length === 0) {
        return (
            <>
                <Head><title>Статистика теста</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Статистика теста</div>
                    <div className={styles.card}>
                        <p style={{ color: '#666' }}>
                            {error || 'Пока нет результатов по этому тесту'}
                        </p>
                        <button
                            className={styles.btn}
                            onClick={() => router.push('/quizes')}
                            style={{ marginTop: '20px' }}
                        >
                            ← Вернуться к тестам
                        </button>
                    </div>
                </div>
                <Bottombar />
            </>
        );
    }

    // Вычисление статистики
    const totalResults = results.length;
    const scores = results.map(r => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / totalResults;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // Распределение баллов по диапазонам
    const scoreRanges = {
        low: scores.filter(s => s < avgScore * 0.5).length,
        medium: scores.filter(s => s >= avgScore * 0.5 && s < avgScore * 1.5).length,
        high: scores.filter(s => s >= avgScore * 1.5).length
    };

    // Группировка по месяцам (последние 6 месяцев)
    const monthlyData: { [key: string]: number } = {};
    results.forEach(result => {
        const date = new Date(result.testDatetime);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    const sortedMonths = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6);

    const maxMonthlyCount = Math.max(...sortedMonths.map(([, count]) => count));

    return (
        <>
            <Head><title>Статистика: {results[0]?.testName}</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    📊 Статистика теста
                </div>

                {/* Название теста */}
                <div className={styles.card}>
                    <div className={styles.title}>{results[0]?.testName}</div>
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Общая статистика прохождения теста
                    </p>
                </div>

                {/* Основные показатели */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    <div className={styles.card} style={{ textAlign: 'center' }}>
                        <Users size={32} color="#7C3AED" style={{ margin: '0 auto 10px' }} />
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7C3AED' }}>
                            {totalResults}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Всего прохождений</div>
                    </div>

                    <div className={styles.card} style={{ textAlign: 'center' }}>
                        <TrendingUp size={32} color="#22c55e" style={{ margin: '0 auto 10px' }} />
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>
                            {avgScore.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Средний балл</div>
                    </div>

                    <div className={styles.card} style={{ textAlign: 'center' }}>
                        <BarChart3 size={32} color="#3b82f6" style={{ margin: '0 auto 10px' }} />
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                            {minScore} - {maxScore}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Диапазон</div>
                    </div>
                </div>

                {/* График распределения баллов */}
                <div className={styles.card}>
                    <div className={styles.title}>Распределение результатов</div>
                    <div style={{ marginTop: '20px' }}>
                        {/* Низкие баллы */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                                fontSize: '14px'
                            }}>
                                <span>🔴 Низкие ({scoreRanges.low})</span>
                                <span>{((scoreRanges.low / totalResults) * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '20px',
                                backgroundColor: '#fee2e2',
                                borderRadius: '10px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${(scoreRanges.low / totalResults) * 100}%`,
                                    height: '100%',
                                    backgroundColor: '#ef4444',
                                    transition: 'width 0.5s ease'
                                }}></div>
                            </div>
                        </div>

                        {/* Средние баллы */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                                fontSize: '14px'
                            }}>
                                <span>🟡 Средние ({scoreRanges.medium})</span>
                                <span>{((scoreRanges.medium / totalResults) * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '20px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '10px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${(scoreRanges.medium / totalResults) * 100}%`,
                                    height: '100%',
                                    backgroundColor: '#f59e0b',
                                    transition: 'width 0.5s ease'
                                }}></div>
                            </div>
                        </div>

                        {/* Высокие баллы */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                                fontSize: '14px'
                            }}>
                                <span>🟢 Высокие ({scoreRanges.high})</span>
                                <span>{((scoreRanges.high / totalResults) * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '20px',
                                backgroundColor: '#dcfce7',
                                borderRadius: '10px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${(scoreRanges.high / totalResults) * 100}%`,
                                    height: '100%',
                                    backgroundColor: '#22c55e',
                                    transition: 'width 0.5s ease'
                                }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* График прохождений по месяцам */}
                <div className={styles.card}>
                    <div className={styles.title}>
                        <Calendar size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                        Прохождения по месяцам
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '12px',
                        height: '200px',
                        marginTop: '20px',
                        padding: '10px',
                        borderBottom: '2px solid #e5e7eb'
                    }}>
                        {sortedMonths.map(([month, count]) => (
                            <div
                                key={month}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#7C3AED',
                                    marginBottom: '4px'
                                }}>
                                    {count}
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: `${(count / maxMonthlyCount) * 150}px`,
                                        backgroundColor: '#7C3AED',
                                        borderRadius: '8px 8px 0 0',
                                        transition: 'height 0.5s ease',
                                        minHeight: '20px'
                                    }}
                                ></div>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#666',
                                    marginTop: '8px',
                                    textAlign: 'center'
                                }}>
                                    {new Date(month + '-01').toLocaleDateString('ru-RU', {
                                        month: 'short',
                                        year: '2-digit'
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Последние результаты */}
                <div className={styles.card}>
                    <div className={styles.title}>Последние результаты</div>
                    <div style={{ marginTop: '15px' }}>
                        {results.slice(0, 10).map((result) => (
                            <div
                                key={result.id}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9fafb',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Балл: {result.score}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                        {new Date(result.testDatetime).toLocaleString('ru-RU')}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    backgroundColor: '#f3e8ff',
                                    color: '#7C3AED',
                                    fontSize: '12px',
                                    maxWidth: '200px',
                                    textAlign: 'right'
                                }}>
                                    {result.interpretation?.substring(0, 50)}...
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Кнопка возврата */}
                <button
                    className={styles.btn}
                    onClick={() => router.push('/quizes')}
                    style={{
                        width: '320px',
                        display: 'block',
                        margin: '20px auto 30px',
                        background: '#f3f4f6',
                        color: '#374151'
                    }}
                >
                    ← Вернуться к тестам
                </button>
            </div>

            <Bottombar />
        </>
    );
}
