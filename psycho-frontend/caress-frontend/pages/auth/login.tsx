import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '@/styles/main.module.css';
import { authApi } from '@/services/authApi';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        if (!email || !password) {
            setError('Заполните все поля');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.login({ email, password });
            // Проверка роли и редирект на соответствующую страницу
            if (response.role === 'SPECIALIST') {
                router.push('/specialist/home');
            } else if (response.role === 'ADMIN') {
                router.push('/admin/users');
            } else {
                // USER или другая роль
                router.push('/home');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Ошибка входа');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Вход | Psycho App</title>
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
                            Войдите в свой аккаунт
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

                        {/* Password */}
                        <div style={{ marginBottom: '24px' }}>
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
                                placeholder="••••••••"
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

                        {/* Кнопка входа */}
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
                            {isLoading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    {/* Ссылка на регистрацию */}
                    <div style={{
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#6b7280'
                    }}>
                        Нет аккаунта?{' '}
                        <Link
                            href="/auth/register"
                            style={{
                                color: '#7C3AED',
                                fontWeight: '600',
                                textDecoration: 'none'
                            }}
                        >
                            Зарегистрироваться
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
