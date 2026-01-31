package com.yanalatysh.psychoapp.repository;

import com.yanalatysh.psychoapp.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestCategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByNameIgnoreCase(String name);
}
