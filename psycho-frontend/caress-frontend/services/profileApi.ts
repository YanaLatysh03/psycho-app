const API_BASE_URL = 'http://localhost:8081/v1/api';

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE'
}

export enum ProblemArea {
    ANXIETY = 'ANXIETY',
    DEPRESSION = 'DEPRESSION',
    STRESS = 'STRESS',
    BURNOUT = 'BURNOUT',
    RELATIONSHIPS = 'RELATIONSHIPS',
    SELF_ESTEEM = 'SELF_ESTEEM',
    TRAUMA = 'TRAUMA',
    GRIEF = 'GRIEF',
    ADDICTION = 'ADDICTION',
    EATING_DISORDERS = 'EATING_DISORDERS',
    SLEEP_PROBLEMS = 'SLEEP_PROBLEMS',
    ANGER_MANAGEMENT = 'ANGER_MANAGEMENT',
    IDENTITY = 'IDENTITY',
    LIFE_TRANSITIONS = 'LIFE_TRANSITIONS',
    CAREER = 'CAREER',
    PARENTING = 'PARENTING',
    SEXUAL_ISSUES = 'SEXUAL_ISSUES',
    LGBTQ_ISSUES = 'LGBTQ_ISSUES',
    SOCIAL_ANXIETY = 'SOCIAL_ANXIETY',
    PANIC_ATTACKS = 'PANIC_ATTACKS',
    OCD = 'OCD',
    PTSD = 'PTSD',
    BIPOLAR = 'BIPOLAR',
    ADHD = 'ADHD',
    AUTISM_SPECTRUM = 'AUTISM_SPECTRUM',
    CHRONIC_PAIN = 'CHRONIC_PAIN',
    CODEPENDENCY = 'CODEPENDENCY'
}

export enum TherapyApproach {
    CBT = 'CBT',
    PSYCHOANALYSIS = 'PSYCHOANALYSIS',
    GESTALT = 'GESTALT',
    EXISTENTIAL = 'EXISTENTIAL',
    HUMANISTIC = 'HUMANISTIC',
    SYSTEMIC = 'SYSTEMIC',
    PSYCHODYNAMIC = 'PSYCHODYNAMIC',
    ACT = 'ACT',
    DBT = 'DBT',
    EMDR = 'EMDR',
    ART_THERAPY = 'ART_THERAPY',
    BODY_ORIENTED = 'BODY_ORIENTED',
    SCHEMA_THERAPY = 'SCHEMA_THERAPY',
    INTEGRATIVE = 'INTEGRATIVE'
}

export enum WorkFormat {
    ONLINE = 'ONLINE',
    IN_PERSON = 'IN_PERSON',
    HYBRID = 'HYBRID',
    INDIVIDUAL = 'INDIVIDUAL',
    COUPLES = 'COUPLES',
    FAMILY = 'FAMILY',
    GROUP = 'GROUP',
    WORKSHOPS = 'WORKSHOPS'
}

export enum TargetAudience {
    ADULTS = 'ADULTS',
    TEENAGERS = 'TEENAGERS',
    CHILDREN = 'CHILDREN',
    ELDERLY = 'ELDERLY',
    COUPLES = 'COUPLES',
    FAMILIES = 'FAMILIES',
    LGBTQ = 'LGBTQ',
    EXPATS = 'EXPATS',
    STUDENTS = 'STUDENTS',
    PROFESSIONALS = 'PROFESSIONALS'
}

export interface SpecialistMetaData {
    education: string;
    specialization: string;
    yearsOfExperience: number;
    approaches: TherapyApproach[];
    problemAreas: ProblemArea[];
    workFormats: WorkFormat[];
    targetAudiences: TargetAudience[];
    sessionPrice: number;
    sessionDuration: number;
    providesFreeConsultation: boolean;
    rating?: number;
}

