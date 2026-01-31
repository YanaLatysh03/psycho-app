package com.yanalatysh.psychotrackerapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class DailyAveragesResponseDTO {
    private LocalDate date;
    private Double avgEnergyLevel;
    private Double avgStressLevel;
    private Double avgSleepQuality;
    private Double avgProductivityLevel;
    private Long entryCount;
}
