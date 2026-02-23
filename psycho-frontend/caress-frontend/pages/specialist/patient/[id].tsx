import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import {ProfileResponse, Gender, profileApi} from '@/services/profileApi';
import {Emotion, trackerApi, TrackerEntryDetail} from '@/services/trackerApi';
import { testResultApi, TestResult } from '@/services/testResultApi';
import {AlertTriangle, ChevronLeft, ChevronRight} from 'lucide-react';
import {authApi} from "@/services/authApi";
import {emotionLabels} from "@/utils/emotionUtils";
import {specialistApi} from "@/services/specialistApi";
import {getProblemAreaLabel} from "@/utils/problemAreaUtils";

type Tab = 'profile' | 'tracker' | 'tests';

export default function PatientDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [patient, setPatient] = useState<ProfileResponse | null>(null);
    const [trackerEntries, setTrackerEntries] = useState<TrackerEntryDetail[]>([]);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCurrentTherapist, setIsCurrentTherapist] = useState(false);
    const [specialistOwnId, setSpecialistOwnId] = useState<number | null>(null);
    const [isEnding, setIsEnding] = useState(false);

    // Пагинация для трекера
    const [trackerPage, setTrackerPage] = useState(0);
    const [trackerSize] = useState(10);
    const [hasMoreTracker, setHasMoreTracker] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await authApi.getCurrentUser();

                if (user == null) {
                    throw 'User is null';
                }

                if (user.role !== 'SPECIALIST') {
                    router.push('/home');
                    return;
                }
            } catch (error) {
                router.push('/auth/login');
            }
        };
        checkAuth();
    }, [router]);

    // Загрузка данных пациента
    useEffect(() => {
        if (!id) return;

        const loadPatientData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const token = localStorage.getItem('jwt_token');

                // ✅ Стало — грузим профиль напрямую + определяем роль:
                const profile = await profileApi.getUserProfileByUserId(Number(id), token);
                setPatient(profile);

                // Чтобы сравнить currentTherapistId, нужен ID самого специалиста.
                // Берём из своего профиля:
                const myProfile = await profileApi.getProfile(token);
                const myId = myProfile?.userId;
                setSpecialistOwnId(myId ?? null);

                const isTherapist = profile.userMetaData?.currentTherapistId === myId;
                setIsCurrentTherapist(isTherapist);
            } catch (err) {
                console.error('Error loading patient:', err);
                setError('Не удалось загрузить данные пациента');
            } finally {
                setIsLoading(false);
            }
        };

        loadPatientData();
    }, [id]);

    // Загрузка данных трекера
    const loadTrackerData = async (page: number = 0) => {
        if (!id) return;

        try {
            const token = localStorage.getItem('jwt_token');
            const entries = await trackerApi.getUserEntries(Number(id), page, trackerSize, undefined, undefined, token);
            setTrackerEntries(entries);
            setHasMoreTracker(entries.length === trackerSize);
            setTrackerPage(page);
        } catch (err) {
            console.error('Error loading tracker:', err);
        }
    };

    // Загрузка результатов тестов
    const loadTestResults = async () => {
        if (!id) return;

        try {
            const token = localStorage.getItem('jwt_token');
            const results = await testResultApi.getResultsByUserId(Number(id), token);
            setTestResults(results);
        } catch (err) {
            console.error('Error loading test results:', err);
        }
    };

    const handleEndTherapy = async () => {
        if (!id) return;
        if (!confirm(`Вы уверены, что хотите завершить терапию с этим пациентом?`)) return;
        try {
            setIsEnding(true);
            const token = localStorage.getItem('jwt_token');
            await specialistApi.endTherapyWithPatient(Number(id), token);
            router.push('/specialist/patients');
        } catch (err: any) {
            console.error('End therapy error:', err.message);
            alert('Не удалось завершить терапию. Попробуйте позже.');
        } finally {
            setIsEnding(false);
        }
    };

    // Загрузка данных при смене вкладки
    useEffect(() => {
        if (activeTab === 'tracker' && trackerEntries.length === 0) {
            loadTrackerData(0);
        } else if (activeTab === 'tests' && testResults.length === 0) {
            loadTestResults();
        }
    }, [activeTab]);

    const calculateAge = (birthday: string): number => {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Функция для получения русского названия эмоции
    const getEmotionLabel = (emotion: Emotion): string => {
        return emotionLabels[emotion] || emotion;
    };

    if (isLoading) {
        return (
            <>
                <Head><title>Пациент</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Загрузка...</div>
                </div>
                <Bottombar />
            </>
        );
    }

    if (error || !patient) {
        return (
            <>
                <Head><title>Пациент</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Ошибка</div>
                    <div className={styles.card}>
                        <p style={{ color: '#dc2626' }}>{error || 'Пациент не найден'}</p>
                        <button
                            className={styles.btn}
                            onClick={() => router.push('/specialist/patients')}
                        >
                            ← К списку пациентов
                        </button>
                    </div>
                </div>
                <Bottombar />
            </>
        );
    }

    const availableTabs = isCurrentTherapist
        ? ['profile', 'tracker', 'tests']
        : ['profile'];

    return (
        <>
            <Head><title>{patient.name}</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    👤 {patient.name}
                </div>

                {/* Вкладки */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                }}>
                    {availableTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as Tab)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '20px',
                                border: activeTab === tab ? '2px solid #7C3AED' : '1px solid #ccc',
                                backgroundColor: activeTab === tab ? '#7C3AED' : 'white',
                                color: activeTab === tab ? 'white' : '#333',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: activeTab === tab ? 'bold' : 'normal',
                                transition: 'all 0.3s'
                            }}
                        >
                            {tab === 'profile' ? '📋 Профиль' : tab === 'tracker' ? '📊 Трекер' : '🧪 Тесты'}
                        </button>
                    ))}
                </div>

                {!isCurrentTherapist && (
                    <div className={styles.card} style={{
                        backgroundColor: '#fef3c7',
                        borderLeft: '4px solid #f59e0b',
                        textAlign: 'left',
                        fontSize: '14px',
                        color: '#92400e'
                    }}>
                        ⚠️ Вы ещё не являетесь терапевтом этого пользователя.
                        Трекер и результаты тестов будут доступны после принятия запроса.
                    </div>
                )}

                {/* Вкладка: Профиль */}
                {activeTab === 'profile' && (
                    <>
                        <div className={styles.card}>
                            <div className={styles.title}>Основная информация</div>
                            <div style={{ marginTop: '15px', fontSize: '14px', lineHeight: '1.8', textAlign: 'left' }}>
                                <div><strong>Имя:</strong> {patient.name}</div>
                                <div><strong>Пол:</strong> {patient.gender === Gender.MALE ? 'Мужской' : 'Женский'}</div>
                                <div><strong>Возраст:</strong> {calculateAge(patient.birthday)} лет</div>
                                <div><strong>Дата рождения:</strong> {new Date(patient.birthday).toLocaleDateString('ru-RU')}</div>
                                <div><strong>Город:</strong> {patient.city}</div>
                                <div><strong>Телефон:</strong> {patient.phone}</div>
                            </div>
                        </div>

                        {patient.userMetaData && (
                            <>
                                {patient.userMetaData.problemAreas && patient.userMetaData.problemAreas.length > 0 && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Проблемные области</div>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            marginTop: '10px'
                                        }}>
                                            {Array.from(patient.userMetaData.problemAreas).map((area) => (
                                                <span
                                                    key={area}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '16px',
                                                        backgroundColor: '#dbeafe',
                                                        color: '#1e40af',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    {getProblemAreaLabel(area)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {patient.userMetaData.therapyGoals && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Цели терапии</div>
                                        <div style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6', textAlign: 'left' }}>
                                            {patient.userMetaData.therapyGoals}
                                        </div>
                                    </div>
                                )}

                                {patient.userMetaData.currentSituation && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Текущая ситуация</div>
                                        <div style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6', textAlign: 'left' }}>
                                            {patient.userMetaData.currentSituation}
                                        </div>
                                    </div>
                                )}

                                {patient.userMetaData.inCrisis && (
                                    <div className={styles.card} style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca' }}>
                                        <div style={{ color: '#dc2626', fontWeight: 'bold' }}>
                                            ⚠️ Пациент в кризисной ситуации
                                        </div>
                                    </div>
                                )}

                                {patient.userMetaData.totalSessionsAttended !== undefined && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Статистика</div>
                                        <div style={{ marginTop: '10px', fontSize: '14px', textAlign: 'left' }}>
                                            Посещено сессий: <strong>{patient.userMetaData.totalSessionsAttended}</strong>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Вкладка: Трекер */}
                {activeTab === 'tracker' && (
                    <>
                        {trackerEntries.length === 0 ? (
                            <div className={styles.card}>
                                <p style={{ color: '#666' }}>Записей трекера пока нет</p>
                            </div>
                        ) : (
                            <>
                                {trackerEntries.map((entry) => (
                                    <div key={entry.id} className={styles.card}>
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#7C3AED',
                                            marginBottom: '10px'
                                        }}>
                                            📅 {new Date(entry.entryDatetime).toLocaleString('ru-RU')}
                                        </div>

                                        {entry.thoughts && (
                                            <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                                                <strong>Мысли:</strong>
                                                <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
                                                    {entry.thoughts}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '10px',
                                            fontSize: '13px',
                                            textAlign: 'left'
                                        }}>
                                            <div>⚡ Энергия: <strong>{entry.energyLevel}/10</strong></div>
                                            <div>😴 Сон: <strong>{entry.sleepQuality}/10</strong></div>
                                            <div>😰 Стресс: <strong>{entry.stressLevel}/10</strong></div>
                                            <div>🎯 Продуктивность: <strong>{entry.productivityLevel}/10</strong></div>
                                        </div>

                                        {entry.emotions && entry.emotions.length > 0 && (
                                            <div style={{ marginTop: '10px', textAlign: 'left' }}>
                                                <strong>Эмоции:</strong>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                                    {entry.emotions.map((emotion, idx) => (
                                                        <span
                                                            key={idx}
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '12px',
                                                                backgroundColor: '#f3e8ff',
                                                                color: '#7C3AED',
                                                                fontSize: '11px'
                                                            }}
                                                        >
                                                            {getEmotionLabel(emotion)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Пагинация */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '15px',
                                    marginTop: '20px'
                                }}>
                                    <button
                                        onClick={() => loadTrackerData(trackerPage - 1)}
                                        disabled={trackerPage === 0}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            backgroundColor: trackerPage === 0 ? '#f3f4f6' : 'white',
                                            cursor: trackerPage === 0 ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <ChevronLeft size={18} />
                                        Назад
                                    </button>

                                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                                        Страница {trackerPage + 1}
                                    </span>

                                    <button
                                        onClick={() => loadTrackerData(trackerPage + 1)}
                                        disabled={!hasMoreTracker}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            backgroundColor: !hasMoreTracker ? '#f3f4f6' : 'white',
                                            cursor: !hasMoreTracker ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        Вперед
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Вкладка: Тесты */}
                {activeTab === 'tests' && (
                    <>
                        {testResults.length === 0 ? (
                            <div className={styles.card}>
                                <p style={{ color: '#666' }}>Пациент ещё не проходил тесты</p>
                            </div>
                        ) : (
                            testResults.map((result) => (
                                <div
                                    key={result.id}
                                    className={styles.card}
                                    onClick={() => router.push(`/test-result/${result.id}`)}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#1f2937',
                                        marginBottom: '8px',
                                        textAlign: 'left'
                                    }}>
                                        {result.testName}
                                    </div>

                                    <div style={{
                                        fontSize: '14px',
                                        color: '#666',
                                        marginBottom: '8px',
                                        textAlign: 'left'
                                    }}>
                                        📅 {new Date(result.testDatetime).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: '12px'
                                    }}>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#7C3AED',
                                            fontWeight: 'bold'
                                        }}>
                                            Балл: {result.score}
                                        </div>
                                        <div style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            backgroundColor: '#f3e8ff',
                                            fontSize: '12px',
                                            color: '#7C3AED'
                                        }}>
                                            {result.interpretation?.substring(0, 30)}...
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {/* Завершить терапию — только если является текущим терапевтом */}
                {isCurrentTherapist && (
                    <div className={styles.card} style={{
                        backgroundColor: '#fff7f7',
                        borderLeft: '4px solid #fecaca'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left' }}>
                            <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{
                                    fontSize: '14px', fontWeight: 'bold',
                                    color: '#dc2626', marginBottom: '4px'
                                }}>
                                    Завершение терапии
                                </div>
                                <div style={{
                                    fontSize: '13px', color: '#6b7280',
                                    marginBottom: '12px', lineHeight: '1.5'
                                }}>
                                    После завершения связь с пациентом будет разорвана.
                                    Пациент сможет выбрать другого специалиста.
                                </div>
                                <button
                                    onClick={handleEndTherapy}
                                    disabled={isEnding}
                                    style={{
                                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                                        backgroundColor: isEnding ? '#9ca3af' : '#ef4444',
                                        color: 'white',
                                        cursor: isEnding ? 'not-allowed' : 'pointer',
                                        fontSize: '14px', fontWeight: '500',
                                        opacity: isEnding ? 0.7 : 1
                                    }}
                                >
                                    {isEnding ? 'Завершение...' : 'Завершить терапию'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Кнопка назад */}
                <button
                    className={styles.btn}
                    onClick={() => router.push('/specialist/patients')}
                    style={{
                        width: '320px',
                        display: 'block',
                        margin: '20px auto 30px',
                        background: '#f3f4f6',
                        color: '#374151'
                    }}
                >
                    ← К списку пациентов
                </button>
            </div>

            <Bottombar />
        </>
    );
}
