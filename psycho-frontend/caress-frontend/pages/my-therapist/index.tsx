import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { ProfileResponse, getTherapyApproachLabel, getWorkFormatLabel, getTargetAudienceLabel } from '@/services/profileApi';
import { specialistApi } from '@/services/specialistApi';
import { profileApi } from '@/services/profileApi';
import { MapPin, Award, Star, Clock, Users, AlertTriangle } from 'lucide-react';
import {getProblemAreaLabel} from "@/utils/problemAreaUtils";
import {checkAuth} from "@/utils/authUtils";

export default function MyTherapistPage() {
    const router = useRouter();
    const [specialist, setSpecialist] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'warning' | 'error'; message: string } | null>(null);
    const [isEnding, setIsEnding] = useState(false);
    const [therapyStartDate, setTherapyStartDate] = useState<string | null>(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);

    useEffect(() => {
        const init = async () => {
            const isAuthed = await checkAuth(router, 'USER');
            if (!isAuthed) return;  // ← данные не грузим если не авторизован

            await load();
        };

        void init();
    }, [router]);

    const load = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('jwt_token');

            // Грузим специалиста
            const data = await specialistApi.getSpecialistForPatient(token);
            setSpecialist(data);

            // Грузим свой профиль чтобы получить therapyStartDate
            try {
                const myProfile = await profileApi.getProfile(token);
                if (myProfile.userMetaData?.therapyStartDate) {
                    setTherapyStartDate(myProfile.userMetaData.therapyStartDate);
                }
            } catch (_) {
                // не критично
            }
        } catch (err: any) {
            const code = err.message as string;
            setErrorCode(code);

            switch (code) {
                case 'E_NOT_HAVE_ACTIVE_SPECIALIST':
                    setNotification({
                        type: 'warning',
                        message: 'У вас нет активного терапевта. Найдите специалиста и отправьте запрос на установление связи.'
                    });
                    break;
                case 'E_USER_PROFILE_NOT_FOUND_FOR_AVAILABILITY_OF_SPECIALIST':
                    setNotification({
                        type: 'warning',
                        message: 'У вас нет активного терапевта. Найдите специалиста и отправьте запрос на установление связи.'
                    });
                    break;
                case 'E_SPECIALIST_PROFILE_NOT_FOUND':
                    setNotification({
                        type: 'error',
                        message: 'Профиль вашего специалиста не найден. Возможно, специалист удалил аккаунт. Вы можете выбрать нового специалиста.'
                    });
                    break;
                default:
                    setNotification({
                        type: 'error',
                        message: 'Не удалось загрузить данные. Попробуйте позже.'
                    });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndTherapy = () => {
        if (!specialist) return;
        if (!confirm('Вы уверены, что хотите завершить терапию с этим специалистом?')) return;
        // Показываем модалку с оценкой
        setSelectedRating(0);
        setShowRatingModal(true);
    };

    const handleSubmitRating = async () => {
        if (!specialist) return;
        try {
            setIsEnding(true);
            const token = localStorage.getItem('jwt_token');
            await specialistApi.endTherapyWithSpecialist(specialist.userId, selectedRating, token);
            setShowRatingModal(false);
            router.push('/search');
        } catch (err: any) {
            console.error('End therapy error:', err.message);
            alert('Не удалось завершить терапию. Попробуйте позже.');
        } finally {
            setIsEnding(false);
        }
    };

    const Chip = ({ label, color = '#f3e8ff', textColor = '#7C3AED' }: { label: string; color?: string; textColor?: string }) => (
        <span style={{
            padding: '5px 12px', borderRadius: '16px',
            backgroundColor: color, color: textColor,
            fontSize: '12px', fontWeight: '500'
        }}>
            {label}
        </span>
    );

    if (isLoading) return (
        <>
            <Head><title>Мой терапевт</title></Head>
            <TopBar />
            <div className={styles.content}>
                <div className={styles.quiz_title}>Загрузка...</div>
            </div>
            <Bottombar />
        </>
    );

    // Заменить оба условных блока на:
    if (errorCode) {
        const isNoTherapist = errorCode === 'E_NOT_HAVE_ACTIVE_SPECIALIST';
        const isNotFound = errorCode === 'E_SPECIALIST_PROFILE_NOT_FOUND';

        return (
            <>
                <Head><title>Мой терапевт</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>💙 Мой терапевт</div>

                    {/* Уведомление */}
                    {notification && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '16px 18px',
                            borderRadius: '12px',
                            backgroundColor: notification.type === 'warning' ? '#fefce8' : '#fef2f2',
                            borderLeft: `4px solid ${notification.type === 'warning' ? '#facc15' : '#ef4444'}`,
                            marginBottom: '8px',
                            textAlign: 'left'
                        }}>
                        <span style={{ fontSize: '20px', flexShrink: 0 }}>
                            {notification.type === 'warning' ? '⚠️' : '❌'}
                        </span>
                            <div>
                                <div style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    color: notification.type === 'warning' ? '#854d0e' : '#dc2626',
                                    marginBottom: '4px'
                                }}>
                                    {notification.type === 'warning' ? 'Нет активного терапевта' : 'Ошибка'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                                    {notification.message}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA для поиска */}
                    <div className={styles.card}>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                                {isNoTherapist ? '🔍' : '😔'}
                            </div>
                            <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                                {isNoTherapist ? 'У вас пока нет терапевта' : 'Специалист недоступен'}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                                {isNoTherapist
                                    ? 'Найдите специалиста и отправьте запрос на установление связи'
                                    : 'Вы можете найти нового специалиста'}
                            </div>
                            <button
                                className={styles.btn}
                                onClick={() => router.push('/search')}
                            >
                                Найти специалиста
                            </button>
                        </div>
                    </div>
                </div>
                <Bottombar />
            </>
        );
    }

    const meta = specialist.specialistMetaData;

    return (
        <>
            <Head><title>Мой терапевт — {specialist.name}</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>💙 Мой терапевт</div>

                {/* Карточка специалиста */}
                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                                {specialist.name}
                            </div>
                            {meta?.specialization && (
                                <div style={{ fontSize: '14px', color: '#7C3AED', marginBottom: '8px' }}>
                                    {meta.specialization}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                                {specialist.city && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={13} /> {specialist.city}
                                    </span>
                                )}
                                {meta?.yearsOfExperience && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Award size={13} /> {meta.yearsOfExperience} лет опыта
                                    </span>
                                )}
                                {meta?.rating && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                                        <Star size={13} /> {meta.rating.toFixed(1)}
                                    </span>
                                )}
                                {meta?.sessionDuration && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={13} /> {meta.sessionDuration} мин
                                    </span>
                                )}
                            </div>
                        </div>
                        {meta?.sessionPrice && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7C3AED' }}>
                                    {meta.sessionPrice} ₽
                                    <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280' }}> /сессия</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Дата начала терапии */}
                    {therapyStartDate && (
                        <div style={{
                            marginTop: '14px', padding: '10px 14px',
                            backgroundColor: '#f0fdf4', borderRadius: '8px',
                            fontSize: '13px', color: '#15803d', textAlign: 'left'
                        }}>
                            ✅ Терапия началась:{' '}
                            {new Date(therapyStartDate).toLocaleDateString('ru-RU', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </div>
                    )}
                </div>

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

                {/* Завершить терапию */}
                <div className={styles.card} style={{ backgroundColor: '#fff7f7', borderLeft: '4px solid #fecaca' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left' }}>
                        <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>
                                Завершение терапии
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5' }}>
                                После завершения терапии связь со специалистом будет разорвана.
                                Вы сможете выбрать другого специалиста.
                            </div>
                            <button
                                onClick={handleEndTherapy}
                                disabled={isEnding}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                                    backgroundColor: isEnding ? '#9ca3af' : '#ef4444',
                                    color: 'white', cursor: isEnding ? 'not-allowed' : 'pointer',
                                    fontSize: '14px', fontWeight: '500',
                                    opacity: isEnding ? 0.7 : 1
                                }}
                            >
                                {isEnding ? 'Завершение...' : 'Завершить терапию'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Модальное окно оценки */}
            {showRatingModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '28px 24px',
                        width: '100%',
                        maxWidth: '360px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                            Оцените специалиста
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
                            Ваша оценка поможет другим пользователям выбрать специалиста.
                            Можно пропустить, не выбирая звёзды.
                        </div>

                        {/* Звёзды */}
                        <div style={{
                            display: 'flex', justifyContent: 'center',
                            gap: '8px', marginBottom: '24px'
                        }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setSelectedRating(star === selectedRating ? 0 : star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    style={{
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', padding: '4px',
                                        fontSize: '36px',
                                        color: star <= (hoveredStar || selectedRating) ? '#f59e0b' : '#d1d5db',
                                        transition: 'color 0.15s, transform 0.15s',
                                        transform: star <= (hoveredStar || selectedRating) ? 'scale(1.2)' : 'scale(1)'
                                    }}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        {/* Подпись выбранного рейтинга */}
                        <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '20px', minHeight: '20px' }}>
                            {selectedRating === 0 && ''}
                            {selectedRating === 1 && 'Плохо'}
                            {selectedRating === 2 && 'Удовлетворительно'}
                            {selectedRating === 3 && 'Хорошо'}
                            {selectedRating === 4 && 'Очень хорошо'}
                            {selectedRating === 5 && 'Отлично!'}
                        </div>

                        {/* Кнопки */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowRatingModal(false)}
                                disabled={isEnding}
                                style={{
                                    flex: 1, padding: '12px',
                                    borderRadius: '10px', border: '1px solid #d1d5db',
                                    backgroundColor: 'white', color: '#374151',
                                    cursor: 'pointer', fontSize: '14px'
                                }}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSubmitRating}
                                disabled={isEnding}
                                style={{
                                    flex: 1, padding: '12px',
                                    borderRadius: '10px', border: 'none',
                                    backgroundColor: isEnding ? '#9ca3af' : '#ef4444',
                                    color: 'white',
                                    cursor: isEnding ? 'not-allowed' : 'pointer',
                                    fontSize: '14px', fontWeight: '600',
                                    opacity: isEnding ? 0.7 : 1
                                }}
                            >
                                {isEnding ? 'Отправка...' : (selectedRating === 0 ? 'Завершить без оценки' : 'Отправить оценку')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Bottombar />
        </>
    );
}
