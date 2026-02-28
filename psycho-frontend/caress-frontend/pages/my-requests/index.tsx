import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { therapyRequestApi, TherapyRequest, RequestStatus } from '@/services/therapyRequestApi';
import { Clock, Send, XCircle, CheckCircle, ChevronRight } from 'lucide-react';
import {checkAuth} from "@/utils/authUtils";

const STATUS_CONFIG: Record<RequestStatus, { label: string; bgColor: string; color: string; icon: React.ReactNode }> = {
    [RequestStatus.PENDING]: {
        label: 'Ожидает ответа',
        bgColor: '#fef3c7',
        color: '#d97706',
        icon: <Clock size={13} />
    },
    [RequestStatus.ACCEPTED]: {
        label: 'Принят',
        bgColor: '#dcfce7',
        color: '#16a34a',
        icon: <CheckCircle size={13} />
    },
    [RequestStatus.REJECTED]: {
        label: 'Отклонён',
        bgColor: '#fee2e2',
        color: '#dc2626',
        icon: <XCircle size={13} />
    },
    [RequestStatus.CANCELLED]: {
        label: 'Отменён',
        bgColor: '#f3f4f6',
        color: '#6b7280',
        icon: <XCircle size={13} />
    },
};

export default function MyRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<TherapyRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    useEffect(() => {
        const init = async () => {
            const isAuthed = await checkAuth(router, 'USER');
            if (!isAuthed) return;  // ← данные не грузим если не авторизован

            await loadRequests();
        };

        void init();
    }, [router]);

    const loadRequests = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('jwt_token');
            const data = await therapyRequestApi.getMyRequests(token);
            setRequests(data);
        } catch (err) {
            console.error('Error loading requests:', err);
            setError('Не удалось загрузить запросы');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleCancel = async (requestId: number) => {
        if (!confirm('Вы уверены, что хотите отменить этот запрос?')) return;
        try {
            setCancellingId(requestId);
            const token = localStorage.getItem('jwt_token');
            await therapyRequestApi.cancelRequest(requestId, token);
            // Обновляем статус в списке без перезагрузки
            setRequests(prev =>
                prev.map(r => r.id === requestId ? { ...r, status: RequestStatus.CANCELLED } : r)
            );
        } catch (err: any) {
            alert(err.message || 'Не удалось отменить запрос');
        } finally {
            setCancellingId(null);
        }
    };

    const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);
    const otherRequests = requests.filter(r => r.status !== RequestStatus.PENDING);

    if (isLoading) {
        return (
            <>
                <Head><title>Мои запросы</title></Head>
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
            <Head><title>Мои запросы</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>📤 Мои запросы к специалистам</div>

                {error && (
                    <div className={styles.card} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                        {error}
                    </div>
                )}

                {requests.length === 0 && (
                    <div className={styles.card}>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                            <div style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
                                У вас пока нет запросов к специалистам
                            </div>
                            <button
                                className={styles.btn}
                                onClick={() => router.push('/search')}
                            >
                                Найти специалиста
                            </button>
                        </div>
                    </div>
                )}

                {/* Активные запросы */}
                {pendingRequests.length > 0 && (
                    <>
                        <div style={{
                            fontSize: '15px', fontWeight: 'bold', color: '#374151',
                            padding: '0 20px', marginBottom: '10px',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            🟡 Ожидают ответа
                            <span style={{
                                backgroundColor: '#f59e0b', color: 'white',
                                borderRadius: '12px', padding: '2px 8px',
                                fontSize: '12px', fontWeight: 'bold'
                            }}>
                                {pendingRequests.length}
                            </span>
                        </div>

                        {pendingRequests.map((request) => {
                            const config = STATUS_CONFIG[request.status];
                            const isCancelling = cancellingId === request.id;
                            return (
                                <div key={request.id} className={styles.card}>
                                    {/* Шапка */}
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', marginBottom: '12px'
                                    }}>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '4px 12px', borderRadius: '12px',
                                            fontSize: '12px', fontWeight: 'bold',
                                            backgroundColor: config.bgColor, color: config.color
                                        }}>
                                            {config.icon} {config.label}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                            {new Date(request.createdAt).toLocaleDateString('ru-RU', {
                                                day: 'numeric', month: 'long',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    {/* Сообщение */}
                                    {request.message && (
                                        <div style={{
                                            padding: '10px 12px',
                                            backgroundColor: '#f9fafb', borderRadius: '8px',
                                            fontSize: '14px', color: '#374151',
                                            textAlign: 'left', lineHeight: '1.5',
                                            marginBottom: '12px'
                                        }}>
                                            <Send size={13} style={{ display: 'inline', marginRight: '6px', color: '#7C3AED' }} />
                                            {request.message}
                                        </div>
                                    )}

                                    {/* Кнопки */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => router.push(`/therapist/${request.specialistId}`)}
                                            style={{
                                                flex: 1, padding: '9px',
                                                borderRadius: '8px', border: '1px solid #7C3AED',
                                                backgroundColor: 'white', color: '#7C3AED',
                                                cursor: 'pointer', fontSize: '13px',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', gap: '6px'
                                            }}
                                        >
                                            <ChevronRight size={14} />
                                            Профиль специалиста
                                        </button>
                                        <button
                                            onClick={() => handleCancel(request.id)}
                                            disabled={isCancelling}
                                            style={{
                                                flex: 1, padding: '9px',
                                                borderRadius: '8px', border: 'none',
                                                backgroundColor: isCancelling ? '#9ca3af' : '#ef4444',
                                                color: 'white',
                                                cursor: isCancelling ? 'not-allowed' : 'pointer',
                                                fontSize: '13px',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', gap: '6px',
                                                opacity: isCancelling ? 0.7 : 1
                                            }}
                                        >
                                            <XCircle size={14} />
                                            {isCancelling ? 'Отмена...' : 'Отозвать'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}

                {/* История запросов */}
                {otherRequests.length > 0 && (
                    <>
                        <div style={{
                            fontSize: '15px', fontWeight: 'bold', color: '#374151',
                            padding: '10px 20px 10px', marginTop: '10px'
                        }}>
                            🗂️ История запросов
                        </div>

                        {otherRequests.map((request) => {
                            const config = STATUS_CONFIG[request.status];
                            return (
                                <div
                                    key={request.id}
                                    className={styles.card}
                                    style={{ opacity: 0.85 }}
                                >
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', marginBottom: '10px'
                                    }}>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '4px 12px', borderRadius: '12px',
                                            fontSize: '12px', fontWeight: 'bold',
                                            backgroundColor: config.bgColor, color: config.color
                                        }}>
                                            {config.icon} {config.label}
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                            {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>

                                    {request.message && (
                                        <div style={{
                                            fontSize: '13px', color: '#6b7280',
                                            textAlign: 'left', lineHeight: '1.5',
                                            marginBottom: '10px'
                                        }}>
                                            {request.message}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => router.push(`/therapist/${request.specialistId}`)}
                                        style={{
                                            width: '100%', padding: '8px',
                                            borderRadius: '8px', border: '1px solid #d1d5db',
                                            backgroundColor: 'white', color: '#374151',
                                            cursor: 'pointer', fontSize: '13px',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        <ChevronRight size={13} />
                                        Профиль специалиста
                                    </button>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            <Bottombar />
        </>
    );
}
