package com.yanalatysh.psychoapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAnswerOptionDTO {
    @NotBlank(message = "Answer text is required")
    @Size(max = 255, message = "Answer text must not exceed 255 characters")
    private String answer;

    @NotNull(message = "Score is required")
    private Integer score;
}
