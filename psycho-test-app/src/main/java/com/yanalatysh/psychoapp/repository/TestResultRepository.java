package com.yanalatysh.psychoapp.repository;

import com.yanalatysh.psychoapp.entity.Test;
import com.yanalatysh.psychoapp.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    @Query("SELECT tr FROM TestResult tr WHERE tr.user.id = :userId")
    List<TestResult> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT tr FROM TestResult tr WHERE tr.test.id = :testId")
    List<TestResult> findAllByTestId(@Param("testId") Long testId);
}
