import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import {
    profileApi, ProfileResponse,
    getProblemAreaLabel, getTherapyApproachLabel,
    getWorkFormatLabel, getTargetAudienceLabel,
    Gender
} from '@/services/profileApi';
import { therapyRequestApi } from '@/services/therapyRequestApi';
import { MapPin, Award, DollarSign, Star, Clock, Users, Send, ChevronLeft } from 'lucide-react';

export default function TherapistProfilePage() {
    const router = useRouter();
    const { id } = router.query;

    const [specialist, setSpecialist] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Состояние для отправки запроса
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);

    // Константы для читаемости
    const ERROR_MESSAGES: Record<string, string> = {
        E_HAVE_ACTIVE_REQUEST:
            'У вас уже есть активный запрос к специалисту. Дождитесь его рассмотрения или отмените его.',
        E_HAVE_ACTIVE_SPECIALIST:
            'У вас уже есть специалист. Для смены специалиста завершите текущую терапию.',
        E_USER_PROFILE_NOT_FOUND:
            'Для отправки запроса необходимо сначала заполнить профиль.',
    };

    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('jwt_token');
                const profile = await profileApi.getUserProfileByUserId(Number(id), token);
                setSpecialist(profile);
            } catch (err) {
                console.error('Error loading specialist:', err);
                setError('Не удалось загрузить профиль специалиста');
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [id]);

    const handleSendRequest = async () => {
        if (!id) return;
        try {
            setIsSending(true);
            setRequestError(null);
            const token = localStorage.getItem('jwt_token');
            await therapyRequestApi.sendRequest(Number(id), requestMessage, token);
            setRequestSent(true);
            setShowRequestForm(false);
        } catch (err: any) {
            const code = err.message as string;

            if (code === 'E_USER_PROFILE_NOT_FOUND') {
                // Перенаправляем на создание профиля с сообщением об ошибке
                router.push('/profile?error=profile_required');
                return;
            }

            // Остальные ошибки показываем на месте
            setRequestError(ERROR_MESSAGES[code] || 'Не удалось отправить запрос. Попробуйте позже.');
        } finally {
            setIsSending(false);
        }
    };

    const calculateAge = (birthday: string): number => {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    // Тег-чип с цветом
    const Chip = ({ label, color = '#f3e8ff', textColor = '#7C3AED' }: { label: string; color?: string; textColor?: string }) => (
        <span style={{
            padding: '5px 12px',
            borderRadius: '16px',
            backgroundColor: color,
            color: textColor,
            fontSize: '12px',
            fontWeight: '500'
        }}>
            {label}
        </span>
    );

    if (isLoading) return (
        <>
            <Head><title>Профиль специалиста</title></Head>
            <TopBar />
            <div className={styles.content}>
                <div className={styles.quiz_title}>Загрузка...</div>
            </div>
            <Bottombar />
        </>
    );

    if (error || !specialist) return (
        <>
            <Head><title>Ошибка</title></Head>
            <TopBar />
            <div className={styles.content}>
                <div className={styles.card} style={{ color: '#dc2626' }}>{error || 'Специалист не найден'}</div>
                <button className={styles.btn} onClick={() => router.push('/search')}>← Назад к поиску</button>
            </div>
            <Bottombar />
        </>
    );

    const meta = specialist.specialistMetaData;

    return (
        <>
            <Head><title>{specialist.name}</title></Head>
            <TopBar />

            <div className={styles.content}>

                {/* Шапка специалиста */}
                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                                {specialist.name}
                            </div>
                            {meta?.specialization && (
                                <div style={{ fontSize: '14px', color: '#7C3AED', marginBottom: '8px' }}>
                                    {meta.specialization}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280', flexWrap: 'wrap' }}>
                                {specialist.city && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={14} /> {specialist.city}
                                    </span>
                                )}
                                {meta?.yearsOfExperience && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Award size={14} /> {meta.yearsOfExperience} лет опыта
                                    </span>
                                )}
                                {meta?.rating && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                                        <Star size={14} /> {meta.rating.toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Цена + кнопка */}
                        <div style={{ textAlign: 'right' }}>
                            {meta?.sessionPrice && (
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7C3AED', marginBottom: '4px' }}>
                                    {meta.sessionPrice} BYN
                                    <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#6b7280' }}> /сессия</span>
                                </div>
                            )}
                            {meta?.sessionDuration && (
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                    <Clock size={13} /> {meta.sessionDuration} минут
                                </div>
                            )}
                            {meta?.providesFreeConsultation && (
                                <div style={{ fontSize: '12px', color: '#22c55e', marginBottom: '8px' }}>
                                    ✓ Бесплатная консультация
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Кнопка / Форма запроса */}
                {requestSent ? (
                    <div className={styles.card} style={{ backgroundColor: '#dcfce7', borderLeft: '4px solid #22c55e', textAlign: 'left' }}>
                        <div style={{ color: '#15803d', fontWeight: 'bold', fontSize: '15px' }}>
                            ✅ Запрос отправлен!
                        </div>
                        <div style={{ color: '#166534', fontSize: '13px', marginTop: '4px' }}>
                            Специалист рассмотрит ваш запрос и свяжется с вами.
                        </div>
                    </div>
                ) : !showRequestForm ? (
                    <button
                        className={styles.btn}
                        onClick={() => setShowRequestForm(true)}
                        style={{ width: '100%', maxWidth: '400px', display: 'block', margin: '0 auto' }}
                    >
                        <Send size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                        Отправить запрос на терапию
                    </button>
                ) : (
                    <div className={styles.card}>
                        <div className={styles.title} style={{ textAlign: 'left', marginBottom: '12px' }}>
                            Сообщение специалисту
                        </div>
                        <textarea
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            placeholder="Опишите кратко, с чем хотите работать, что вас беспокоит..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontSize: '14px',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                                marginBottom: '12px'
                            }}
                        />
                        {requestError && (
                            <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>
                                {requestError}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className={styles.btn}
                                onClick={handleSendRequest}
                                disabled={isSending || !requestMessage.trim()}
                                style={{ flex: 1, opacity: isSending || !requestMessage.trim() ? 0.6 : 1 }}
                            >
                                {isSending ? 'Отправка...' : 'Отправить'}
                            </button>
                            <button
                                onClick={() => { setShowRequestForm(false); setRequestError(null); }}
                                style={{
                                    flex: 1, padding: '12px',
                                    borderRadius: '8px', border: '1px solid #ccc',
                                    backgroundColor: 'white', cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                )}

                {/* Образование */}
                {meta?.education && (
                    <div className={styles.card}>
                        <div className={styles.title}>Образование</div>
                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#374151', textAlign: 'left', lineHeight: '1.6' }}>
                            {meta.education}
                        </div>
                    </div>
                )}

                {/* Подходы */}
                {meta?.approaches && meta.approaches.length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.title}>Терапевтические подходы</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                            {meta.approaches.map(a => (
                                <Chip key={a} label={getTherapyApproachLabel(a)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Проблемные области */}
                {meta?.problemAreas && meta.problemAreas.length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.title}>Работает с запросами</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                            {Array.from(meta.problemAreas).map(a => (
                                <Chip key={a} label={getProblemAreaLabel(a)} color="#dbeafe" textColor="#1e40af" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Форматы работы */}
                {meta?.workFormats && meta.workFormats.length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.title}>Форматы работы</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                            {meta.workFormats.map(f => (
                                <Chip key={f} label={getWorkFormatLabel(f)} color="#dcfce7" textColor="#15803d" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Целевая аудитория */}
                {meta?.targetAudiences && meta.targetAudiences.length > 0 && (
                    <div className={styles.card}>
                        <div className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={16} /> Работает с
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                            {meta.targetAudiences.map(a => (
                                <Chip key={a} label={getTargetAudienceLabel(a)} color="#fef3c7" textColor="#d97706" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Кнопка назад */}
                <button
                    onClick={() => router.back()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '10px 20px', borderRadius: '8px',
                        border: '1px solid #ccc', backgroundColor: 'white',
                        color: '#374151', cursor: 'pointer', fontSize: '14px',
                        margin: '10px auto 30px'
                    }}
                >
                    <ChevronLeft size={16} /> Назад к поиску
                </button>

            </div>

            <Bottombar />
        </>
    );
}
