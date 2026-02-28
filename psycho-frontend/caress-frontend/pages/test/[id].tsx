// psycho-frontend/caress-frontend/pages/test/[id].tsx
import Bottombar from '@/components/bottombar';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import styles from '@/styles/quiz.module.css';
import Head from 'next/head';
import { testApi, TestDetails, QuestionAnswer } from '@/services/testApi';
import {checkAuth} from "@/utils/authUtils";

export default function DynamicTest() {
    const router = useRouter();
    const { id } = router.query;

    const [test, setTest] = useState<TestDetails | null>(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Загрузка теста
    useEffect(() => {
        if (!id) return;

        const init = async () => {
            const isAuthed = await checkAuth(router, 'USER');
            if (!isAuthed) return;

            try {
                setIsLoading(true);
                setError(null);
                const token = localStorage.getItem('jwt_token');
                const testData = await testApi.getTestById(Number(id), token);
                setTest(testData);
            } catch (err) {
                console.error('Error loading test:', err);
                setError('Не удалось загрузить тест');
            } finally {
                setIsLoading(false);
            }
        };

        void init();
    }, [id, router]);

    // Обработка выбора ответа
    const handleAnswerClick = async (questionId: number, answerOptionId: number) => {
        // Сохраняем ответ
        const newAnswer: QuestionAnswer = {
            questionId,
            answerOptionId,
        };

        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        // Если это последний вопрос - отправляем тест
        if (test && questionNumber + 1 === test.testQuestions.length) {
            await submitTest(updatedAnswers);
        } else {
            // Переходим к следующему вопросу
            setQuestionNumber(questionNumber + 1);
        }
    };

    // Отправка результатов теста
    const submitTest = async (finalAnswers: QuestionAnswer[]) => {
        if (!test) return;

        try {
            setIsSubmitting(true);

            // Получаем JWT токен
            const token = localStorage.getItem('jwt_token');

            const result = await testApi.submitTest(test.id, finalAnswers, token);

            // Перенаправление на страницу результатов
            router.push(`/test-result/${result.id}`);
        } catch (err) {
            console.error('Error submitting test:', err);
            setError('Не удалось отправить результаты теста');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.content}>
                <div>Загрузка теста...</div>
                <Bottombar />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.content}>
                <Head>
                    <title>Ошибка</title>
                </Head>
                <div style={{ color: 'red' }}>{error}</div>
                <button onClick={() => router.back()}>
                    Вернуться назад
                </button>
                <Bottombar />
            </div>
        );
    }

    if (!test) {
        return (
            <div className={styles.content}>
                <div>Тест не найден</div>
                <Bottombar />
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className={styles.content}>
                <div>Обработка результатов...</div>
                <Bottombar />
            </div>
        );
    }

    const currentQuestion = test.testQuestions[questionNumber];

    return (
        <div className={styles.content}>
            <Head>
                <title>{test.name}</title>
            </Head>

            {/* Прогресс-бар */}
            <div className={styles.progress_bar}>
                <div
                    className={styles.progress}
                    style={{ width: `${((questionNumber + 1) / test.testQuestions.length) * 100}%` }}
                ></div>
            </div>

            {/* Заголовок теста (показываем на первом вопросе) */}
            {questionNumber === 0 && (
                <div className={styles.container}>
                    <div className={styles.title}>{test.name}</div>
                    <div style={{ marginBottom: '20px', fontSize: '14px' }}>
                        {test.description}
                    </div>
                </div>
            )}

            {/* Вопрос */}
            <div className={styles.container}>
                <div className={styles.question}>
                    Q{questionNumber + 1}) {currentQuestion.question}
                </div>
            </div>

            {/* Варианты ответов */}
            <div className={styles.answers}>
                {currentQuestion.answerOptions.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        className={styles.btn}
                        onClick={() => handleAnswerClick(currentQuestion.id, option.id)}
                    >
                        {option.answer}
                    </button>
                ))}
            </div>

            <Bottombar />
        </div>
    );
}
