package com.yanalatysh.psychoapp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "test_results")
public class TestResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "test_datetime")
    private LocalDateTime testDatetime;

    @Column(name = "score")
    private int score;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;

    @OneToMany(
            mappedBy = "testResult",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<TestAnswer> testAnswers;
}
