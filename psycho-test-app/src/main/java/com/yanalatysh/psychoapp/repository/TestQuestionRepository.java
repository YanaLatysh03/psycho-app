package com.yanalatysh.psychoapp.repository;

import com.yanalatysh.psychoapp.entity.TestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestQuestionRepository extends JpaRepository<TestQuestion, Long> {
}
