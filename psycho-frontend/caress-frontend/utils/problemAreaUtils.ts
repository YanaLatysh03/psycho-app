import { ProblemArea } from '@/services/profileApi';

export const problemAreaLabels: Record<ProblemArea, string> = {
    [ProblemArea.ANXIETY]: 'Тревога',
    [ProblemArea.DEPRESSION]: 'Депрессия',
    [ProblemArea.STRESS]: 'Стресс',
    [ProblemArea.BURNOUT]: 'Выгорание',
    [ProblemArea.RELATIONSHIPS]: 'Отношения',
    [ProblemArea.SELF_ESTEEM]: 'Самооценка',
    [ProblemArea.TRAUMA]: 'Травма',
    [ProblemArea.GRIEF]: 'Горе, утрата',
    [ProblemArea.ADDICTION]: 'Зависимости',
    [ProblemArea.EATING_DISORDERS]: 'Расстройства пищевого поведения',
    [ProblemArea.SLEEP_PROBLEMS]: 'Проблемы со сном',
    [ProblemArea.ANGER_MANAGEMENT]: 'Управление гневом',
    [ProblemArea.IDENTITY]: 'Вопросы идентичности',
    [ProblemArea.LIFE_TRANSITIONS]: 'Жизненные переходы',
    [ProblemArea.CAREER]: 'Карьера',
    [ProblemArea.PARENTING]: 'Родительство',
    [ProblemArea.SEXUAL_ISSUES]: 'Сексуальные вопросы',
    [ProblemArea.LGBTQ_ISSUES]: 'ЛГБТК+ вопросы',
    [ProblemArea.SOCIAL_ANXIETY]: 'Социальная тревога',
    [ProblemArea.PANIC_ATTACKS]: 'Панические атаки',
    [ProblemArea.OCD]: 'ОКР',
    [ProblemArea.PTSD]: 'ПТСР',
    [ProblemArea.BIPOLAR]: 'Биполярное расстройство',
    [ProblemArea.ADHD]: 'СДВГ',
    [ProblemArea.AUTISM_SPECTRUM]: 'РАС',
    [ProblemArea.CHRONIC_PAIN]: 'Хроническая боль',
    [ProblemArea.CODEPENDENCY]: 'Созависимость',
};

export const getProblemAreaLabel = (area: ProblemArea): string => {
    return problemAreaLabels[area] ?? area;
};
