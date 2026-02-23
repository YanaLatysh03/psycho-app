import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { specialistApi } from '@/services/specialistApi';
import { ProfileResponse, Gender } from '@/services/profileApi';
import { User, MapPin, Phone } from 'lucide-react';
import {authApi} from "@/services/authApi";
import { getProblemAreaLabel } from '@/utils/problemAreaUtils';

export default function PatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<ProfileResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const user = await authApi.getCurrentUser();

                if (user == null) {
                    throw 'User is null';
                }

                if (user.role !== 'SPECIALIST') {
                    router.push('/home');
                    return;
                }

                setIsLoading(true);
                const token = localStorage.getItem('jwt_token');
                const patientsData = await specialistApi.getMyPatients(token);
                setPatients(patientsData);
            } catch (err) {
                console.error('Error loading patients:', err);
                setError('Не удалось загрузить список пациентов');
            } finally {
                setIsLoading(false);
            }
        };

        loadPatients();
    }, [router]);

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

    if (isLoading) {
        return (
            <>
                <Head><title>Мои пациенты</title></Head>
                <TopBar />
                <div className={styles.content}>
                    <div className={styles.quiz_title}>Загрузка...</div>
                </div>
                <Bottombar />
            </>
        );
    }

    return (
        <>
            <Head><title>Мои пациенты</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    👥 Мои пациенты
                </div>

                {error && (
                    <div className={styles.card} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                        {error}
                    </div>
                )}

                {patients.length === 0 ? (
                    <div className={styles.card}>
                        <p style={{ color: '#666', textAlign: 'center' }}>
                            У вас пока нет пациентов
                        </p>
                    </div>
                ) : (
                    patients.map((patient) => (
                        <div
                            key={patient.userId}
                            className={styles.card}
                            onClick={() => router.push(`/specialist/patient/${patient.userId}`)}
                            style={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0px 6px 20px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0px 0px 4px rgba(0, 0, 0, 0.4)';
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                alignItems: 'center'
                            }}>
                                {/* Аватар */}
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f3e8ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <User size={30} color="#7C3AED" />
                                </div>

                                {/* Информация */}
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#1f2937',
                                        marginBottom: '6px'
                                    }}>
                                        {patient.name}
                                    </div>

                                    <div style={{
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}>
                                        <span>
                                            {patient.gender === Gender.MALE ? '👨' : '👩'} {calculateAge(patient.birthday)} лет
                                        </span>
                                        {patient.city && (
                                            <span>
                                                <MapPin size={14} style={{ display: 'inline', marginBottom: '2px' }} /> {patient.city}
                                            </span>
                                        )}
                                        {patient.phone && (
                                            <span>
                                                <Phone size={14} style={{ display: 'inline', marginBottom: '2px' }} /> {patient.phone}
                                            </span>
                                        )}
                                    </div>

                                    {/* Проблемные области (если есть) */}
                                    {patient.userMetaData?.problemAreas && patient.userMetaData.problemAreas.length > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '6px',
                                            marginTop: '8px'
                                        }}>
                                            {Array.from(patient.userMetaData.problemAreas).slice(0, 3).map((area) => (
                                                <span
                                                    key={area}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        backgroundColor: '#dbeafe',
                                                        color: '#1e40af',
                                                        fontSize: '11px'
                                                    }}
                                                >
                                                    {getProblemAreaLabel(area)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                <button
                    className={styles.btn}
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push('/specialist/home');
                    }}
                    style={{
                        width: '320px',
                        display: 'block',
                        margin: '20px auto 30px',
                        background: '#f3f4f6',
                        color: '#374151'
                    }}
                >
                    ← Назад
                </button>
            </div>

            <Bottombar />
        </>
    );
}
