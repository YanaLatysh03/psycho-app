import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/main.module.css';
import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import { therapyRequestApi, TherapyRequest, RequestStatus } from '@/services/therapyRequestApi';
import { CheckCircle, XCircle, User, Clock, MessageSquare } from 'lucide-react';
import {authApi} from "@/services/authApi";

export default function SpecialistRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<TherapyRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const userRole = await authApi.getUserRole();
                if (userRole !== 'SPECIALIST') {
                    router.push('/home');
                    return;
                }

                setIsLoading(true);
                const token = localStorage.getItem('jwt_token');
                const data = await therapyRequestApi.getIncomingRequests(token);
                setRequests(data);
            } catch (err) {
                console.error('Error loading requests:', err);
                setError('Не удалось загрузить запросы');
            } finally {
                setIsLoading(false);
            }
        };

        loadRequests();
    }, [router]);

    const handleAccept = async (requestId: number) => {
        try {
            setProcessingId(requestId);
            const token = localStorage.getItem('jwt_token');
            const updated = await therapyRequestApi.acceptRequest(requestId, token);

            // Обновляем статус в списке
            setRequests(prev =>
                prev.map(r => r.id === requestId ? { ...r, status: updated.status } : r)
            );
        } catch (err: any) {
            console.error('Error accepting request:', err);
            alert(err.message || 'Не удалось одобрить запрос');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            setProcessingId(requestId);
            const token = localStorage.getItem('jwt_token');
            const updated = await therapyRequestApi.rejectRequest(requestId, token);

            // Обновляем статус в списке
            setRequests(prev =>
                prev.map(r => r.id === requestId ? { ...r, status: updated.status } : r)
            );
        } catch (err: any) {
            console.error('Error rejecting request:', err);
            alert(err.message || 'Не удалось отклонить запрос');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case RequestStatus.PENDING:
                return {
                    label: 'Ожидает',
                    backgroundColor: '#fef3c7',
                    color: '#d97706'
                };
            case RequestStatus.ACCEPTED:
                return {
                    label: 'Принят',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a'
                };
            case RequestStatus.REJECTED:
                return {
                    label: 'Отклонён',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626'
                };
            case RequestStatus.CANCELLED:
                return {
                    label: 'Отменён',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280'
                };
        }
    };

    // Разделяем на PENDING и остальные
    const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);
    const otherRequests = requests.filter(r => r.status !== RequestStatus.PENDING);

    if (isLoading) {
        return (
            <>
                <Head><title>Запросы на связь</title></Head>
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
            <Head><title>Запросы на связь</title></Head>
            <TopBar />

            <div className={styles.content}>
                <div className={styles.quiz_title}>
                    🔔 Запросы на установление связи
                </div>

                {error && (
                    <div className={styles.card} style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626'
                    }}>
                        {error}
                    </div>
                )}

                {/* Двухколоночный макет */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    padding: '0 20px',
                    alignItems: 'start'
                }}>

                    {/* Левая колонка — Новые запросы */}
                    <div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#374151',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🟡 Ожидают ответа
                            {pendingRequests.length > 0 && (
                                <span style={{
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    borderRadius: '12px',
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                    {pendingRequests.length}
                </span>
                            )}
                        </div>

                        {pendingRequests.length === 0 ? (
                            <div className={styles.card}>
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        Новых запросов нет
                                    </div>
                                </div>
                            </div>
                        ) : (
                            pendingRequests.map((request) => {
                                const badge = getStatusBadge(request.status);
                                const isProcessing = processingId === request.id;
                                return (
                                    <div key={request.id} className={styles.card}>
                                        {/* Шапка */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{
                                padding: '4px 10px', borderRadius: '12px',
                                fontSize: '11px', fontWeight: 'bold',
                                backgroundColor: badge.backgroundColor, color: badge.color
                            }}>
                                {badge.label}
                            </span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} />
                                                {new Date(request.createdAt).toLocaleDateString('ru-RU', {
                                                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                                })}
                            </span>
                                        </div>

                                        {/* Сообщение */}
                                        {request.message && (
                                            <div style={{
                                                display: 'flex', gap: '8px', alignItems: 'flex-start',
                                                padding: '10px', backgroundColor: '#f9fafb',
                                                borderRadius: '8px', marginBottom: '12px', textAlign: 'left'
                                            }}>
                                                <MessageSquare size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                                                    {request.message}
                                                </p>
                                            </div>
                                        )}

                                        {/* Кнопки */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <button
                                                onClick={() => router.push(`/specialist/patient/${request.userId}`)}
                                                disabled={isProcessing}
                                                style={{
                                                    width: '100%', padding: '9px',
                                                    borderRadius: '8px', border: '1px solid #7C3AED',
                                                    backgroundColor: 'white', color: '#7C3AED',
                                                    cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                }}
                                            >
                                                <User size={14} /> Подробнее
                                            </button>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleAccept(request.id)}
                                                    disabled={isProcessing}
                                                    style={{
                                                        flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                                                        backgroundColor: isProcessing ? '#9ca3af' : '#22c55e',
                                                        color: 'white', cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                        fontSize: '13px', fontWeight: '500',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                        opacity: isProcessing ? 0.6 : 1
                                                    }}
                                                >
                                                    <CheckCircle size={14} />
                                                    {isProcessing ? '...' : 'Одобрить'}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    disabled={isProcessing}
                                                    style={{
                                                        flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                                                        backgroundColor: isProcessing ? '#9ca3af' : '#ef4444',
                                                        color: 'white', cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                        fontSize: '13px', fontWeight: '500',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                        opacity: isProcessing ? 0.6 : 1
                                                    }}
                                                >
                                                    <XCircle size={14} />
                                                    {isProcessing ? '...' : 'Отклонить'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Правая колонка — История */}
                    <div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#374151',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🗂️ История запросов
                            {otherRequests.length > 0 && (
                                <span style={{
                                    backgroundColor: '#6b7280',
                                    color: 'white',
                                    borderRadius: '12px',
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                    {otherRequests.length}
                </span>
                            )}
                        </div>

                        {otherRequests.length === 0 ? (
                            <div className={styles.card}>
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗂️</div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        История пуста
                                    </div>
                                </div>
                            </div>
                        ) : (
                            otherRequests.map((request) => {
                                const badge = getStatusBadge(request.status);
                                return (
                                    <div key={request.id} className={styles.card} style={{ opacity: 0.85 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{
                                padding: '4px 10px', borderRadius: '12px',
                                fontSize: '11px', fontWeight: 'bold',
                                backgroundColor: badge.backgroundColor, color: badge.color
                            }}>
                                {badge.label}
                            </span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                                        </div>

                                        {request.message && (
                                            <div style={{
                                                fontSize: '13px', color: '#6b7280',
                                                textAlign: 'left', marginBottom: '10px',
                                                lineHeight: '1.5'
                                            }}>
                                                {request.message}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => router.push(`/specialist/patient/${request.userId}`)}
                                            style={{
                                                width: '100%', padding: '8px',
                                                borderRadius: '8px', border: '1px solid #d1d5db',
                                                backgroundColor: 'white', color: '#374151',
                                                cursor: 'pointer', fontSize: '13px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                            }}
                                        >
                                            <User size={13} /> Профиль пользователя
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                </div>
            </div>

            <Bottombar />
        </>
    );
}
