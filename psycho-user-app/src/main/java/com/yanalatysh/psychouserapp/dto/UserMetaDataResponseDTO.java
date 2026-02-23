package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.ProblemArea;
import lombok.Data;

import java.util.Set;

@Data
public class UserMetaDataResponseDTO {
    // Запрос на терапию
    private Set<ProblemArea> problemAreas;
    private String therapyGoals;
    private String currentSituation;

    private Long currentTherapistId;

    // Срочность и доступность
    private Boolean inCrisis;

    // Статистика
    private Integer totalSessionsAttended;
}