export interface UserMetaData {
    problemAreas: ProblemArea[];
    therapyGoals: string;
    currentSituation: string;
    inCrisis: boolean;
    totalSessionsAttended?: number;
    currentTherapistId?: number;
    therapyStartDate?: string;
}

export interface ProfileResponse {
    userId: number;
    name: string;
    city: string;
    gender: Gender;
    phone: string;
    birthday: string; // LocalDate в ISO формате
    specialistMetaData?: SpecialistMetaData;
    userMetaData?: UserMetaData;
}

export interface CreateProfileRequest {
    name: string;
    gender: Gender;
    city: string;
    phone: string;
    birthday: string; // LocalDate в ISO формате (YYYY-MM-DD)
    specialistMetaData?: Partial<SpecialistMetaData>;
    userMetaData?: Partial<UserMetaData>;
}

export interface UpdateProfileRequest {
    name: string;
    gender: Gender;
    city: string;
    phone: string;
    birthday: string;
    specialistMetaData?: Partial<SpecialistMetaData>;
    userMetaData?: Partial<UserMetaData>;
}

export const profileApi = {
    // Получить профиль текущего пользователя
    async getProfile(token?: string): Promise<ProfileResponse> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'GET',
            headers,
        });

        // Профиль не найден (пустой профиль)
        if (response.status === 204 || response.status === 404) {
            throw new Error('PROFILE_NOT_FOUND');
        }

        // Другие ошибки
        if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        return response.json();
    },

    // Создать профиль
    async createProfile(profile: CreateProfileRequest, token?: string): Promise<ProfileResponse> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'POST',
            headers,
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error(`Failed to create profile: ${response.status}`);
        }

        return response.json();
    },

    // Обновить профиль
    async updateProfile(profile: UpdateProfileRequest, token?: string): Promise<ProfileResponse> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error(`Failed to update profile: ${response.status}`);
        }

        return response.json();
    },

    // Получить список моих пациентов
    async getUserProfileByUserId(userId: number, token?: string): Promise<ProfileResponse> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch patients: ${response.status}`);
        }

        return response.json();
    },
};

export const getTherapyApproachLabel = (approach: TherapyApproach): string => {
    const labels: Record<TherapyApproach, string> = {
        CBT: 'КПТ',
        PSYCHOANALYSIS: 'Психоанализ',
        GESTALT: 'Гештальт',
        EXISTENTIAL: 'Экзистенциальная',
        HUMANISTIC: 'Гуманистическая',
        SYSTEMIC: 'Системная',
        PSYCHODYNAMIC: 'Психодинамическая',
        ACT: 'ACT',
        DBT: 'DBT',
        EMDR: 'EMDR',
        ART_THERAPY: 'Арт-терапия',
        BODY_ORIENTED: 'Телесно-ориентированная',
        SCHEMA_THERAPY: 'Схема-терапия',
        INTEGRATIVE: 'Интегративный'
    };
    return labels[approach];
};

export const getWorkFormatLabel = (format: WorkFormat): string => {
    const labels: Record<WorkFormat, string> = {
        ONLINE: 'Онлайн',
        IN_PERSON: 'Очно',
        HYBRID: 'Гибрид',
        INDIVIDUAL: 'Индивидуальные',
        COUPLES: 'Парная терапия',
        FAMILY: 'Семейная терапия',
        GROUP: 'Групповая терапия',
        WORKSHOPS: 'Семинары/воркшопы'
    };
    return labels[format];
};

export const getTargetAudienceLabel = (audience: TargetAudience): string => {
    const labels: Record<TargetAudience, string> = {
        ADULTS: 'Взрослые',
        TEENAGERS: 'Подростки',
        CHILDREN: 'Дети',
        ELDERLY: 'Пожилые',
        COUPLES: 'Пары',
        FAMILIES: 'Семьи',
        LGBTQ: 'ЛГБТК+',
        EXPATS: 'Экспаты',
        STUDENTS: 'Студенты',
        PROFESSIONALS: 'Профессионалы'
    };
    return labels[audience];
};
