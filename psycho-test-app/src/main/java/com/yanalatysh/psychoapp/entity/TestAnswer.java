package com.yanalatysh.psychoapp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "test_answers")
public class TestAnswer {
    @EmbeddedId
    private TestAnswerId id;

    @Column(name = "answer")
    private String answer;

    @Column(name = "score")
    private int score;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @MapsId("testQuestionId")
    @JoinColumn(name = "test_question_id")
    private TestQuestion testQuestion;

    @ManyToOne
    @MapsId("testResultId")
    @JoinColumn(name = "test_result_id")
    private TestResult testResult;
}
