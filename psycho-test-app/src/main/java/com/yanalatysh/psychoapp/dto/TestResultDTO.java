package com.yanalatysh.psychoapp.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestResultDTO {
    private Long id;
    private LocalDateTime testDatetime;
    private int score;
    private Long testId;
    private String testName;
    private Long userId;
    private String interpretation;
}
