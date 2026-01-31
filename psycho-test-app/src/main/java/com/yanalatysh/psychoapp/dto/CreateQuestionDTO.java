package com.yanalatysh.psychoapp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateQuestionDTO {
    @NotBlank(message = "Question text is required")
    @Size(max = 500, message = "Question text must not exceed 500 characters")
    private String question;

    @NotNull(message = "Min score is required")
    private Integer minScore;

    @NotNull(message = "Max score is required")
    private Integer maxScore;

    @Valid
    @NotNull(message = "Answer options are required")
    @Size(min = 2, message = "Question must have at least 2 answer options")
    private List<CreateAnswerOptionDTO> answerOptions;
}
