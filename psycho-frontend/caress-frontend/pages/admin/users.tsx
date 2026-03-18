import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { adminApi, AdminUser } from '@/services/adminApi';
import { checkAuth } from '@/utils/authUtils';

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const size = 10;
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const isAuthed = await checkAuth(router, 'ADMIN');
            if (!isAuthed) return;
            await loadUsers(0);
        };
        void init();
    }, [router]);

    const loadUsers = async (pageNum: number) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('jwt_token');
            const data = await adminApi.searchUsers(pageNum, size, token);
            setUsers(data);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (userId: number) => {
        if (!newPassword.trim()) return;
        try {
            setIsSaving(true);
            const token = localStorage.getItem('jwt_token');
            await adminApi.updateUserPassword(userId, newPassword, token);
            setSuccessMessage(`Пароль пользователя #${userId} обновлён`);
            setEditingUserId(null);
            setNewPassword('');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        router.push('/auth/login');
    };

    return (
        <>
            <Head><title>Администрирование | Пользователи</title></Head>
            <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0 }}>Пользователи системы</h1>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px 18px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Выйти
                    </button>
                </div>

                {error && <div style={{ color: 'red' }}>{error}</div>}
                {successMessage && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#d1fae5',
                        border: '1px solid #6ee7b7',
                        borderRadius: '8px',
                        color: '#065f46',
                        fontSize: '14px',
                        marginBottom: '16px'
                    }}>
                        ✅ {successMessage}
                    </div>
                )}
                {isLoading ? <div>Загрузка...</div> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <th style={th}>ID</th>
                            <th style={th}>Email</th>
                            <th style={th}>Роль</th>
                            <th style={th}>Дата регистрации</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={td}>{user.id}</td>
                                <td style={td}>{user.email}</td>
                                <td style={td}>{user.role}</td>
                                <td style={td}>
                                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                                </td>
                                <td style={td}>
                                    {editingUserId === user.id ? (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Новый пароль"
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #d1d5db',
                                                    fontSize: '13px',
                                                    width: '150px'
                                                }}
                                            />
                                            <button
                                                onClick={() => handleUpdatePassword(user.id)}
                                                disabled={isSaving || !newPassword.trim()}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#7C3AED',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                {isSaving ? '...' : 'Сохранить'}
                                            </button>
                                            <button
                                                onClick={() => { setEditingUserId(null); setNewPassword(''); }}
                                                style={{
                                                    padding: '6px 10px',
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#374151',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setEditingUserId(user.id); setNewPassword(''); }}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#f3f4f6',
                                                color: '#374151',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '13px'
                                            }}
                                        >
                                            Сменить пароль
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {/* Пагинация */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={() => loadUsers(page - 1)} disabled={page === 0}>← Назад</button>
                    <span>Страница {page + 1}</span>
                    <button onClick={() => loadUsers(page + 1)} disabled={users.length < size}>Вперёд →</button>
                </div>
            </div>
        </>
    );
}

const th = { padding: '12px', textAlign: 'left' as const, fontWeight: '600' };
const td = { padding: '12px', fontSize: '14px' };
