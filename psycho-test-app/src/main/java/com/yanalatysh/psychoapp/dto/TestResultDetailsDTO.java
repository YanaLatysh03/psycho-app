package com.yanalatysh.psychoapp.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TestResultDetailsDTO {
    private Long id;
    private LocalDateTime testDatetime;
    private int score;
    private Long testId;
    private String testName;
    private Long userId;
    private String interpretation;
    private List<TestAnswerDTO> testAnswers;
}
