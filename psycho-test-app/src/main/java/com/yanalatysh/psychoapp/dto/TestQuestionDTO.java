package com.yanalatysh.psychoapp.dto;

import com.yanalatysh.psychoapp.entity.AnswerOption;
import lombok.Data;

import java.util.List;

@Data
public class TestQuestionDTO {
    private Long id;
    private String question;
    private Integer minScore;
    private Integer maxScore;
    private Long testId;
    private List<AnswerOptionDTO> answerOptions;
}
