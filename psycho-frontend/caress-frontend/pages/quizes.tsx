// psycho-frontend/caress-frontend/pages/quizes.tsx
import Bottombar from '@/components/bottombar';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import styles from '@/styles/main.module.css'
import { useRouter } from 'next/router';
import { testApi, Test, TestCategory } from '@/services/testApi';
import TopBar from "@/components/topbar";
import {authApi} from "@/services/authApi";
import {checkAuth} from "@/utils/authUtils";

export default function Quiz() {
	const router = useRouter();
	const [tests, setTests] = useState<Test[]>([]);
	const [categories, setCategories] = useState<TestCategory[]>([]);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [userRole, setUserRole] = useState<string | null>(null);

	// Получение роли пользователя
	useEffect(() => {
		const init = async () => {
			const isAuthed = await checkAuth(router); // без роли — страница для обоих
			if (!isAuthed) return;

			// После успешной проверки — роль уже в localStorage
			const role = authApi.getUserRole();
			setUserRole(role);
		};
		void init();
	}, [router]);

	// Загрузка категорий
	useEffect(() => {
		async function fetchCategories() {
			try {
				const token = localStorage.getItem('jwt_token');
				const categoriesData = await testApi.getAllCategories(token);
				setCategories(categoriesData);
			} catch (err) {
				console.error('Error loading categories:', err);
			}
		}
		fetchCategories();
	}, []);

	// Загрузка тестов (при изменении категории)
	useEffect(() => {
		async function fetchTests() {
			try {
				setIsLoading(true);
				setError(null);

				const token = localStorage.getItem('jwt_token');

				let testsData: Test[];
				if (selectedCategoryId === null) {
					// Загружаем все тесты
					testsData = await testApi.getAllTests(token);
				} else {
					// Загружаем тесты конкретной категории
					testsData = await testApi.getTestsByCategory(selectedCategoryId, token);
				}

				setTests(testsData);
			} catch (err) {
				console.error('Error loading tests:', err);
				setError('Не удалось загрузить тесты');
			} finally {
				setIsLoading(false);
			}
		}

		fetchTests();
	}, [selectedCategoryId]); // Перезагружаем тесты при смене категории

	if (isLoading) {
		return (
			<div className={styles.content}>
				<div>Загрузка тестов...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.content}>
				<div style={{ color: 'red' }}>{error}</div>
				<button onClick={() => window.location.reload()}>
					Попробовать снова
				</button>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Психологические тесты</title>
			</Head>
			<TopBar />
			<div className={styles.content}>
				<div className={styles.quiz_title}>
					📋 Психологические тесты
				</div>

			{/* Фильтр по категориям */}
			{categories.length > 0 && (
				<div style={{
					display: 'flex',
					gap: '10px',
					flexWrap: 'wrap',
					justifyContent: 'center',
					marginBottom: '20px',
					padding: '0 20px'
				}}>
					{/* Кнопка "Все тесты" */}
					<button
						onClick={() => setSelectedCategoryId(null)}
						style={{
							padding: '8px 16px',
							borderRadius: '20px',
							border: selectedCategoryId === null ? '2px solid #7C3AED' : '1px solid #ccc',
							backgroundColor: selectedCategoryId === null ? '#7C3AED' : 'white',
							color: selectedCategoryId === null ? 'white' : '#333',
							cursor: 'pointer',
							fontSize: '14px',
							fontWeight: selectedCategoryId === null ? 'bold' : 'normal',
							transition: 'all 0.3s'
						}}
					>
						Все тесты
					</button>

					{/* Кнопки категорий */}
					{categories.map((category) => (
						<button
							key={category.id}
							onClick={() => setSelectedCategoryId(category.id)}
							style={{
								padding: '8px 16px',
								borderRadius: '20px',
								border: selectedCategoryId === category.id ? '2px solid #7C3AED' : '1px solid #ccc',
								backgroundColor: selectedCategoryId === category.id ? '#7C3AED' : 'white',
								color: selectedCategoryId === category.id ? 'white' : '#333',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: selectedCategoryId === category.id ? 'bold' : 'normal',
								transition: 'all 0.3s'
							}}
						>
							{category.name}
						</button>
					))}
				</div>
			)}

			{/* Список тестов */}
			{tests.length === 0 ? (
				<div className={styles.container}>
					<p>
						{selectedCategoryId === null
							? 'Тесты пока не добавлены'
							: 'В этой категории пока нет тестов'}
					</p>
				</div>
			) : (
				tests.map((test) => (
					<div key={test.id} className={styles.container}>
						<div className={styles.title}>{test.name}</div>
						<div>{test.description}</div>
						<div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
							Категория: {test.categoryName}
						</div>
						{/* Разные кнопки для USER и SPECIALIST */}
						{userRole === 'SPECIALIST' ? (
							<button
								className={styles.btn}
								onClick={() => router.push(`/test-statistics/${test.id}`)}
								style={{
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
								}}
							>
								📊 Статистика по тесту
							</button>
						) : (
							<button
								className={styles.btn}
								onClick={() => router.push(`/test/${test.id}`)}
							>
								Пройти тест
							</button>
						)}
					</div>
				))
			)}

			<Bottombar/>
		</div>
		</>
	);
}
