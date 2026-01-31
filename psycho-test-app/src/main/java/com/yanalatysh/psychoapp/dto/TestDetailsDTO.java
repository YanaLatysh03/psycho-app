package com.yanalatysh.psychoapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class TestDetailsDTO {
    private Long id;
    private String name;
    private String description;
    private Integer minScore;
    private Integer maxScore;
    private Long categoryId;
    private String categoryName;
    private List<TestQuestionDTO> testQuestions;
}
