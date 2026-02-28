import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { statisticsApi, StatisticsResponse } from '@/services/statisticsApi';
import {checkAuth} from "@/utils/authUtils";

export default function GeneralStatistics() {
    const router = useRouter();
    const [stats, setStats] = useState<StatisticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'week' | 'month' | '3months'>('month');

    const getPeriodDates = (periodType: 'week' | 'month' | '3months') => {
        const end = new Date();
        const start = new Date();

        switch (periodType) {
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            case '3months':
                start.setMonth(start.getMonth() - 3);
                break;
        }

        return {
            start: start.toISOString(),
            end: end.toISOString()
        };
    };

    useEffect(() => {
        const init = async () => {
            const isAuthed = await checkAuth(router, 'USER');
            if (!isAuthed) return;  // ← данные не грузим если не авторизован

            await loadStats();
        };

        void init();
    }, [router, period]);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('jwt_token');
            const { start, end } = getPeriodDates(period);
            const statistics = await statisticsApi.getStatistics(start, end, token);
            setStats(statistics);
        } catch (err) {
            console.error('Error loading statistics:', err);
            setError('Не удалось загрузить статистику');
        } finally {
            setIsLoading(false);
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'IMPROVING':
                return '📈';
            case 'DECLINING':
                return '📉';
            default:
                return '➡️';
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'IMPROVING':
                return '#22c55e';
            case 'DECLINING':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getTrendText = (trend: string) => {
        switch (trend) {
            case 'IMPROVING':
                return 'Улучшается';
            case 'DECLINING':
                return 'Ухудшается';
            default:
                return 'Стабильно';
        }
    };

    if (isLoading) {
        return (
            <>
                <Head><title>Общая статистика</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Загрузка...</div>
                </div>
                <Bottombar />
            </>
        );
    }

    if (error || !stats) {
        return (
            <>
                <Head><title>Общая статистика</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Ошибка</div>
                    <div className={styles.card}>
                        <div style={{ color: '#ef4444', marginBottom: '20px' }}>
                            {error || 'Нет данных для отображения'}
                        </div>
                        <button className={styles.btn} onClick={() => router.push('/tracker/create')}>
                            Создать первую запись
                        </button>
                    </div>
                </div>
                <Bottombar />
            </>
        );
    }

    return (
        <>
            <Head><title>Общая статистика</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    📊 Общая статистика
                </div>

                {/* Фильтр периода */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                }}>
                    {['week', 'month', '3months'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '20px',
                                border: period === p ? '2px solid #7C3AED' : '1px solid #ccc',
                                backgroundColor: period === p ? '#7C3AED' : 'white',
                                color: period === p ? 'white' : '#333',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: period === p ? 'bold' : 'normal',
                                transition: 'all 0.3s'
                            }}
                        >
                            {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : '3 месяца'}
                        </button>
                    ))}
                </div>

                {/* Общая информация */}
                <div className={styles.card}>
                    <div className={styles.title}>📝 Записей за период</div>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#7C3AED',
                        textAlign: 'center',
                        margin: '10px 0'
                    }}>
                        {stats.totalEntries}
                    </div>
                </div>

                {/* Средние показатели */}
                <div className={styles.card}>
                    <div className={styles.title}>📊 Средние показатели</div>

                    {/* Энергия */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontSize: '14px'
                        }}>
                            <span>⚡ Энергия</span>
                            <span style={{ fontWeight: 'bold' }}>
                                {stats.averageEnergyLevel?.toFixed(1)}/10
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '12px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '6px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${(stats.averageEnergyLevel || 0) * 10}%`,
                                height: '100%',
                                backgroundColor: '#22c55e',
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                        {stats.energyTrend && (
                            <div style={{
                                fontSize: '12px',
                                color: getTrendColor(stats.energyTrend.trend),
                                marginTop: '5px'
                            }}>
                                {getTrendIcon(stats.energyTrend.trend)} {getTrendText(stats.energyTrend.trend)}
                                {' '}({stats.energyTrend.changePercentage?.toFixed(1)}%)
                            </div>
                        )}
                    </div>

                    {/* Стресс */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontSize: '14px'
                        }}>
                            <span>😰 Стресс</span>
                            <span style={{ fontWeight: 'bold' }}>
                                {stats.averageStressLevel?.toFixed(1)}/10
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '12px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '6px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${(stats.averageStressLevel || 0) * 10}%`,
                                height: '100%',
                                backgroundColor: '#ef4444',
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                        {stats.stressTrend && (
                            <div style={{
                                fontSize: '12px',
                                color: getTrendColor(stats.stressTrend.trend),
                                marginTop: '5px'
                            }}>
                                {getTrendIcon(stats.stressTrend.trend)} {getTrendText(stats.stressTrend.trend)}
                                {' '}({stats.stressTrend.changePercentage?.toFixed(1)}%)
                            </div>
                        )}
                    </div>

                    {/* Сон */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontSize: '14px'
                        }}>
                            <span>😴 Качество сна</span>
                            <span style={{ fontWeight: 'bold' }}>
                                {stats.averageSleepQuality?.toFixed(1)}/10
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '12px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '6px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${(stats.averageSleepQuality || 0) * 10}%`,
                                height: '100%',
                                backgroundColor: '#3b82f6',
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                    </div>

                    {/* Продуктивность */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontSize: '14px'
                        }}>
                            <span>🎯 Продуктивность</span>
                            <span style={{ fontWeight: 'bold' }}>
                                {stats.averageProductivityLevel?.toFixed(1)}/10
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '12px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '6px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${(stats.averageProductivityLevel || 0) * 10}%`,
                                height: '100%',
                                backgroundColor: '#a78bfa',
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                    </div>
                </div>

                {/* Частота эмоций */}
                {stats.emotionFrequency && Object.keys(stats.emotionFrequency).length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.title}>😊 Частота эмоций</div>
                        <div style={{ marginTop: '15px' }}>
                            {Object.entries(stats.emotionFrequency)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 8)
                                .map(([emotion, count]) => (
                                    <div key={emotion} style={{ marginBottom: '15px' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '6px',
                                            fontSize: '13px'
                                        }}>
                                            <span>{emotion}</span>
                                            <span style={{ fontWeight: 'bold' }}>{count}</span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: '#f3e8ff',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${(count / stats.totalEntries) * 100}%`,
                                                height: '100%',
                                                backgroundColor: '#7C3AED',
                                                transition: 'width 0.5s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                <button
                    className={styles.btn}
                    onClick={() => router.push('/tracker/history')}
                    style={{
                        width: '320px',
                        display: 'block',
                        margin: '20px auto 30px',
                        background: '#f3f4f6',
                        color: '#374151'
                    }}
                >
                    ← Вернуться к истории
                </button>
            </div>

            <Bottombar />
        </>
    );
}
