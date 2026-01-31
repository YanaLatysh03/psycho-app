package com.yanalatysh.psychoapp.repository;

import com.yanalatysh.psychoapp.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TestRepository extends JpaRepository<Test, Long> {

    @Query("SELECT t FROM Test t WHERE t.category.id = :categoryId")
    List<Test> findAllByCategoryId(@Param("categoryId") Long categoryId);
}
