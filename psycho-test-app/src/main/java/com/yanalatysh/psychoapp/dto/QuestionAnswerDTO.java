package com.yanalatysh.psychoapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionAnswerDTO {
    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotNull(message = "Answer option ID is required")
    private Long answerOptionId;
}
