import {Emotion} from "@/services/trackerApi";

// Функция для получения русского названия эмоции
export const emotionLabels: Record<Emotion, string> = {
        [Emotion.JOY]: 'Радость',
        [Emotion.HAPPINESS]: 'Счастье',
        [Emotion.EUPHORIA]: 'Эйфория',
        [Emotion.EXCITEMENT]: 'Возбуждение',
        [Emotion.PRIDE]: 'Гордость',
        [Emotion.PEACE]: 'Спокойствие',
        [Emotion.LOVE]: 'Любовь',
        [Emotion.SADNESS]: 'Грусть',
        [Emotion.MELANCHOLY]: 'Меланхолия',
        [Emotion.LONELINESS]: 'Одиночество',
        [Emotion.DISAPPOINTMENT]: 'Разочарование',
        [Emotion.DESPAIR]: 'Отчаяние',
        [Emotion.ANGER]: 'Гнев',
        [Emotion.IRRITATION]: 'Раздражение',
        [Emotion.RESENTMENT]: 'Обида',
        [Emotion.FEAR]: 'Страх',
        [Emotion.ANXIETY]: 'Тревога',
        [Emotion.SHAME]: 'Стыд',
        [Emotion.GUILT]: 'Вина',
        [Emotion.DISGUST]: 'Отвращение',
        [Emotion.JEALOUSY]: 'Ревность',
        [Emotion.ENVY]: 'Зависть',
        [Emotion.TIRED]: 'Усталость',
        [Emotion.OVERWHELMED]: 'Перегруженность',
        [Emotion.STRESSED]: 'Стресс'
    };
