import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TopBar from '@/components/topbar';
import Bottombar from '@/components/bottombar';
import styles from '@/styles/main.module.css';
import Link from 'next/link';
import { testApi, Test } from '@/services/testApi';
import {trackerApi, GeneralState, GeneralStateResponse, TrackerEntrySummary, Emotion} from '@/services/trackerApi';
import {emotionLabels} from "@/utils/emotionUtils";
import {authApi} from "@/services/authApi";
import {checkAuth} from "@/utils/authUtils";

export default function Home() {
	const [suggestedTests, setSuggestedTests] = useState<Test[]>([]);
	const [emojiDone, setEmojiDone] = useState<boolean>(false);
	const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [emojiHistory, setEmojiHistory] = useState<GeneralStateResponse[]>([]);
	const [todayEntry, setTodayEntry] = useState<TrackerEntrySummary | null>(null);

	const router = useRouter();

	const handleEmotionClick = async (emotion: string) => {
		try {
			setIsSaving(true);
			setSelectedEmoji(emotion);

			const emotionMap: Record<string, GeneralState> = {
				'😀': GeneralState.HAPPY,
				'😔': GeneralState.SAD,
				'😡': GeneralState.ANGRY,
				'😴': GeneralState.SLEEPY
			};

			const generalState = emotionMap[emotion];

			if (generalState) {
				const token = localStorage.getItem('jwt_token');

				// Сохраняем эмоцию
				await trackerApi.createGeneralState(generalState, token);

				localStorage.setItem('lastEmojiDate', new Date().toDateString());

				// Обновляем историю эмоций
				try {
					const history = await trackerApi.getRecentGeneralStates(token);
					setEmojiHistory(history);
				} catch (historyError) {
					console.error('Error loading emoji history:', historyError);
					// Не показываем ошибку пользователю, просто логируем
				}
			}

			// Небольшая задержка для показа анимации
			setTimeout(() => {
				setIsSaving(false);
				//setEmojiDone(true);
			}, 500);

		} catch (error) {
			console.error('Error saving emotion:', error);
			setIsSaving(false);
			setSelectedEmoji(null);
			// Показываем ошибку
			alert('Не удалось сохранить состояние. Попробуйте еще раз.');
		}
	};

	// Функция для конвертации GeneralState в эмоджи
	const getEmojiFromState = (state: GeneralState): string => {
		const stateToEmoji: Record<GeneralState, string> = {
			[GeneralState.HAPPY]: '😀',
			[GeneralState.SAD]: '😔',
			[GeneralState.ANGRY]: '😡',
			[GeneralState.SLEEPY]: '😴'
		};
		return stateToEmoji[state] || '😐';
	};

// Функция для получения цвета фона по эмоции
	const getEmojiColor = (state: GeneralState): string => {
		const colors: Record<GeneralState, string> = {
			[GeneralState.HAPPY]: '#d4f4dd',
			[GeneralState.SAD]: '#e0e7ff',
			[GeneralState.ANGRY]: '#fee2e2',
			[GeneralState.SLEEPY]: '#f3e8ff'
		};
		return colors[state] || '#f0f0f0';
	};

	// Функция для получения русского названия эмоции
	const getEmotionLabel = (emotion: Emotion): string => {
		return emotionLabels[emotion] || emotion;
	};

	useEffect(() => {
		const init = async () => {
			const isAuthed = await checkAuth(router, 'USER');
			if (!isAuthed) return;  // ← данные не грузим если не авторизован

			await loadHomeData();
		};

		void init();
	}, [router]);

	const loadHomeData = async () => {
		// Загрузка предложенных тестов
		try {
			const token = localStorage.getItem('jwt_token');
			const tests = await testApi.getSuggestedTests(token);
			setSuggestedTests(tests);
		} catch (error) {
			console.error('Error loading suggested tests:', error);
		}

		// Загрузка истории эмоций (добавьте это)
		try {
			const token = localStorage.getItem('jwt_token');
			const history = await trackerApi.getRecentGeneralStates(token);
			setEmojiHistory(history);
		} catch (error) {
			console.error('Error loading emoji history:', error);
		}

		// Загрузка сегодняшней записи трекера (добавьте это)
		try {
			const token = localStorage.getItem('jwt_token');
			const entry = await trackerApi.getTodayLatestEntry(token);
			setTodayEntry(entry);
		} catch (error) {
			console.error('Error loading today entry:', error);
		}
	};

	console.log('hello');
	return (
		<>
			<Head>
				<title>Главная</title>
			</Head>
			<TopBar />

			<div className={styles.content}>
				<div className={styles.welcome}>
					Добро пожаловать 👋
				</div>

				{/* Контейнер с виджетом эмоций и историей рядом */}
				<div style={{
					display: 'flex',
					gap: '20px',
					justifyContent: 'center',
					flexWrap: 'wrap',
					marginBottom: '20px'
				}}>
					{/* Виджет выбора эмоции */}
					{emojiDone == false && (
						<div className={styles.card} style={{
							margin: '0',
							minWidth: '320px'
						}}>
							<div className={styles.title}>Как вы себя чувствуете сегодня?</div>

							{/* Показываем статус сохранения */}
							{isSaving && (
								<div style={{
									fontSize: '14px',
									color: '#7C3AED',
									marginBottom: '10px',
									fontWeight: 'bold',
									animation: 'pulse 1s infinite'
								}}>
									✨ Сохранение...
								</div>
							)}

							<div className={styles.emotions}>
								<div
									className={styles.emotion}
									onClick={() => !isSaving && handleEmotionClick('😀')}
									style={{
										cursor: isSaving ? 'not-allowed' : 'pointer',
										transform: selectedEmoji === '😀' ? 'scale(1.3)' : 'scale(1)',
										backgroundColor: selectedEmoji === '😀' ? '#d4f4dd' : 'transparent',
										transition: 'all 0.3s ease',
										border: selectedEmoji === '😀' ? '3px solid #22c55e' : 'none'
									}}
								>
									<span role="img" aria-label="Счастлив">😀</span>
								</div>
								<div
									className={styles.emotion}
									onClick={() => !isSaving && handleEmotionClick('😔')}
									style={{
										cursor: isSaving ? 'not-allowed' : 'pointer',
										transform: selectedEmoji === '😔' ? 'scale(1.3)' : 'scale(1)',
										backgroundColor: selectedEmoji === '😔' ? '#e0e7ff' : 'transparent',
										transition: 'all 0.3s ease',
										border: selectedEmoji === '😔' ? '3px solid #6366f1' : 'none'
									}}
								>
									<span role="img" aria-label="Грустно">😔</span>
								</div>
								<div
									className={styles.emotion}
									onClick={() => !isSaving && handleEmotionClick('😡')}
									style={{
										cursor: isSaving ? 'not-allowed' : 'pointer',
										transform: selectedEmoji === '😡' ? 'scale(1.3)' : 'scale(1)',
										backgroundColor: selectedEmoji === '😡' ? '#fee2e2' : 'transparent',
										transition: 'all 0.3s ease',
										border: selectedEmoji === '😡' ? '3px solid #ef4444' : 'none'
									}}
								>
									<span role="img" aria-label="Злой">😡</span>
								</div>
								<div
									className={styles.emotion}
									onClick={() => !isSaving && handleEmotionClick('😴')}
									style={{
										cursor: isSaving ? 'not-allowed' : 'pointer',
										transform: selectedEmoji === '😴' ? 'scale(1.3)' : 'scale(1)',
										backgroundColor: selectedEmoji === '😴' ? '#f3e8ff' : 'transparent',
										transition: 'all 0.3s ease',
										border: selectedEmoji === '😴' ? '3px solid #a78bfa' : 'none'
									}}
								>
									<span role="img" aria-label="Сонный">😴</span>
								</div>
							</div>
						</div>
					)}

					{/* История эмоций */}
					{emojiHistory.length > 0 && (
						<div className={styles.card} style={{
							margin: '0',
							minWidth: '320px'
						}}>
							<div className={styles.title} style={{ marginBottom: '15px' }}>
								📅 Ваши последние эмоции
							</div>
							<div style={{
								display: 'flex',
								justifyContent: 'center',
								gap: '10px',
								flexWrap: 'wrap'
							}}>
								{emojiHistory.map((entry, index) => (
									<div
										key={entry.id}
										style={{
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											gap: '6px'
										}}
									>
										<div style={{
											width: '50px',
											height: '50px',
											borderRadius: '50%',
											backgroundColor: getEmojiColor(entry.generalState),
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '28px',
											boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
											transition: 'transform 0.2s ease',
											cursor: 'pointer'
										}}
											 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
											 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
										>
											{getEmojiFromState(entry.generalState)}
										</div>
										<div style={{
											fontSize: '10px',
											color: '#999',
											fontWeight: '500'
										}}>
											{index === 0 ? 'Последняя' : index === 1 ? 'Предыдущая' : `${index + 1}`}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Предложенные тесты */}
				{suggestedTests.length > 0 && (
					<div style={{ width: '100%', marginBottom: '20px' }}>
						<div className={styles.mh} style={{ textAlign: 'center', marginBottom: '20px' }}>
							Рекомендуемые тесты для вас ✨
						</div>

						<div style={{
							display: 'flex',
							gap: '20px',
							justifyContent: 'center',
							flexWrap: 'wrap',
							padding: '0 20px',
							alignItems: 'stretch'
						}}>
							{suggestedTests.map((test) => (
								<div key={test.id} className={styles.card} style={{
									cursor: 'pointer',
									transition: 'all 0.3s ease',
									position: 'relative',
									width: '320px',          // Фиксированная ширина
									flex: '0 0 320px',       // Не растягивается и не сжимается
									margin: '0'              // Убираем автоматические отступы
								}}
									 onMouseEnter={(e) => {
										 e.currentTarget.style.transform = 'translateY(-5px)';
										 e.currentTarget.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.2)';
									 }}
									 onMouseLeave={(e) => {
										 e.currentTarget.style.transform = 'translateY(0)';
										 e.currentTarget.style.boxShadow = '0px 0px 4px rgba(0, 0, 0, 0.4)';
									 }}
								>
									<div style={{
										backgroundColor: '#7C3AED',
										color: 'white',
										padding: '4px 12px',
										borderRadius: '12px',
										fontSize: '12px',
										fontWeight: 'bold',
										display: 'inline-block',
										marginBottom: '10px'
									}}>
										{test.categoryName}
									</div>

									<div className={styles.title} style={{
										fontSize: '18px',
										marginBottom: '12px',
										color: '#333'
									}}>
										{test.name}
									</div>

									<div style={{
										fontSize: '14px',
										color: '#666',
										marginBottom: '20px',
										lineHeight: '1.5',
										textAlign: 'left',
										minHeight: '80px'
									}}>
										{test.description.length > 120
											? test.description.substring(0, 120) + '...'
											: test.description}
									</div>

									<div style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										fontSize: '12px',
										color: '#999',
										marginBottom: '15px'
									}}>
										<span>📊 Баллов: {test.minScore} - {test.maxScore}</span>
									</div>

									<button
										className={styles.btn}
										onClick={() => router.push(`/test/${test.id}`)}
										style={{
											width: '100%',
											fontSize: '16px',
											fontWeight: 'bold',
											background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
											color: 'white',
											transition: 'all 0.3s ease'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)';
										}}
									>
										Пройти тест →
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Трекер состояния */}
				<div className={styles.card}>
					{todayEntry ? (
						// Если есть запись за сегодня - показываем её
						<>
							<div className={styles.mh} style={{ marginBottom: '10px' }}>
								✅ Ваша запись трекера за сегодня
							</div>
							<div style={{
								backgroundColor: '#f0f9ff',
								padding: '15px',
								borderRadius: '8px',
								marginBottom: '15px'
							}}>
								<div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
									🕐 {new Date(todayEntry.entryDatetime).toLocaleTimeString('ru-RU', {
									hour: '2-digit',
									minute: '2-digit'
								})}
								</div>
								{todayEntry.emotionsSummary && todayEntry.emotionsSummary.length > 0 && (
									<div style={{ fontSize: '14px', color: '#333' }}>
										<strong>Эмоции:</strong>{' '}
										{todayEntry.emotionsSummary.slice(0, 3).map((emotion, index) => (
											<span key={emotion}>
                                {getEmotionLabel(emotion)}
												{index < Math.min(todayEntry.emotionsSummary.length, 3) - 1 ? ', ' : ''}
                            </span>
										))}
										{todayEntry.emotionsSummary.length > 3 && (
											<span> и еще {todayEntry.emotionsSummary.length - 3}</span>
										)}
									</div>
								)}
							</div>
							<div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
								<Link className={styles.link} href={`/tracker/${todayEntry.id}`} style={{
									flex: 1,
									textAlign: 'center'
								}}>
									Посмотреть подробнее
								</Link>
								<Link className={styles.link} href="/tracker/create" style={{
									flex: 1,
									textAlign: 'center'
								}}>
									Добавить новую запись
								</Link>
							</div>
						</>
					) : (
						// Если записи нет - показываем призыв к действию
						<>
							<div className={styles.mh}>
								Еще не заполняли трекер сегодня?
							</div>
							<div>
								<Link className={styles.link} href="/tracker/create">
									Заполнить трекер прямо сейчас!
								</Link>
							</div>
						</>
					)}
				</div>
			</div>

			<Bottombar/>
		</>
	)
}
