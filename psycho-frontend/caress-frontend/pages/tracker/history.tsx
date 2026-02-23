import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { trackerApi, TrackerEntrySummary, Emotion } from '@/services/trackerApi';
import {emotionLabels} from "@/utils/emotionUtils";

export default function TrackerHistory() {
    const router = useRouter();
    const [entries, setEntries] = useState<TrackerEntrySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEntries = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const token = localStorage.getItem('jwt_token');
                const trackerEntries = await trackerApi.getMyEntries(0, 50, token);
                setEntries(trackerEntries);
            } catch (err) {
                console.error('Error loading tracker entries:', err);
                setError('Не удалось загрузить записи трекера');
            } finally {
                setIsLoading(false);
            }
        };

        loadEntries();
    }, []);

    // Группировка записей по датам
    const groupByDate = (entries: TrackerEntrySummary[]) => {
        const groups: { [key: string]: TrackerEntrySummary[] } = {};

        entries.forEach(entry => {
            const date = new Date(entry.entryDatetime).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(entry);
        });

        return groups;
    };

    const formatTime = (dateString: string): string => {
        return new Date(dateString).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEmotionLabel = (emotion: Emotion): string => {
        return emotionLabels[emotion] || emotion;
    };

    if (isLoading) {
        return (
            <>
                <Head><title>История трекера</title></Head>
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
                <Head><title>История трекера</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Ошибка</div>
                    <div className={styles.card}>
                        <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>
                        <button className={styles.btn} onClick={() => window.location.reload()}>
                            Попробовать снова
                        </button>
                    </div>
                </div>
                <Bottombar />
            </>
        );
    }

    const groupedEntries = groupByDate(entries);

    return (
        <>
            <Head><title>История трекера</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    📊 История состояний
                </div>

                {entries.length === 0 ? (
                    <div className={styles.card}>
                        <div className={styles.title}>Нет записей</div>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            Вы еще не создали ни одной записи в трекере
                        </p>
                        <button
                            className={styles.btn}
                            onClick={() => router.push('/tracker/create')}
                        >
                            Создать первую запись
                        </button>
                    </div>
                ) : (
                    Object.entries(groupedEntries).map(([date, dateEntries]) => (
                        <div key={date} style={{ marginBottom: '30px' }}>
                            {/* Заголовок даты */}
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#7C3AED',
                                marginBottom: '15px',
                                textAlign: 'center',
                                fontFamily: 'Poppins, sans-serif'
                            }}>
                                📅 {date}
                            </div>

                            {/* Записи за этот день */}
                            {dateEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={styles.card}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        marginBottom: '15px'
                                    }}
                                    onClick={() => router.push(`/tracker/${entry.id}`)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0px 0px 4px rgba(0, 0, 0, 0.4)';
                                    }}
                                >
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#666',
                                        marginBottom: '10px'
                                    }}>
                                        🕐 {formatTime(entry.entryDatetime)}
                                    </div>

                                    {entry.emotionsSummary && entry.emotionsSummary.length > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            marginBottom: '10px'
                                        }}>
                                            {entry.emotionsSummary.slice(0, 5).map((emotion, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        padding: '4px 10px',
                                                        backgroundColor: '#f0f9ff',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        color: '#0369a1'
                                                    }}
                                                >
                                                    {getEmotionLabel(emotion)}
                                                </span>
                                            ))}
                                            {entry.emotionsSummary.length > 5 && (
                                                <span style={{
                                                    padding: '4px 10px',
                                                    fontSize: '12px',
                                                    color: '#666'
                                                }}>
                                                    +{entry.emotionsSummary.length - 5} еще
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div style={{
                                        fontSize: '12px',
                                        color: '#7C3AED',
                                        textAlign: 'right',
                                        fontWeight: '500'
                                    }}>
                                        Подробнее →
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}

                {entries.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '30px' }}>
                        <button
                            className={styles.btn}
                            onClick={() => router.push('/tracker/create')}
                            style={{
                                background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                                color: 'white'
                            }}
                        >
                            + Добавить новую запись
                        </button>
                    </div>
                )}
            </div>

            <Bottombar />
        </>
    );
}
