import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { Users, Calendar, ClipboardList } from 'lucide-react';
import {authApi} from "@/services/authApi";

export default function SpecialistHome() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await authApi.getCurrentUser();

                if (user == null) {
                    throw 'User is null';
                }

                if (user.role !== 'SPECIALIST') {
                    console.log('Not a specialist, redirecting...');
                    router.push('/home');
                    return;
                }

                setUserEmail(user.email);
                setIsLoading(false);
            } catch (error) {
                console.error('Not authenticated:', error);
                router.push('/auth/login');
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <>
                <Head><title>Главная | Специалист</title></Head>
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
            <Head><title>Главная | Специалист</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    👨‍⚕️ Кабинет специалиста
                </div>

                <div className={styles.card}>
                    <div className={styles.title}>Добро пожаловать!</div>
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                        {userEmail}
                    </p>
                </div>

                {/* Мои пациенты */}
                <div
                    className={styles.card}
                    onClick={() => router.push('/specialist/patients')}
                    style={{ cursor: 'pointer' }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <Users size={40} color="#7C3AED" />
                        <div>
                            <div className={styles.title} style={{ marginBottom: '5px' }}>
                                Мои пациенты
                            </div>
                        </div>
                    </div>
                </div>

                {/* Заглушки для будущего */}
                <div className={styles.card} style={{ opacity: 0.5 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <Calendar size={40} color="#999" />
                        <div>
                            <div className={styles.title} style={{ marginBottom: '5px' }}>
                                Расписание
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Bottombar />
        </>
    );
}
