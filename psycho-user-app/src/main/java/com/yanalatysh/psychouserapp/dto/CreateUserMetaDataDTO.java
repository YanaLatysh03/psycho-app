package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.ProblemArea;
import lombok.Data;

import java.util.Set;

@Data
public class CreateUserMetaDataDTO {
    // Запрос на терапию
    private Set<ProblemArea> problemAreas;
    private String therapyGoals;
    private String currentSituation;

    // Срочность
    private Boolean inCrisis;
}
