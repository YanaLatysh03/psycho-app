import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { statisticsApi, DailyAveragesResponse } from '@/services/statisticsApi';
import {checkAuth} from "@/utils/authUtils";

export default function DailyStatistics() {
    const router = useRouter();
    const [dailyStats, setDailyStats] = useState<DailyAveragesResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<'week' | 'month'>('week');

    const getPeriodDates = (periodType: 'week' | 'month') => {
        const end = new Date(+new Date() + 3*60*60*1000);
        const start = new Date();

        switch (periodType) {
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
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

            await loadDailyStats();
        };

        void init();
    }, [router, period]);

    const loadDailyStats = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('jwt_token');
            const { start, end } = getPeriodDates(period);
            const statistics = await statisticsApi.getDailyAverages(start, end, token);
            setDailyStats(statistics);
        } catch (err) {
            console.error('Error loading daily statistics:', err);
            setError('Не удалось загрузить статистику');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short'
        });
    };

    // Находим максимальное значение для нормализации графика
    const maxValue = Math.max(
        ...dailyStats.map(d => Math.max(
            d.avgEnergyLevel || 0,
            d.avgStressLevel || 0,
            d.avgSleepQuality || 0,
            d.avgProductivityLevel || 0
        ))
    );

    if (isLoading) {
        return (
            <>
                <Head><title>Средние по дням</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Загрузка...</div>
                </div>
                <Bottombar />
            </>
        );
    }

    if (error || dailyStats.length === 0) {
        return (
            <>
                <Head><title>Средние по дням</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Средние показатели по дням</div>
                    <div className={styles.card}>
                        <div style={{ color: '#666', marginBottom: '20px' }}>
                            {error || 'Нет данных за выбранный период'}
                        </div>
                        <button className={styles.btn} onClick={() => router.push('/tracker/create')}>
                            Создать запись
                        </button>
                    </div>
                </div>
                <Bottombar />
            </>
        );
    }

    return (
        <>
            <Head><title>Средние по дням</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    📅 Средние показатели по дням
                </div>

                {/* Фильтр периода */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}>
                    {['week', 'month'].map((p) => (
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
                            {p === 'week' ? 'Неделя' : 'Месяц'}
                        </button>
                    ))}
                </div>

                {/* График колонками */}
                <div className={styles.card} style={{ padding: '20px 10px' }}>
                    <div className={styles.title}>📈 График показателей</div>

                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-end',
                        height: '200px',
                        marginTop: '20px',
                        padding: '10px',
                        borderBottom: '2px solid #e5e7eb',
                        overflowX: 'auto'
                    }}>
                        {dailyStats.map((day) => (
                            <div
                                key={day.date}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    minWidth: '60px'
                                }}
                            >
                                {/* Колонки для каждого показателя */}
                                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '160px' }}>
                                    {/* Энергия */}
                                    <div
                                        style={{
                                            width: '12px',
                                            height: `${((day.avgEnergyLevel || 0) / 10) * 160}px`,
                                            backgroundColor: '#22c55e',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.5s ease'
                                        }}
                                        title={`Энергия: ${day.avgEnergyLevel?.toFixed(1)}`}
                                    ></div>

                                    {/* Сон */}
                                    <div
                                        style={{
                                            width: '12px',
                                            height: `${((day.avgSleepQuality || 0) / 10) * 160}px`,
                                            backgroundColor: '#3b82f6',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.5s ease'
                                        }}
                                        title={`Сон: ${day.avgSleepQuality?.toFixed(1)}`}
                                    ></div>

                                    {/* Стресс */}
                                    <div
                                        style={{
                                            width: '12px',
                                            height: `${((day.avgStressLevel || 0) / 10) * 160}px`,
                                            backgroundColor: '#ef4444',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.5s ease'
                                        }}
                                        title={`Стресс: ${day.avgStressLevel?.toFixed(1)}`}
                                    ></div>

                                    {/* Продуктивность */}
                                    <div
                                        style={{
                                            width: '12px',
                                            height: `${((day.avgProductivityLevel || 0) / 10) * 160}px`,
                                            backgroundColor: '#a78bfa',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.5s ease'
                                        }}
                                        title={`Продуктивность: ${day.avgProductivityLevel?.toFixed(1)}`}
                                    ></div>
                                </div>

                                {/* Дата */}
                                <div style={{
                                    fontSize: '10px',
                                    color: '#666',
                                    transform: 'rotate(-45deg)',
                                    marginTop: '10px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {formatDate(day.date)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Легенда */}
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center',
                        marginTop: '20px',
                        flexWrap: 'wrap',
                        fontSize: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '2px' }}></div>
                            <span>Энергия</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                            <span>Сон</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
                            <span>Стресс</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#a78bfa', borderRadius: '2px' }}></div>
                            <span>Продуктивность</span>
                        </div>
                    </div>
                </div>

                {/* Детали по дням */}
                {dailyStats.map((day) => (
                    <div key={day.date} className={styles.card}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '15px',
                            color: '#7C3AED'
                        }}>
                            📅 {new Date(day.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                            Записей: {day.entryCount}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                            <div>⚡ Энергия: <strong>{day.avgEnergyLevel?.toFixed(1)}</strong></div>
                            <div>😴 Сон: <strong>{day.avgSleepQuality?.toFixed(1)}</strong></div>
                            <div>😰 Стресс: <strong>{day.avgStressLevel?.toFixed(1)}</strong></div>
                            <div>🎯 Продуктивность: <strong>{day.avgProductivityLevel?.toFixed(1)}</strong></div>
                        </div>
                    </div>
                ))}

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
