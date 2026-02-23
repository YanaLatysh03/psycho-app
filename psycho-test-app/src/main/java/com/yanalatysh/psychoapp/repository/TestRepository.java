package com.yanalatysh.psychoapp.repository;

import com.yanalatysh.psychoapp.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TestRepository extends JpaRepository<Test, Long> {

    @Query("SELECT t FROM Test t WHERE t.category.id = :categoryId")
    List<Test> findAllByCategoryId(@Param("categoryId") Long categoryId);

    @Query(value = "SELECT t.* FROM test t " +
            "LEFT JOIN test_results tr ON tr.test_id = t.id AND tr.user_id = :userId " +
            "WHERE tr.id IS NULL " +
            "OR (SELECT MAX(tr2.test_datetime) FROM test_results tr2 " +
            "WHERE tr2.test_id = t.id AND tr2.user_id = :userId) < :date " +
            "ORDER BY RANDOM() " +
            "LIMIT 3",
            nativeQuery = true)
    List<Test> getSuggestedTestsByUser(@Param("userId") Long userId,
                                       @Param("date") LocalDate date);
}
