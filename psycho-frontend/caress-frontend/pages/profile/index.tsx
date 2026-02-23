import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import {
    profileApi,
    ProfileResponse,
    CreateProfileRequest,
    Gender,
    ProblemArea,
    TargetAudience,
    WorkFormat,
    TherapyApproach,
    getTargetAudienceLabel,
    getWorkFormatLabel,
    getTherapyApproachLabel
} from '@/services/profileApi';
import {getProblemAreaLabel} from "@/utils/problemAreaUtils";

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const { error: queryError } = router.query;
    // Показываем баннер, если пришли с ошибкой
    const [profileRequiredNotice, setProfileRequiredNotice] = useState(false);

    // Форма данных
    const [formData, setFormData] = useState<CreateProfileRequest>({
        name: '',
        gender: Gender.MALE,
        city: '',
        phone: '',
        birthday: '',
        userMetaData: {
            problemAreas: [],
            therapyGoals: '',
            currentSituation: '',
            inCrisis: false
        },
        specialistMetaData: {
            education: '',
            specialization: '',
            yearsOfExperience: 0,
            approaches: [],
            problemAreas: [],
            workFormats: [],
            targetAudiences: [],
            sessionPrice: 0,
            sessionDuration: 60,
            providesFreeConsultation: false
        }
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const token = localStorage.getItem('jwt_token');
                const role = localStorage.getItem('user_role'); // 👈 Получить роль
                setUserRole(role);

                const profileData = await profileApi.getProfile(token);

                setProfile(profileData);
                setProfileExists(true);

                // Заполнить форму данными профиля в зависимости от роли
                setFormData({
                    name: profileData.name,
                    gender: profileData.gender,
                    city: profileData.city,
                    phone: profileData.phone,
                    birthday: profileData.birthday,
                    userMetaData: profileData.userMetaData || {
                        problemAreas: [],
                        therapyGoals: '',
                        currentSituation: '',
                        inCrisis: false
                    },
                    specialistMetaData: profileData.specialistMetaData || {
                        education: '',
                        specialization: '',
                        yearsOfExperience: 0,
                        approaches: [],
                        problemAreas: [],
                        workFormats: [],
                        targetAudiences: [],
                        sessionPrice: 0,
                        sessionDuration: 60,
                        providesFreeConsultation: false
                    }
                });
            } catch (err: any) {
                console.error('Error loading profile:', err);
                if (err.message === 'PROFILE_NOT_FOUND') {
                    const role = localStorage.getItem('user_role');
                    setUserRole(role);
                    setProfileExists(false);
                    setIsEditing(true);
                } else {
                    setError('Не удалось загрузить профиль');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    useEffect(() => {
        if (queryError === 'profile_required') {
            setProfileRequiredNotice(true);
        }
    }, [queryError]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Для USER
    const handleUserMetaDataChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            userMetaData: {
                ...prev.userMetaData!,
                [field]: value
            }
        }));
    };

    // Для SPECIALIST
    const handleSpecialistMetaDataChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            specialistMetaData: {
                ...prev.specialistMetaData!,
                [field]: value
            }
        }));
    };

    // Для проблемных областей USER
    const toggleUserProblemArea = (area: ProblemArea) => {
        setFormData(prev => {
            const currentAreas = prev.userMetaData?.problemAreas || [];
            const newAreas = currentAreas.includes(area)
                ? currentAreas.filter(a => a !== area)
                : [...currentAreas, area];

            return {
                ...prev,
                userMetaData: {
                    ...prev.userMetaData!,
                    problemAreas: newAreas
                }
            };
        });
    };

    // Для проблемных областей SPECIALIST
    const toggleSpecialistProblemArea = (area: ProblemArea) => {
        setFormData(prev => {
            const currentAreas = prev.specialistMetaData?.problemAreas || [];
            const newAreas = currentAreas.includes(area)
                ? currentAreas.filter(a => a !== area)
                : [...currentAreas, area];

            return {
                ...prev,
                specialistMetaData: {
                    ...prev.specialistMetaData!,
                    problemAreas: newAreas
                }
            };
        });
    };

    // Для подходов терапии
    const toggleApproach = (approach: TherapyApproach) => {
        setFormData(prev => {
            const currentApproaches = prev.specialistMetaData?.approaches || [];
            const newApproaches = currentApproaches.includes(approach)
                ? currentApproaches.filter(a => a !== approach)
                : [...currentApproaches, approach];

            return {
                ...prev,
                specialistMetaData: {
                    ...prev.specialistMetaData!,
                    approaches: newApproaches
                }
            };
        });
    };

    // Для форматов работы
    const toggleWorkFormat = (format: WorkFormat) => {
        setFormData(prev => {
            const currentFormats = prev.specialistMetaData?.workFormats || [];
            const newFormats = currentFormats.includes(format)
                ? currentFormats.filter(f => f !== format)
                : [...currentFormats, format];

            return {
                ...prev,
                specialistMetaData: {
                    ...prev.specialistMetaData!,
                    workFormats: newFormats
                }
            };
        });
    };

    // Для целевой аудитории
    const toggleTargetAudience = (audience: TargetAudience) => {
        setFormData(prev => {
            const currentAudiences = prev.specialistMetaData?.targetAudiences || [];
            const newAudiences = currentAudiences.includes(audience)
                ? currentAudiences.filter(a => a !== audience)
                : [...currentAudiences, audience];

            return {
                ...prev,
                specialistMetaData: {
                    ...prev.specialistMetaData!,
                    targetAudiences: newAudiences
                }
            };
        });
    };

    const handleSubmit = async () => {
        try {
            setIsSaving(true);
            setError(null);

            const token = localStorage.getItem('jwt_token');

            if (profileExists) {
                // Обновление профиля
                const updated = await profileApi.updateProfile(formData, token);
                setProfile(updated);
                setIsEditing(false);
            } else {
                // Создание профиля
                const created = await profileApi.createProfile(formData, token);
                setProfile(created);
                setProfileExists(true);
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Не удалось сохранить профиль');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Head><title>Профиль</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Загрузка...</div>
                </div>
                <Bottombar />
            </>
        );
    }

    // Режим создания/редактирования
    if (isEditing) {
        return (
            <>
                <Head><title>{profileExists ? 'Редактировать профиль' : 'Создать профиль'}</title></Head>
                <TopBar />

                <div className={styles.content}>
                    <div className={styles.quiz_title}>
                        {profileExists ? '✏️ Редактировать профиль' : '📝 Создать профиль'}
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#fee',
                            borderRadius: '8px',
                            color: '#c00',
                            marginBottom: '15px'
                        }}>
                            {error}
                        </div>
                    )}

                    {profileRequiredNotice && (
                        <div className={styles.card} style={{
                            backgroundColor: '#fef3c7',
                            borderLeft: '4px solid #f59e0b',
                            textAlign: 'left',
                            fontSize: '14px',
                            color: '#92400e'
                        }}>
                            ⚠️ Для отправки запроса специалисту необходимо сначала заполнить профиль.
                        </div>
                    )}

                    {/* Основная информация */}
                    <div className={styles.card}>
                        <div className={styles.title}>Основная информация</div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                Имя
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Ваше имя"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                Пол
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleInputChange('gender', Gender.MALE)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: formData.gender === Gender.MALE ? '2px solid #7C3AED' : '1px solid #ccc',
                                        backgroundColor: formData.gender === Gender.MALE ? '#f3e8ff' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Мужской
                                </button>
                                <button
                                    onClick={() => handleInputChange('gender', Gender.FEMALE)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: formData.gender === Gender.FEMALE ? '2px solid #7C3AED' : '1px solid #ccc',
                                        backgroundColor: formData.gender === Gender.FEMALE ? '#f3e8ff' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Женский
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                Дата рождения
                            </label>
                            <input
                                type="date"
                                value={formData.birthday}
                                onChange={(e) => handleInputChange('birthday', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                Город
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                placeholder="Ваш город"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                Телефон
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="+375 (__) ___-__-__"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Метаданные для USER */}
                    {userRole === 'USER' && (
                        <>
                            {/* Проблемные области */}
                            <div className={styles.card}>
                                <div className={styles.title}>С чем хотите работать?</div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginTop: '10px'
                                }}>
                                    {Object.values(ProblemArea).slice(0, 15).map((area) => (
                                        <button
                                            key={area}
                                            onClick={() => toggleUserProblemArea(area)}
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: '20px',
                                                border: formData.userMetaData?.problemAreas?.includes(area)
                                                    ? '2px solid #7C3AED'
                                                    : '1px solid #ccc',
                                                backgroundColor: formData.userMetaData?.problemAreas?.includes(area)
                                                    ? '#7C3AED'
                                                    : 'white',
                                                color: formData.userMetaData?.problemAreas?.includes(area)
                                                    ? 'white'
                                                    : '#333',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {getProblemAreaLabel(area)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Цели и ситуация для USER */}
                            <div className={styles.card}>
                                <div className={styles.title}>Дополнительно</div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                        Цели терапии
                                    </label>
                                    <textarea
                                        value={formData.userMetaData?.therapyGoals || ''}
                                        onChange={(e) => handleUserMetaDataChange('therapyGoals', e.target.value)}
                                        placeholder="Что хотите получить от терапии?"
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                        Текущая ситуация
                                    </label>
                                    <textarea
                                        value={formData.userMetaData?.currentSituation || ''}
                                        onChange={(e) => handleUserMetaDataChange('currentSituation', e.target.value)}
                                        placeholder="Расскажите о вашей текущей ситуации"
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.userMetaData?.inCrisis || false}
                                            onChange={(e) => handleUserMetaDataChange('inCrisis', e.target.checked)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span>Нахожусь в кризисной ситуации</span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Метаданные для SPECIALIST */}
                    {userRole === 'SPECIALIST' && (
                        <>
                            {/* Образование и опыт */}
                            <div className={styles.card}>
                                <div className={styles.title}>Образование и опыт</div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                        Образование
                                    </label>
                                    <textarea
                                        value={formData.specialistMetaData?.education || ''}
                                        onChange={(e) => handleSpecialistMetaDataChange('education', e.target.value)}
                                        placeholder="Укажите ваше образование"
                                        rows={2}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                        Специализация
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.specialistMetaData?.specialization || ''}
                                        onChange={(e) => handleSpecialistMetaDataChange('specialization', e.target.value)}
                                        placeholder="Клинический психолог, психотерапевт..."
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                        Опыт работы (лет)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.specialistMetaData?.yearsOfExperience || 0}
                                        onChange={(e) => handleSpecialistMetaDataChange('yearsOfExperience', parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Подходы терапии */}
                            <div className={styles.card}>
                                <div className={styles.title}>Подходы в терапии</div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginTop: '10px'
                                }}>
                                    {Object.values(TherapyApproach).map((approach) => (
                                        <button
                                            key={approach}
                                            onClick={() => toggleApproach(approach)}
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: '20px',
                                                border: formData.specialistMetaData?.approaches?.includes(approach)
                                                    ? '2px solid #7C3AED'
                                                    : '1px solid #ccc',
                                                backgroundColor: formData.specialistMetaData?.approaches?.includes(approach)
                                                    ? '#7C3AED'
                                                    : 'white',
                                                color: formData.specialistMetaData?.approaches?.includes(approach)
                                                    ? 'white'
                                                    : '#333',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {getTherapyApproachLabel(approach)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Проблемные области для специалиста */}
                            <div className={styles.card}>
                                <div className={styles.title}>С чем работаете?</div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginTop: '10px'
                                }}>
                                    {Object.values(ProblemArea).slice(0, 15).map((area) => (
                                        <button
                                            key={area}
                                            onClick={() => toggleSpecialistProblemArea(area)}
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: '20px',
                                                border: formData.specialistMetaData?.problemAreas?.includes(area)
                                                    ? '2px solid #7C3AED'
                                                    : '1px solid #ccc',
                                                backgroundColor: formData.specialistMetaData?.problemAreas?.includes(area)
                                                    ? '#7C3AED'
                                                    : 'white',
                                                color: formData.specialistMetaData?.problemAreas?.includes(area)
                                                    ? 'white'
                                                    : '#333',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {getProblemAreaLabel(area)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Форматы работы */}
                            <div className={styles.card}>
                                <div className={styles.title}>Форматы работы</div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginTop: '10px'
                                }}>
                                    {Object.values(WorkFormat).map((format) => (
                                        <button
                                            key={format}
                                            onClick={() => toggleWorkFormat(format)}
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: '20px',
                                                border: formData.specialistMetaData?.workFormats?.includes(format)
                                                    ? '2px solid #7C3AED'
                                                    : '1px solid #ccc',
                                                backgroundColor: formData.specialistMetaData?.workFormats?.includes(format)
                                                    ? '#7C3AED'
                                                    : 'white',
                                                color: formData.specialistMetaData?.workFormats?.includes(format)
                                                    ? 'white'
                                                    : '#333',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {getWorkFormatLabel(format)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Целевая аудитория */}
                            <div className={styles.card}>
                                <div className={styles.title}>Целевая аудитория</div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginTop: '10px'
                                }}>
                                    {Object.values(TargetAudience).map((audience) => (
                                        <button
                                            key={audience}
                                            onClick={() => toggleTargetAudience(audience)}
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: '20px',
                                                border: formData.specialistMetaData?.targetAudiences?.includes(audience)
                                                    ? '2px solid #7C3AED'
                                                    : '1px solid #ccc',
                                                backgroundColor: formData.specialistMetaData?.targetAudiences?.includes(audience)
                                                    ? '#7C3AED'
                                                    : 'white',
                                                color: formData.specialistMetaData?.targetAudiences?.includes(audience)
                                                    ? 'white'
                                                    : '#333',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {getTargetAudienceLabel(audience)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Условия работы */}
                            <div className={styles.card}>
                                <div className={styles.title}>Условия работы</div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                        Стоимость сессии (₽)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.specialistMetaData?.sessionPrice || 0}
                                        onChange={(e) => handleSpecialistMetaDataChange('sessionPrice', parseInt(e.target.value))}
                                        placeholder="5000"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '6px' }}>
                                        Длительность сессии (мин)
                                    </label>
                                    <input
                                        type="number"
                                        min="30"
                                        step="15"
                                        value={formData.specialistMetaData?.sessionDuration || 60}
                                        onChange={(e) => handleSpecialistMetaDataChange('sessionDuration', parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.specialistMetaData?.providesFreeConsultation || false}
                                            onChange={(e) => handleSpecialistMetaDataChange('providesFreeConsultation', e.target.checked)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span>Провожу бесплатные консультации</span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Кнопки */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        <button
                            className={styles.btn}
                            onClick={handleSubmit}
                            disabled={isSaving}
                            style={{
                                flex: 1,
                                opacity: isSaving ? 0.6 : 1
                            }}
                        >
                            {isSaving ? 'Сохранение...' : profileExists ? 'Сохранить изменения' : 'Создать профиль'}
                        </button>

                        {profileExists && (
                            <button
                                className={styles.btn}
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                style={{
                                    flex: 1,
                                    background: '#f3f4f6',
                                    color: '#374151'
                                }}
                            >
                                Отмена
                            </button>
                        )}
                    </div>
                </div>

                <Bottombar />
            </>
        );
    }

    // Режим просмотра профиля
    return (
        <>
            <Head><title>Профиль</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    👤 Мой профиль
                </div>

                {profile && (
                    <>
                        <div className={styles.card}>
                            <div className={styles.title}>Основная информация</div>
                            <div style={{ marginTop: '15px', fontSize: '14px', lineHeight: '1.8' }}>
                                <div><strong>Имя:</strong> {profile.name}</div>
                                <div><strong>Пол:</strong> {profile.gender === Gender.MALE ? 'Мужской' : 'Женский'}</div>
                                <div><strong>Дата рождения:</strong> {new Date(profile.birthday).toLocaleDateString('ru-RU')}</div>
                                <div><strong>Город:</strong> {profile.city}</div>
                                <div><strong>Телефон:</strong> {profile.phone}</div>
                            </div>
                        </div>

                        {/* Метаданные USER - просмотр */}
                        {userRole === 'USER' && profile?.userMetaData && (
                            <>
                                {profile.userMetaData.problemAreas && profile.userMetaData.problemAreas.length > 0 && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Проблемные области</div>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            marginTop: '10px'
                                        }}>
                                            {profile.userMetaData.problemAreas.map((area) => (
                                                <span
                                                    key={area}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '16px',
                                                        backgroundColor: '#f3e8ff',
                                                        color: '#7C3AED',
                                                        fontSize: '13px'
                                                    }}
                                                >
                            {getProblemAreaLabel(area)}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {profile.userMetaData.therapyGoals && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Цели терапии</div>
                                        <div style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6' }}>
                                            {profile.userMetaData.therapyGoals}
                                        </div>
                                    </div>
                                )}

                                {profile.userMetaData.currentSituation && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Текущая ситуация</div>
                                        <div style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.6' }}>
                                            {profile.userMetaData.currentSituation}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Метаданные SPECIALIST - просмотр */}
                        {userRole === 'SPECIALIST' && profile?.specialistMetaData && (
                            <>
                                {/* Образование и опыт */}
                                <div className={styles.card}>
                                    <div className={styles.title}>Образование и опыт</div>
                                    <div style={{ marginTop: '15px', fontSize: '14px', lineHeight: '1.8' }}>
                                        {profile.specialistMetaData.education && (
                                            <div><strong>Образование:</strong> {profile.specialistMetaData.education}</div>
                                        )}
                                        {profile.specialistMetaData.specialization && (
                                            <div><strong>Специализация:</strong> {profile.specialistMetaData.specialization}</div>
                                        )}
                                        {profile.specialistMetaData.yearsOfExperience && (
                                            <div><strong>Опыт работы:</strong> {profile.specialistMetaData.yearsOfExperience} лет</div>
                                        )}
                                        {profile.specialistMetaData.rating !== undefined && (
                                            <div><strong>Рейтинг:</strong> ⭐ {profile.specialistMetaData.rating?.toFixed(1)}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Подходы */}
                                {profile.specialistMetaData.approaches && profile.specialistMetaData.approaches.length > 0 && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Подходы в терапии</div>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            marginTop: '10px'
                                        }}>
                                            {Array.from(profile.specialistMetaData.approaches).map((approach) => (
                                                <span
                                                    key={approach}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '16px',
                                                        backgroundColor: '#f3e8ff',
                                                        color: '#7C3AED',
                                                        fontSize: '13px'
                                                    }}
                                                >
                            {getTherapyApproachLabel(approach)}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Проблемные области */}
                                {profile.specialistMetaData.problemAreas && profile.specialistMetaData.problemAreas.length > 0 && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>С чем работаю</div>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            marginTop: '10px'
                                        }}>
                                            {Array.from(profile.specialistMetaData.problemAreas).map((area) => (
                                                <span
                                                    key={area}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '16px',
                                                        backgroundColor: '#dff0d8',
                                                        color: '#3c763d',
                                                        fontSize: '13px'
                                                    }}
                                                >
                            {getProblemAreaLabel(area)}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Форматы работы */}
                                {profile.specialistMetaData.workFormats && profile.specialistMetaData.workFormats.length > 0 && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Форматы работы</div>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            marginTop: '10px'
                                        }}>
                                            {Array.from(profile.specialistMetaData.workFormats).map((format) => (
                                                <span
                                                    key={format}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '16px',
                                                        backgroundColor: '#d9edf7',
                                                        color: '#31708f',
                                                        fontSize: '13px'
                                                    }}
                                                >
                            {getWorkFormatLabel(format)}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Целевая аудитория */}
                                {profile.specialistMetaData.targetAudiences && profile.specialistMetaData.targetAudiences.length > 0 && (
                                    <div className={styles.card}>
                                        <div className={styles.title}>Целевая аудитория</div>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            marginTop: '10px'
                                        }}>
                                            {Array.from(profile.specialistMetaData.targetAudiences).map((audience) => (
                                                <span
                                                    key={audience}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '16px',
                                                        backgroundColor: '#fcf8e3',
                                                        color: '#8a6d3b',
                                                        fontSize: '13px'
                                                    }}
                                                >
                            {getTargetAudienceLabel(audience)}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Условия работы */}
                                <div className={styles.card}>
                                    <div className={styles.title}>Условия работы</div>
                                    <div style={{ marginTop: '15px', fontSize: '14px', lineHeight: '1.8' }}>
                                        <div><strong>Стоимость сессии:</strong> {profile.specialistMetaData.sessionPrice} ₽</div>
                                        <div><strong>Длительность:</strong> {profile.specialistMetaData.sessionDuration} мин</div>
                                        <div>
                                            <strong>Бесплатная консультация:</strong>{' '}
                                            {profile.specialistMetaData.providesFreeConsultation ? '✅ Да' : '❌ Нет'}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            className={styles.btn}
                            onClick={() => setIsEditing(true)}
                            style={{
                                width: '320px',
                                display: 'block',
                                margin: '20px auto 30px'
                            }}
                        >
                            ✏️ Редактировать профиль
                        </button>
                    </>
                )}
            </div>

            <Bottombar />
        </>
    );
}
