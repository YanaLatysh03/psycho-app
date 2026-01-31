package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.ProblemArea;
import com.yanalatysh.psychouserapp.entity.TargetAudience;
import com.yanalatysh.psychouserapp.entity.TherapyApproach;
import com.yanalatysh.psychouserapp.entity.WorkFormat;
import lombok.Data;

import java.util.Set;

@Data
public class CreateSpecialistMetaDataDTO {
    // Образование
    private String education;
    private String specialization;

    // Опыт
    private Integer yearsOfExperience;

    // Подходы и методы
    private Set<TherapyApproach> approaches;
    private Set<ProblemArea> problemAreas;
    private Set<WorkFormat> workFormats;
    private Set<TargetAudience> targetAudiences;

    // Условия работы
    private Integer sessionPrice;
    private Integer sessionDuration;
    private Boolean providesFreeConsultation;
}
