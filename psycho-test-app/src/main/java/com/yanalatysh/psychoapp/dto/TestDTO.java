package com.yanalatysh.psychoapp.dto;

import lombok.Data;

@Data
public class TestDTO {
    private Long id;
    private String name;
    private String description;
    private Integer minScore;
    private Integer maxScore;
    private Long categoryId;
    private String categoryName;
}
