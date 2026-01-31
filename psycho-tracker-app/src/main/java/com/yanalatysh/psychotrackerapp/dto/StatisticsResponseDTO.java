package com.yanalatysh.psychotrackerapp.dto;

import lombok.Data;

import java.util.Map;

@Data
public class StatisticsResponseDTO {
    private Long totalEntries;
    private Double averageEnergyLevel;
    private Double averageSleepQuality;
    private Double averageStressLevel;
    private Double averageProductivityLevel;
    private Map<String, Long> emotionFrequency; // эмоция -> количество
    private TrendData energyTrend;
    private TrendData stressTrend;

    @Data
    public static class TrendData {
        private String trend; // "IMPROVING", "DECLINING", "STABLE"
        private Double changePercentage;
    }
}
