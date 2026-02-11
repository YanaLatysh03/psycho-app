package com.yanalatysh.psychotrackerapp.dto;

import com.yanalatysh.psychotrackerapp.entity.Emotion;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TrackerEntrySummaryResponseDTO {
    private Long id;
    private LocalDateTime entryDatetime;
    private List<Emotion> emotionsSummary;
    private Long userId;
}
