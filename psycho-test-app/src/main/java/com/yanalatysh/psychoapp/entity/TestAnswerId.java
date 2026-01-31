package com.yanalatysh.psychoapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestAnswerId implements Serializable {
    @Column(name = "test_question_id")
    private Long testQuestionId;

    @Column(name = "test_result_id")
    private Long testResultId;
}
