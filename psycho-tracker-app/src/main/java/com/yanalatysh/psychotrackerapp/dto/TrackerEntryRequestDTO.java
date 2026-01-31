package com.yanalatysh.psychotrackerapp.dto;

import com.yanalatysh.psychotrackerapp.entity.Emotion;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class TrackerEntryRequestDTO {
    private String thoughts;

    @Min(value = 1, message = "Уровень мыслей должен быть от 1 до 10")
    @Max(value = 10, message = "Уровень мыслей должен быть от 1 до 10")
    private Integer thoughtsLevel;

    private Set<Emotion> emotions;

    @Min(value = 1, message = "Уровень энергии должен быть от 1 до 10")
    @Max(value = 10, message = "Уровень энергии должен быть от 1 до 10")
    private Integer energyLevel;

    @Min(value = 1, message = "Качество сна должно быть от 1 до 10")
    @Max(value = 10, message = "Качество сна должно быть от 1 до 10")
    private Integer sleepQuality;

    @Min(value = 1, message = "Уровень стресса должен быть от 1 до 10")
    @Max(value = 10, message = "Уровень стресса должен быть от 1 до 10")
    private Integer stressLevel;

    private String stressTriggers;

    @Min(value = 1, message = "Уровень продуктивности должен быть от 1 до 10")
    @Max(value = 10, message = "Уровень продуктивности должен быть от 1 до 10")
    private Integer productivityLevel;

    private LocalDateTime entryDatetime; // опционально, если не указано - текущее время
}
