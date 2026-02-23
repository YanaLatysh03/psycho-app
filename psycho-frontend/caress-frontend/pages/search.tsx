import Bottombar from '@/components/bottombar';
import TopBar from '@/components/topbar';
import Head from 'next/head';
import React, {useEffect, useRef, useState} from 'react';
import styles from '@/styles/main.module.css';
import { LucideSearch, LucideUser, LucideMapPin, LucideAward, LucideDollarSign, LucideStar, LucideChevronLeft, LucideChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { searchApi, SpecialistProfile, SpecialistSearchCriteria, getProblemAreaLabel, getWorkFormatLabel } from '@/services/searchApi';
import { ProblemArea } from '@/services/profileApi';

export default function Search() {
	const router = useRouter();

	const [specialists, setSpecialists] = useState<SpecialistProfile[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Фильтры
	const [searchName, setSearchName] = useState('');
	const [searchCity, setSearchCity] = useState('');
	const [selectedProblemAreas, setSelectedProblemAreas] = useState<ProblemArea[]>([]);
	const [priceFrom, setPriceFrom] = useState<number | undefined>();
	const [priceTo, setPriceTo] = useState<number | undefined>();
	const [minRating, setMinRating] = useState<number | undefined>();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Пагинация
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize] = useState(10);
	const [hasMore, setHasMore] = useState(true);

	// Загрузка специалистов
	const loadSpecialists = async (page: number = 0, append: boolean = false) => {
		try {
			setIsLoading(true);
			setError(null);

			const token = localStorage.getItem('jwt_token');
			const criteria: SpecialistSearchCriteria = {
				name: searchName || undefined,
				city: searchCity || undefined,
				problemAreas: selectedProblemAreas.length > 0 ? selectedProblemAreas : undefined,
				priceFrom,
				priceTo,
				minRating,
				page,
				size: pageSize,
				sortBy: 'specialistMetaData.rating',
				sortDirection: 'DESC'
			};

			const results = await searchApi.searchSpecialists(criteria, token);

			if (append) {
				setSpecialists(prev => [...prev, ...results]);
			} else {
				setSpecialists(results);
			}

			setHasMore(results.length === pageSize);
			setCurrentPage(page);
		} catch (err) {
			console.error('Error loading specialists:', err);
			setError('Не удалось загрузить список специалистов');
		} finally {
			setIsLoading(false);
		}
	};

	// Начальная загрузка
	useEffect(() => {
		loadSpecialists(0);
	}, []);

	// Закрытие dropdown при клике вне его
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDropdownOpen]);

	const handleSearch = () => {
		loadSpecialists(0, false);
	};

	const handleNextPage = () => {
		if (hasMore && !isLoading) {
			loadSpecialists(currentPage + 1, false);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 0 && !isLoading) {
			loadSpecialists(currentPage - 1, false);
		}
	};

	const toggleProblemArea = (area: ProblemArea) => {
		setSelectedProblemAreas(prev =>
			prev.includes(area)
				? prev.filter(a => a !== area)
				: [...prev, area]
		);
	};

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

	return (
		<>
			<Head>
				<title>Поиск специалистов</title>
			</Head>
			<TopBar />

			<div className={styles.content}>
				<div className={styles.quiz_title}>
					🔍 Поиск специалистов
				</div>

				{/* Фильтры */}
				<div className={styles.card} style={{
					width: '100%',
					maxWidth: '1200px',  // Максимальная ширина для больших экранов
					textAlign: 'left'     // Выравнивание текста слева
				}}>
					<div className={styles.title} style={{
						marginBottom: '20px',
						textAlign: 'center'  // Заголовок по центру
					}}>
						Фильтры поиска
					</div>

					<div style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
						gap: '15px',
						marginBottom: '10px'
					}}>
						{/* Поиск по имени */}
						<div>
							<label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>
								Имя специалиста
							</label>
							<input
								type="text"
								value={searchName}
								onChange={(e) => setSearchName(e.target.value)}
								placeholder="Введите имя..."
								style={{
									width: '100%',
									padding: '10px',
									borderRadius: '8px',
									border: '1px solid #ccc',
									fontSize: '14px',
									boxSizing: 'border-box'
								}}
							/>
						</div>

						{/* Город */}
						<div>
							<label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>
								Город
							</label>
							<input
								type="text"
								value={searchCity}
								onChange={(e) => setSearchCity(e.target.value)}
								placeholder="Например: Москва"
								style={{
									width: '100%',
									padding: '10px',
									borderRadius: '8px',
									border: '1px solid #ccc',
									fontSize: '14px',
									boxSizing: 'border-box'
								}}
							/>
						</div>

						{/* Цена От */}
						<div>
							<label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>
								Цена от
							</label>
							<input
								type="number"
								value={priceFrom || ''}
								onChange={(e) => setPriceFrom(e.target.value ? parseInt(e.target.value) : undefined)}
								placeholder="От"
								style={{
									width: '100%',
									padding: '10px',
									borderRadius: '8px',
									border: '1px solid #ccc',
									fontSize: '14px',
									boxSizing: 'border-box'
								}}
							/>
						</div>

						{/* Цена До */}
						<div>
							<label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>
								Цена до
							</label>
							<input
								type="number"
								value={priceTo || ''}
								onChange={(e) => setPriceTo(e.target.value ? parseInt(e.target.value) : undefined)}
								placeholder="До"
								style={{
									width: '100%',
									padding: '10px',
									borderRadius: '8px',
									border: '1px solid #ccc',
									fontSize: '14px',
									boxSizing: 'border-box'
								}}
							/>
						</div>

						{/* Минимальный рейтинг */}
						<div>
							<label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>
								Минимальный рейтинг
							</label>
							<input
								type="number"
								min="0"
								max="5"
								step="0.1"
								value={minRating || ''}
								onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : undefined)}
								placeholder="Например: 4.5"
								style={{
									width: '100%',
									padding: '10px',
									borderRadius: '8px',
									border: '1px solid #ccc',
									fontSize: '14px',
									boxSizing: 'border-box'
								}}
							/>
						</div>
						{/* Проблемные области - кастомный dropdown */}
						<div style={{ marginBottom: '20px', position: 'relative' }} ref={dropdownRef}>
							<label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>
								Проблемные области
							</label>

							{/* Кнопка открытия dropdown */}
							<div
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								style={{
									width: '100%',
									padding: '8px',
									borderRadius: '8px',
									border: '1px solid #ccc',
									fontSize: '14px',
									cursor: 'pointer',
									backgroundColor: 'white',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									boxSizing: 'border-box',
									minHeight: '42px'
								}}
							>
        <span style={{ color: selectedProblemAreas.length > 0 ? '#333' : '#999' }}>
            {selectedProblemAreas.length > 0
				? `Выбрано: ${selectedProblemAreas.length}`
				: 'Проблемные области...'}
        </span>
								<span style={{
									fontSize: '12px',
									transition: 'transform 0.2s',
									transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
								}}>
            ▼
        </span>
							</div>

							{/* Выбранные области (chips) */}
							{selectedProblemAreas.length > 0 && (
								<div style={{
									display: 'flex',
									flexWrap: 'wrap',
									gap: '6px',
									marginTop: '8px'
								}}>
									{selectedProblemAreas.map((area) => (
										<span
											key={area}
											style={{
												padding: '4px 8px',
												borderRadius: '12px',
												backgroundColor: '#7C3AED',
												color: 'white',
												fontSize: '11px',
												display: 'flex',
												alignItems: 'center',
												gap: '4px'
											}}
										>
                    {getProblemAreaLabel(area)}
											<span
												onClick={(e) => {
													e.stopPropagation();
													toggleProblemArea(area);
												}}
												style={{
													cursor: 'pointer',
													fontWeight: 'bold',
													fontSize: '14px',
													lineHeight: '1'
												}}
											>
                        ×
                    </span>
                </span>
									))}
								</div>
							)}

							{/* Dropdown меню с чекбоксами */}
							{isDropdownOpen && (
								<div style={{
									position: 'absolute',
									top: '100%',
									left: 0,
									right: 0,
									marginTop: '4px',
									backgroundColor: 'white',
									border: '1px solid #ccc',
									borderRadius: '8px',
									boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
									maxHeight: '300px',
									overflowY: 'auto',
									zIndex: 1000
								}}>
									{Object.values(ProblemArea).map((area) => (
										<label
											key={area}
											style={{
												display: 'flex',
												alignItems: 'center',
												padding: '10px 12px',
												cursor: 'pointer',
												fontSize: '13px',
												transition: 'background-color 0.15s',
												borderBottom: '1px solid #f0f0f0'
											}}
											onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
											onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
										>
											<input
												type="checkbox"
												checked={selectedProblemAreas.includes(area)}
												onChange={() => toggleProblemArea(area)}
												style={{
													marginRight: '10px',
													cursor: 'pointer',
													width: '16px',
													height: '16px'
												}}
											/>
											<span>{getProblemAreaLabel(area)}</span>
										</label>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Кнопка поиска */}
					<button
						className={styles.btn}
						onClick={handleSearch}
						disabled={isLoading}
						style={{
							width: '100%',
							maxWidth: '300px',
							display: 'block',
							margin: '0 auto',
							opacity: isLoading ? 0.6 : 1
						}}
					>
						<LucideSearch size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
						{isLoading ? 'Поиск...' : 'Найти специалистов'}
					</button>
				</div>

				{/* Ошибка */}
				{error && (
					<div style={{
						padding: '12px',
						backgroundColor: '#fee2e2',
						border: '1px solid #fecaca',
						borderRadius: '8px',
						color: '#dc2626',
						marginBottom: '15px'
					}}>
						{error}
					</div>
				)}

				{/* Результаты поиска */}
				{specialists.length === 0 && !isLoading && (
					<div className={styles.card}>
						<div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
							Специалисты не найдены. Попробуйте изменить критерии поиска.
						</div>
					</div>
				)}

				{specialists.map((specialist) => (
					<div
						key={specialist.userId}
						className={styles.card}
						style={{ cursor: 'pointer' }}
						onClick={() => router.push(`/therapist/${specialist.userId}`)}
					>
						<div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>

							{/* Информация */}
							<div style={{ flex: 1 }}>
								<div style={{
									fontSize: '18px',
									fontWeight: 'bold',
									color: '#1f2937',
									marginBottom: '4px'
								}}>
									{specialist.name}
									{specialist.specialistMetaData?.rating && (
										<span style={{
											marginLeft: '10px',
											fontSize: '14px',
											color: '#f59e0b',
											fontWeight: 'normal'
										}}>
                                            <LucideStar size={14} style={{ display: 'inline', marginBottom: '2px' }} /> {specialist.specialistMetaData.rating.toFixed(1)}
                                        </span>
									)}
								</div>

								{specialist.specialistMetaData?.specialization && (
									<div style={{ fontSize: '13px', color: '#7C3AED', marginBottom: '8px' }}>
										{specialist.specialistMetaData.specialization}
									</div>
								)}

								<div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
									{specialist.city && (
										<span style={{ marginRight: '12px' }}>
                                            <LucideMapPin size={14} style={{ display: 'inline' }} /> {specialist.city}
                                        </span>
									)}
									{specialist.specialistMetaData?.yearsOfExperience && (
										<span style={{ marginRight: '12px' }}>
                                            <LucideAward size={14} style={{ display: 'inline'}} /> {specialist.specialistMetaData.yearsOfExperience} лет опыта
                                        </span>
									)}
								</div>

								{/* Проблемные области */}
								{specialist.specialistMetaData?.problemAreas && specialist.specialistMetaData.problemAreas.length > 0 && (
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
										{Array.from(specialist.specialistMetaData.problemAreas).slice(0, 3).map((area) => (
											<span
												key={area}
												style={{
													padding: '4px 10px',
													borderRadius: '12px',
													backgroundColor: '#f3e8ff',
													color: '#7C3AED',
													fontSize: '11px'
												}}
											>
                                                {getProblemAreaLabel(area)}
                                            </span>
										))}
										{specialist.specialistMetaData.problemAreas.length > 3 && (
											<span style={{ color: '#999' }}>
                                                +{specialist.specialistMetaData.problemAreas.length - 3}
                                            </span>
										)}
									</div>
								)}

								{/* Цена */}
								{specialist.specialistMetaData?.sessionPrice && (
									<div style={{ fontSize: '14px', fontWeight: 'bold', color: '#7C3AED' }}>
										<LucideDollarSign size={14} style={{ display: 'inline' }} /> {specialist.specialistMetaData.sessionPrice} BYN/сессия
										{specialist.specialistMetaData.providesFreeConsultation && (
											<span style={{ fontSize: '12px', color: '#22c55e', marginLeft: '8px' }}>
                                                • Бесплатная консультация
                                            </span>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				))}

				{/* Пагинация */}
				{specialists.length > 0 && (
					<div style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						gap: '15px',
						marginTop: '20px',
						marginBottom: '30px'
					}}>
						<button
							onClick={handlePrevPage}
							disabled={currentPage === 0 || isLoading}
							style={{
								padding: '10px 20px',
								borderRadius: '8px',
								border: '1px solid #ccc',
								backgroundColor: currentPage === 0 || isLoading ? '#f3f4f6' : 'white',
								color: currentPage === 0 || isLoading ? '#9ca3af' : '#374151',
								cursor: currentPage === 0 || isLoading ? 'not-allowed' : 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								fontSize: '14px',
								fontWeight: '500'
							}}
						>
							<LucideChevronLeft size={18} />
							Назад
						</button>

						<span style={{ fontSize: '14px', color: '#666' }}>
                            Страница {currentPage + 1}
                        </span>

						<button
							onClick={handleNextPage}
							disabled={!hasMore || isLoading}
							style={{
								padding: '10px 20px',
								borderRadius: '8px',
								border: '1px solid #ccc',
								backgroundColor: !hasMore || isLoading ? '#f3f4f6' : 'white',
								color: !hasMore || isLoading ? '#9ca3af' : '#374151',
								cursor: !hasMore || isLoading ? 'not-allowed' : 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								fontSize: '14px',
								fontWeight: '500'
							}}
						>
							Вперед
							<LucideChevronRight size={18} />
						</button>
					</div>
				)}
			</div>

			<Bottombar />
		</>
	);
}
