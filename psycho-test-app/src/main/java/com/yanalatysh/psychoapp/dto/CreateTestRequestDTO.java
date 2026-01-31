package com.yanalatysh.psychoapp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateTestRequestDTO {
    @NotBlank(message = "Test name is required")
    @Size(max = 255, message = "Test name must not exceed 255 characters")
    private String name;

    private String description;

    @NotNull(message = "Min score is required")
    private Integer minScore;

    @NotNull(message = "Max score is required")
    private Integer maxScore;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Valid
    @NotNull(message = "Questions are required")
    @Size(min = 1, message = "Test must have at least one question")
    private List<CreateQuestionDTO> questions;
}
