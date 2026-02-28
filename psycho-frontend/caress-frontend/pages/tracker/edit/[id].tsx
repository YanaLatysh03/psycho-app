import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import styles from '@/styles/main.module.css';
import { trackerApi, Emotion, TrackerEntryRequest, TrackerEntryDetail } from '@/services/trackerApi';
import { emotionLabels } from '@/utils/emotionUtils';
import {checkAuth} from "@/utils/authUtils";

// Группировка эмоций
const emotionGroups = {
    'Позитивные': [Emotion.JOY, Emotion.HAPPINESS, Emotion.EUPHORIA, Emotion.EXCITEMENT, Emotion.PRIDE, Emotion.PEACE, Emotion.LOVE],
    'Грусть': [Emotion.SADNESS, Emotion.MELANCHOLY, Emotion.LONELINESS, Emotion.DISAPPOINTMENT, Emotion.DESPAIR],
    'Злость': [Emotion.ANGER, Emotion.IRRITATION, Emotion.RESENTMENT],
    'Страх и тревога': [Emotion.FEAR, Emotion.ANXIETY],
    'Другие': [Emotion.SHAME, Emotion.GUILT, Emotion.DISGUST, Emotion.JEALOUSY, Emotion.ENVY],
    'Состояния': [Emotion.TIRED, Emotion.OVERWHELMED, Emotion.STRESSED]
};

