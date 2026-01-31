package com.yanalatysh.psychoapp.service;

import com.yanalatysh.psychoapp.dto.CreateCategoryDTO;
import com.yanalatysh.psychoapp.dto.TestCategoryDTO;
import com.yanalatysh.psychoapp.entity.Category;
import com.yanalatysh.psychoapp.mapper.TestCategoryMapper;
import com.yanalatysh.psychoapp.repository.TestCategoryRepository;
import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Data
public class TestCategoryService {

    private final TestCategoryRepository categoryRepository;
    private final TestCategoryMapper categoryMapper;

    public List<TestCategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::fromCategoryToTestCategoryDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TestCategoryDTO createCategory(CreateCategoryDTO categoryDTO) {
        if (categoryRepository.existsByNameIgnoreCase(categoryDTO.getName())) {
            throw new RuntimeException("Category with name '" + categoryDTO.getName() + "' already exists");
        }

        var category = new Category();
        category.setName(categoryDTO.getName());
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        category = categoryRepository.save(category);

        return categoryMapper.fromCategoryToTestCategoryDTO(category);
    }

    public void deleteCategory(Long id) {
        var category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        categoryRepository.delete(category);
    }
}
