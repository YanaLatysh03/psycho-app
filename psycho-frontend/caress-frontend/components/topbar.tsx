import { useEffect, useState, useRef } from 'react';
import styles from '@/styles/TopBar.module.css';
import Link from 'next/link';
import {
	LucideUser,
	Settings,
	LogOut,
	ClipboardList,
	Activity,
	BarChart3,
	TrendingUp,
	Calendar,
	Send, Heart
} from 'lucide-react';
import { useRouter } from 'next/router';
import {authApi, User} from "@/services/authApi";

export default function TopBar() {

	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const [isStatsSubmenuOpen, setIsStatsSubmenuOpen] = useState(false);
	const [userRole, setUserRole] = useState<string | null>(null);

	useEffect(() => {
		const getUser = async () => {
			const currentUser = authApi.getCurrentUser();
			const role = authApi.getUserRole()  // 👈 Получаем роль
			console.log('User object:', currentUser);
			setUser(currentUser);
			setUserRole(role);  // 👈 Сохраняем роль
			setIsReady(true);
		};
		getUser();
	}, []);

	// Закрытие меню при клике вне его
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};

		if (isMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isMenuOpen]);

	const greeting = user ? `Привет ${user.email?.split('@')[0]}!` : '';

	const handleLogout = async () => {
		try {
			authApi.logout();
			router.push('/auth/login');
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	const handleMenuItemClick = (path: string) => {
		setIsMenuOpen(false);
		router.push(path);
	};

	return (
		<div className={styles.topbar}>
			<div className={styles.left}>
				<Link href="/home">
					{isReady && (
						<span className={styles.greeting} data-text={greeting}>
            {greeting}
        </span>
					)}
				</Link>
			</div>

			{/* Иконка пользователя с выпадающим меню */}
			<div style={{ position: 'relative' }} ref={menuRef}>
				<div
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					style={{
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						padding: '8px'
					}}
				>
					<LucideUser />
				</div>

				{/* Выпадающее меню */}
				{isMenuOpen && (
					<div style={{
						position: 'absolute',
						top: '100%',
						right: 0,
						marginTop: '8px',
						backgroundColor: 'white',
						boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
						minWidth: '220px',
						overflow: 'visible',
						zIndex: 1000,
						animation: 'slideDown 0.2s ease-out'
					}}>
						{/* Профиль - для всех */}
						<div
							onClick={() => handleMenuItemClick('/profile')}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
								padding: '14px 18px',
								cursor: 'pointer',
								transition: 'background-color 0.2s',
								fontSize: '15px',
								fontFamily: 'Poppins, sans-serif'
							}}
							onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
							onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
						>
							<Settings size={18} />
							<span>Профиль</span>
						</div>

						{/* Разделитель */}
						<div style={{
							height: '1px',
							backgroundColor: '#e5e5e5',
							margin: '4px 0'
						}}></div>

						{/* Меню только для USER */}
						{userRole === 'USER' && (
							<>
								{/* Пройденные тесты */}
								<div
									onClick={() => handleMenuItemClick('/test-result/all-results')}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '12px',
										padding: '14px 18px',
										cursor: 'pointer',
										transition: 'background-color 0.2s',
										fontSize: '15px',
										fontFamily: 'Poppins, sans-serif'
									}}
									onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
									onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
								>
									<ClipboardList size={18} />
									<span>Пройденные тесты</span>
								</div>

								{/* История трекера */}
								<div
									onClick={() => handleMenuItemClick('/tracker/history')}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '12px',
										padding: '14px 18px',
										cursor: 'pointer',
										transition: 'background-color 0.2s',
										fontSize: '15px',
										fontFamily: 'Poppins, sans-serif'
									}}
									onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
									onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
								>
									<Activity size={18} />
									<span>История состояний</span>
								</div>

								{/* Мои запросы */}
								<div
									onClick={() => handleMenuItemClick('/my-requests')}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '12px',
										padding: '14px 18px',
										cursor: 'pointer',
										transition: 'background-color 0.2s',
										fontSize: '15px',
										fontFamily: 'Poppins, sans-serif'
									}}
									onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
									onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
								>
									<Send size={18} />
									<span>Мои запросы</span>
								</div>

								<div
									onClick={() => handleMenuItemClick('/my-therapist')}
									style={{
										display: 'flex', alignItems: 'center', gap: '12px',
										padding: '14px 18px', cursor: 'pointer',
										transition: 'background-color 0.2s',
										fontSize: '15px', fontFamily: 'Poppins, sans-serif'
									}}
									onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
									onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
								>
									<Heart size={18} />
									<span>Мой терапевт</span>
								</div>

								{/* Аналитика с подменю */}
								<div style={{ position: 'relative' }}>
									<div
										onMouseEnter={() => setIsStatsSubmenuOpen(true)}
										onMouseLeave={() => setIsStatsSubmenuOpen(false)}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '12px',
											padding: '14px 18px',
											cursor: 'pointer',
											transition: 'background-color 0.2s',
											fontSize: '15px',
											fontFamily: 'Poppins, sans-serif',
											backgroundColor: isStatsSubmenuOpen ? '#f5f5f5' : 'white'
										}}
									>
										<BarChart3 size={18} />
										<span>Аналитика</span>
										<span style={{
											marginLeft: 'auto',
											fontSize: '18px',
											transition: 'transform 0.2s',
											transform: isStatsSubmenuOpen ? 'rotate(-90deg)' : 'rotate(0deg)'
										}}>
                            ›
                        </span>
									</div>

									{/* Подменю статистики */}
									{isStatsSubmenuOpen && (
										<div
											onMouseEnter={() => setIsStatsSubmenuOpen(true)}
											onMouseLeave={() => setIsStatsSubmenuOpen(false)}
											style={{
												position: 'absolute',
												right: '100%',
												top: 0,
												backgroundColor: 'white',
												borderRadius: '12px',
												boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
												minWidth: '240px',
												overflow: 'visible',
												marginRight: '8px',
												zIndex: 1002
											}}
										>
											{/* Общая статистика */}
											<div
												onClick={(e) => {
													e.stopPropagation();
													handleMenuItemClick('/statistic/general');
												}}
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: '12px',
													padding: '14px 18px',
													cursor: 'pointer',
													transition: 'background-color 0.2s',
													fontSize: '14px',
													fontFamily: 'Poppins, sans-serif',
													backgroundColor: 'white'
												}}
												onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
												onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
											>
												<TrendingUp size={16} />
												<span>Общая статистика</span>
											</div>

											{/* Средние показатели по дням */}
											<div
												onClick={(e) => {
													e.stopPropagation();
													handleMenuItemClick('/statistic/daily');
												}}
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: '12px',
													padding: '14px 18px',
													cursor: 'pointer',
													transition: 'background-color 0.2s',
													fontSize: '14px',
													fontFamily: 'Poppins, sans-serif',
													backgroundColor: 'white'
												}}
												onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
												onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
											>
												<Calendar size={16} />
												<span>Средние по дням</span>
											</div>
										</div>
									)}
								</div>

								{/* Разделитель */}
								<div style={{
									height: '1px',
									backgroundColor: '#e5e5e5',
									margin: '4px 0'
								}}></div>
							</>
						)}

						{/* Меню для SPECIALIST (на будущее) */}
						{userRole === 'SPECIALIST' && (
							<>
								{/* Здесь можно добавить специфичные для специалиста пункты */}
								{/* Например: */}
								{/*
                <div
                    onClick={() => handleMenuItemClick('/specialist/patients')}
                    style={{...}}
                >
                    <Users size={18} />
                    <span>Мои пациенты</span>
                </div>
                */}

								{/* Разделитель (пока закомментирован, так как нет пунктов) */}
								{/*
                <div style={{
                    height: '1px',
                    backgroundColor: '#e5e5e5',
                    margin: '4px 0'
                }}></div>
                */}
							</>
						)}

						{/* Выйти - для всех */}
						<div
							onClick={handleLogout}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '12px',
								padding: '14px 18px',
								cursor: 'pointer',
								transition: 'background-color 0.2s',
								fontSize: '15px',
								color: '#ef4444',
								fontFamily: 'Poppins, sans-serif'
							}}
							onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
							onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
						>
							<LogOut size={18} />
							<span>Выйти</span>
						</div>
					</div>
				)}
			</div>

			{/* CSS анимация */}
			<style jsx>{`
				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes slideRight {
        			from {
            			opacity: 0;
            			transform: translateX(-10px);
        			}
        			to {
            			opacity: 1;
            			transform: translateX(0);
        			}
    			}
			`}</style>
		</div>
	);
}
