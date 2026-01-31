package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.ProblemArea;
import com.yanalatysh.psychouserapp.entity.TargetAudience;
import com.yanalatysh.psychouserapp.entity.TherapyApproach;
import com.yanalatysh.psychouserapp.entity.WorkFormat;
import lombok.Data;

import java.util.Set;

@Data
public class SpecialistMetaDataResponseDTO {
    // Образование и квалификация
    private String education;
    private String specialization;

    // Опыт работы
    private Integer yearsOfExperience;

    // Направления и методы работы
    private Set<TherapyApproach> approaches;
    private Set<ProblemArea> problemAreas;
    private Set<WorkFormat> workFormats;
    private Set<TargetAudience> targetAudiences;

    // Условия работы
    private Integer sessionPrice;
    private Integer sessionDuration;
    private Boolean providesFreeConsultation;

    // Рейтинг
    private Double rating;
}
