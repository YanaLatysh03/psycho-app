import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { trackerApi, TrackerEntryDetail, Emotion } from '@/services/trackerApi';
import {emotionLabels} from "@/utils/emotionUtils";

export default function TrackerEntryDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [entry, setEntry] = useState<TrackerEntryDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!id) return;

        const loadEntry = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const token = localStorage.getItem('jwt_token');
                const entryData = await trackerApi.getEntryById(parseInt(id as string), token);
                setEntry(entryData);
            } catch (err) {
                console.error('Error loading entry:', err);
                setError('Не удалось загрузить запись');
            } finally {
                setIsLoading(false);
            }
        };

        loadEntry();
    }, [id]);

    const handleDelete = async () => {
        if (!entry) return;

        try {
            setIsDeleting(true);
            const token = localStorage.getItem('jwt_token');
            await trackerApi.deleteEntry(entry.id, token);

            // Перенаправление на историю
            router.push('/tracker/history');
        } catch (err) {
            console.error('Error deleting entry:', err);
            alert('Не удалось удалить запись');
            setIsDeleting(false);
        }
    };

    const getEmotionLabel = (emotion: Emotion): string => {
        return emotionLabels[emotion] || emotion;
    };

    if (isLoading) {
        return (
            <>
                <Head><title>Загрузка...</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Загрузка...</div>
                </div>
                <Bottombar />
            </>
        );
    }

    if (error || !entry) {
        return (
            <>
                <Head><title>Ошибка</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Ошибка</div>
                    <div className={styles.card}>
                        <div style={{ color: '#ef4444', marginBottom: '20px' }}>
                            {error || 'Запись не найдена'}
                        </div>
                        <button className={styles.btn} onClick={() => router.push('/tracker/history')}>
                            Вернуться к истории
                        </button>
                    </div>
                </div>
                <Bottombar />
            </>
        );
    }

    const formattedDate = new Date(entry.entryDatetime).toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <>
            <Head><title>Запись трекера</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    📝 Запись трекера
                </div>

                <div className={styles.card}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                        🕐 {formattedDate}
                    </div>

                    {/* Мысли */}
                    {entry.thoughts && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                                💭 Мысли
                            </div>
                            <div style={{
                                backgroundColor: '#f9fafb',
                                padding: '15px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                lineHeight: '1.6'
                            }}>
                                {entry.thoughts}
                            </div>
                            {entry.thoughtsLevel && (
                                <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                                    Интенсивность: {entry.thoughtsLevel}/10
                                </div>
                            )}
                        </div>
                    )}

                    {/* Эмоции */}
                    {entry.emotions && entry.emotions.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                                😊 Эмоции
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {Array.from(entry.emotions).map((emotion, idx) => (
                                    <span key={idx} style={{
                                        padding: '6px 14px',
                                        backgroundColor: '#ede9fe',
                                        borderRadius: '16px',
                                        fontSize: '13px',
                                        color: '#7C3AED'
                                    }}>
                                        {getEmotionLabel(emotion)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Показатели */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
                            📊 Показатели
                        </div>

                        {entry.energyLevel !== undefined && (
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                                    ⚡ Уровень энергии: <strong>{entry.energyLevel}/10</strong>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${entry.energyLevel * 10}%`,
                                        height: '100%',
                                        backgroundColor: '#22c55e',
                                        transition: 'width 0.3s'
                                    }}></div>
                                </div>
                            </div>
                        )}

                        {entry.sleepQuality !== undefined && (
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                                    😴 Качество сна: <strong>{entry.sleepQuality}/10</strong>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${entry.sleepQuality * 10}%`,
                                        height: '100%',
                                        backgroundColor: '#3b82f6',
                                        transition: 'width 0.3s'
                                    }}></div>
                                </div>
                            </div>
                        )}

                        {entry.stressLevel !== undefined && (
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                                    😰 Уровень стресса: <strong>{entry.stressLevel}/10</strong>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${entry.stressLevel * 10}%`,
                                        height: '100%',
                                        backgroundColor: '#ef4444',
                                        transition: 'width 0.3s'
                                    }}></div>
                                </div>
                            </div>
                        )}

                        {entry.productivityLevel !== undefined && (
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                                    🎯 Уровень продуктивности: <strong>{entry.productivityLevel}/10</strong>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${entry.productivityLevel * 10}%`,
                                        height: '100%',
                                        backgroundColor: '#a78bfa',
                                        transition: 'width 0.3s'
                                    }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Триггеры стресса */}
                    {entry.stressTriggers && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                                ⚠️ Триггеры стресса
                            </div>
                            <div style={{
                                backgroundColor: '#fef2f2',
                                padding: '15px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: '#991b1b'
                            }}>
                                {entry.stressTriggers}
                            </div>
                        </div>
                    )}

                    {/* Кнопки действий */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        marginTop: '30px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            className={styles.btn}
                            onClick={() => router.push(`/tracker/edit/${entry.id}`)}
                            style={{
                                flex: 1,
                                minWidth: '150px',
                                background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                                color: 'white'
                            }}
                        >
                            ✏️ Редактировать
                        </button>
                        <button
                            className={styles.btn}
                            onClick={() => setShowDeleteConfirm(true)}
                            style={{
                                flex: 1,
                                minWidth: '150px',
                                background: '#ef4444',
                                color: 'white'
                            }}
                        >
                            🗑️ Удалить
                        </button>
                    </div>

                    <button
                        className={styles.btn}
                        onClick={() => router.push('/tracker/history')}
                        style={{
                            width: '100%',
                            marginTop: '10px',
                            background: '#f3f4f6',
                            color: '#374151'
                        }}
                    >
                        ← Вернуться к истории
                    </button>
                </div>
            </div>

            {/* Модальное окно подтверждения удаления */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                            Удалить запись?
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '25px' }}>
                            Это действие нельзя отменить
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className={styles.btn}
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    background: '#f3f4f6',
                                    color: '#374151'
                                }}
                            >
                                Отмена
                            </button>
                            <button
                                className={styles.btn}
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    background: '#ef4444',
                                    color: 'white'
                                }}
                            >
                                {isDeleting ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Bottombar />
        </>
    );
}
