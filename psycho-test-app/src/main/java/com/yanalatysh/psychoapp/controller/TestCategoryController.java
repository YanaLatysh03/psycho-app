package com.yanalatysh.psychoapp.controller;

import com.yanalatysh.psychoapp.dto.CreateCategoryDTO;
import com.yanalatysh.psychoapp.dto.TestCategoryDTO;
import com.yanalatysh.psychoapp.dto.TestDTO;
import com.yanalatysh.psychoapp.rq.SubmitTestRq;
import com.yanalatysh.psychoapp.service.TestCategoryService;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('ADMIN', 'SPECIALIST', 'USER')")
@RequestMapping("/v1/api/tests/category")
@Data
public class TestCategoryController {

    private final TestCategoryService categoryService;

    @GetMapping("/")
    public ResponseEntity<List<TestCategoryDTO>> getAllCategories() {
        var categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/")
    public ResponseEntity<TestCategoryDTO> createCategory(
            @Valid @RequestBody CreateCategoryDTO request
    ) {
        var category = categoryService.createCategory(request);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<List<TestCategoryDTO>> DeleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
