package com.yanalatysh.psychoapp.dto;

import lombok.Data;

@Data
public class TestAnswerDTO {
    private Long testQuestionId;
    private String questionText;
    private String answer;
    private Integer score;
}
