package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpecialistSearchCriteriaDTO {
    // Базовые критерии из Profile
    private String name;
    private Gender gender;
    private Integer ageFrom;
    private Integer ageTo;

    // Подходы и методы работы
    private Set<TherapyApproach> approaches; // Интересующие подходы
    private Set<ProblemArea> problemAreas;   // С какими проблемами работает
    private Set<WorkFormat> workFormats;     // Форматы работы
    private Set<TargetAudience> targetAudiences; // Целевая аудитория

    // Опыт и квалификация
    @Min(0)
    private Integer minYearsOfExperience;    // Минимальный стаж

    @Min(0)
    @Max(100000)
    private Integer priceFrom;               // Цена от

    @Min(0)
    @Max(100000)
    private Integer priceTo;                 // Цена до

    private Boolean providesFreeConsultation;

    private String city;

    @Min(0)
    @Max(5)
    private Double minRating;

    // Параметры пагинации и сортировки
    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "rating";  // поле для сортировки
    private String sortDirection = "DESC"; // ASC или DESC
}