export default function EditTracker() {
    const router = useRouter();
    const { id } = router.query;

    const [isLoadingEntry, setIsLoadingEntry] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [thoughts, setThoughts] = useState('');
    const [thoughtsLevel, setThoughtsLevel] = useState<number>(5);
    const [selectedEmotions, setSelectedEmotions] = useState<Emotion[]>([]);
    const [energyLevel, setEnergyLevel] = useState<number>(5);
    const [sleepQuality, setSleepQuality] = useState<number>(5);
    const [stressLevel, setStressLevel] = useState<number>(5);
    const [stressTriggers, setStressTriggers] = useState('');
    const [productivityLevel, setProductivityLevel] = useState<number>(5);

    useEffect(() => {
        if (!id) return;

        const init = async () => {
            const isAuthed = await checkAuth(router, 'USER');
            if (!isAuthed) return;  // ← данные не грузим если не авторизован

            await loadEntry();
        };

        void init();
    }, [router, id]);

    // Загрузка текущих данных записи
    const loadEntry = async () => {
        try {
            setIsLoadingEntry(true);
            setError(null);

            const token = localStorage.getItem('jwt_token');
            const entry: TrackerEntryDetail = await trackerApi.getEntryById(parseInt(id as string), token);

            // Заполнение формы текущими данными
            setThoughts(entry.thoughts || '');
            setThoughtsLevel(entry.thoughtsLevel || 5);
            setSelectedEmotions(entry.emotions ? Array.from(entry.emotions) : []);
            setEnergyLevel(entry.energyLevel || 5);
            setSleepQuality(entry.sleepQuality || 5);
            setStressLevel(entry.stressLevel || 5);
            setStressTriggers(entry.stressTriggers || '');
            setProductivityLevel(entry.productivityLevel || 5);

        } catch (err) {
            console.error('Error loading tracker entry:', err);
            setError('Не удалось загрузить запись');
        } finally {
            setIsLoadingEntry(false);
        }
    };

    const toggleEmotion = (emotion: Emotion) => {
        if (selectedEmotions.includes(emotion)) {
            setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
        } else {
            setSelectedEmotions([...selectedEmotions, emotion]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) return;

        setIsSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem('jwt_token');

            const entry: TrackerEntryRequest = {
                thoughts: thoughts || undefined,
                thoughtsLevel,
                emotions: selectedEmotions.length > 0 ? selectedEmotions : undefined,
                energyLevel,
                sleepQuality,
                stressLevel,
                stressTriggers: stressTriggers || undefined,
                productivityLevel
            };

            await trackerApi.updateEntry(parseInt(id as string), entry, token);

            // Успешно обновлено - переход на страницу просмотра
            router.push(`/tracker/${id}`);
        } catch (err) {
            console.error('Error updating tracker entry:', err);
            setError('Не удалось обновить запись. Попробуйте еще раз.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingEntry) {
        return (
            <>
                <Head><title>Загрузка...</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Загрузка записи...</div>
                </div>
                <Bottombar />
            </>
        );
    }

    if (error && !thoughts) {
        return (
            <>
                <Head><title>Ошибка</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Ошибка</div>
                    <div className={styles.card}>
                        <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>
                        <button className={styles.btn} onClick={() => router.push('/tracker/history')}>
                            Вернуться к истории
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
                <title>Редактирование записи</title>
            </Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    ✏️ Редактирование записи
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#c33',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        maxWidth: '350px',
                        margin: '0 auto 20px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Мысли */}
                    <div className={styles.card}>
                        <div className={styles.title}>💭 Мысли</div>
                        <textarea
                            value={thoughts}
                            onChange={(e) => setThoughts(e.target.value)}
                            placeholder="Опишите ваши мысли..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '14px',
                                fontFamily: 'Poppins, sans-serif',
                                resize: 'vertical',
                                marginBottom: '15px'
                            }}
                        />
                        <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                            Интенсивность мыслей: {thoughtsLevel}/10
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={thoughtsLevel}
                            onChange={(e) => setThoughtsLevel(parseInt(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Эмоции */}
                    <div className={styles.card}>
                        <div className={styles.title}>😊 Эмоции</div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                            Выберите одну или несколько эмоций
                        </div>
                        {Object.entries(emotionGroups).map(([groupName, emotions]) => (
                            <div key={groupName} style={{ marginBottom: '15px' }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    marginBottom: '8px',
                                    color: '#7C3AED'
                                }}>
                                    {groupName}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}>
                                    {emotions.map(emotion => (
                                        <button
                                            key={emotion}
                                            type="button"
                                            onClick={() => toggleEmotion(emotion)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '16px',
                                                border: selectedEmotions.includes(emotion)
                                                    ? '2px solid #7C3AED'
                                                    : '1px solid #ddd',
                                                backgroundColor: selectedEmotions.includes(emotion)
                                                    ? '#7C3AED'
                                                    : 'white',
                                                color: selectedEmotions.includes(emotion)
                                                    ? 'white'
                                                    : '#333',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {emotionLabels[emotion]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Уровни */}
                    <div className={styles.card}>
                        <div className={styles.title}>📊 Показатели</div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                                ⚡ Уровень энергии: {energyLevel}/10
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={energyLevel}
                                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                                😴 Качество сна: {sleepQuality}/10
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={sleepQuality}
                                onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                                😰 Уровень стресса: {stressLevel}/10
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={stressLevel}
                                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                                🎯 Уровень продуктивности: {productivityLevel}/10
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={productivityLevel}
                                onChange={(e) => setProductivityLevel(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Триггеры стресса */}
                    <div className={styles.card}>
                        <div className={styles.title}>⚠️ Триггеры стресса</div>
                        <textarea
                            value={stressTriggers}
                            onChange={(e) => setStressTriggers(e.target.value)}
                            placeholder="Что вызвало стресс сегодня?"
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '14px',
                                fontFamily: 'Poppins, sans-serif',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Кнопки действий */}
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={styles.btn}
                            style={{
                                width: '320px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                background: isSaving
                                    ? '#ccc'
                                    : 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                                color: 'white',
                                padding: '15px 30px',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                marginBottom: '10px'
                            }}
                        >
                            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push(`/tracker/${id}`)}
                            className={styles.btn}
                            style={{
                                width: '320px',
                                fontSize: '16px',
                                background: '#f3f4f6',
                                color: '#374151',
                                padding: '12px 30px'
                            }}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>

            <Bottombar />
        </>
    );
}
