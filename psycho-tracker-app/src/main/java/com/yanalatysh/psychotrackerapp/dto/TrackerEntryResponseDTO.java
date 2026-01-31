package com.yanalatysh.psychotrackerapp.dto;

import com.yanalatysh.psychotrackerapp.entity.Emotion;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class TrackerEntryResponseDTO {
    private Long id;
    private LocalDateTime entryDatetime;
    private String thoughts;
    private Integer thoughtsLevel;
    private Set<Emotion> emotions;
    private Integer energyLevel;
    private Integer sleepQuality;
    private Integer stressLevel;
    private String stressTriggers;
    private Integer productivityLevel;
    private Long userId;
}
