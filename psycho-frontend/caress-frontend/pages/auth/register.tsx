import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '@/styles/main.module.css';
import { authApi, Role } from '@/services/authApi';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<Role>(Role.USER);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Проверка: если уже авторизован, редирект на главную
    useEffect(() => {
        if (authApi.isAuthenticated()) {
            router.push('/home');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Валидация
        if (!email || !password || !confirmPassword) {
            setError('Заполните все поля');
            return;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (password.length < 6) {
            setError('Пароль должен быть минимум 6 символов');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.register({ email, password, role });

            // Проверка роли и редирект на соответствующую страницу
            if (response.role === 'SPECIALIST') {
                router.push('/specialist/home');
            } else if (response.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/home');
            }
        } catch (err: any) {
            console.error('Register error:', err);
            setError(err.message || 'Ошибка регистрации');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Регистрация | Psycho App</title>
            </Head>

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb',
                padding: '20px'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '40px 30px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}>
                    {/* Логотип/Заголовок */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '30px'
                    }}>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: '#7C3AED',
                            marginBottom: '8px'
                        }}>
                            🧠 Psycho App
                        </h1>
                        <p style={{
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            Создайте новый аккаунт
                        </p>
                    </div>

                    {/* Форма */}
                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        {/* Роль */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Роль
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setRole(Role.USER)}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: role === Role.USER ? '2px solid #7C3AED' : '1px solid #d1d5db',
                                        backgroundColor: role === Role.USER ? '#f3e8ff' : 'white',
                                        color: role === Role.USER ? '#7C3AED' : '#6b7280',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: role === Role.USER ? '600' : '400',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Пользователь
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole(Role.SPECIALIST)}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: role === Role.SPECIALIST ? '2px solid #7C3AED' : '1px solid #d1d5db',
                                        backgroundColor: role === Role.SPECIALIST ? '#f3e8ff' : 'white',
                                        color: role === Role.SPECIALIST ? '#7C3AED' : '#6b7280',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: role === Role.SPECIALIST ? '600' : '400',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Специалист
                                </button>
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Пароль
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Минимум 6 символов"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Подтвердите пароль
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Повторите пароль"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        {/* Ошибка */}
                        {error && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#fee2e2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                color: '#dc2626',
                                fontSize: '14px',
                                marginBottom: '20px'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Кнопка регистрации */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: isLoading ? '#9ca3af' : '#7C3AED',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                                marginBottom: '16px'
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) e.currentTarget.style.backgroundColor = '#6d28d9';
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) e.currentTarget.style.backgroundColor = '#7C3AED';
                            }}
                        >
                            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                    </form>

                    {/* Ссылка на вход */}
                    <div style={{
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#6b7280'
                    }}>
                        Уже есть аккаунт?{' '}
                        <Link
                            href="/auth/login"
                            style={{
                                color: '#7C3AED',
                                fontWeight: '600',
                                textDecoration: 'none'
                            }}
                        >
                            Войти
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
