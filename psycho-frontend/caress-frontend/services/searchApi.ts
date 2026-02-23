const API_BASE_URL = 'http://localhost:8081/v1/api';

import {
    Gender,
    ProblemArea,
    TherapyApproach,
    WorkFormat,
    TargetAudience,
    SpecialistMetaData,
    getTherapyApproachLabel,
    getWorkFormatLabel,
    getTargetAudienceLabel
} from './profileApi';
import { getProblemAreaLabel } from '@/utils/problemAreaUtils';

export interface SpecialistProfile {
    userId: number;
    name: string;
    city: string;
    gender: Gender;
    phone: string;
    birthday: string;
    specialistMetaData?: SpecialistMetaData;
}

export interface SpecialistSearchCriteria {
    name?: string;
    gender?: Gender;
    ageFrom?: number;
    ageTo?: number;
    approaches?: TherapyApproach[];
    problemAreas?: ProblemArea[];
    workFormats?: WorkFormat[];
    targetAudiences?: TargetAudience[];
    minYearsOfExperience?: number;
    priceFrom?: number;
    priceTo?: number;
    providesFreeConsultation?: boolean;
    city?: string;
    minRating?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export const searchApi = {
    // Поиск специалистов
    async searchSpecialists(
        criteria: SpecialistSearchCriteria,
        token?: string
    ): Promise<SpecialistProfile[]> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Формируем query параметры
        const params = new URLSearchParams();

        if (criteria.name) params.append('name', criteria.name);
        if (criteria.gender) params.append('gender', criteria.gender);
        if (criteria.ageFrom !== undefined) params.append('ageFrom', criteria.ageFrom.toString());
        if (criteria.ageTo !== undefined) params.append('ageTo', criteria.ageTo.toString());
        if (criteria.city) params.append('city', criteria.city);
        if (criteria.minYearsOfExperience !== undefined) {
            params.append('minYearsOfExperience', criteria.minYearsOfExperience.toString());
        }
        if (criteria.priceFrom !== undefined) params.append('priceFrom', criteria.priceFrom.toString());
        if (criteria.priceTo !== undefined) params.append('priceTo', criteria.priceTo.toString());
        if (criteria.providesFreeConsultation !== undefined) {
            params.append('providesFreeConsultation', criteria.providesFreeConsultation.toString());
        }
        if (criteria.minRating !== undefined) params.append('minRating', criteria.minRating.toString());

        // Пагинация
        params.append('page', (criteria.page || 0).toString());
        params.append('size', (criteria.size || 10).toString());
        params.append('sortBy', criteria.sortBy || 'specialistMetaData.rating');
        params.append('sortDirection', criteria.sortDirection || 'DESC');

        // Множественные значения (массивы)
        criteria.approaches?.forEach(approach => params.append('approaches', approach));
        criteria.problemAreas?.forEach(area => params.append('problemAreas', area));
        criteria.workFormats?.forEach(format => params.append('workFormats', format));
        criteria.targetAudiences?.forEach(audience => params.append('targetAudiences', audience));

        const response = await fetch(`${API_BASE_URL}/search/specialists?${params.toString()}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to search specialists: ${response.status}`);
        }

        return response.json();
    },
};

// Экспорт функций локализации для переиспользования
export {
    getProblemAreaLabel,
    getTherapyApproachLabel,
    getWorkFormatLabel,
    getTargetAudienceLabel
};
