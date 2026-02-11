package com.yanalatysh.psychoapp.controller;

import com.yanalatysh.psychoapp.dto.TestDTO;
import com.yanalatysh.psychoapp.dto.TestDetailsDTO;
import com.yanalatysh.psychoapp.dto.TestResultDTO;
import com.yanalatysh.psychoapp.rq.SubmitTestRq;
import com.yanalatysh.psychoapp.service.TestService;
import com.yanalatysh.psychoapp.util.CurrentUserId;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/api/tests")
@Data
public class TestController {

    private final TestService testService;

    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN', 'SPECIALIST', 'USER')")
    public ResponseEntity<List<TestDTO>> getAllTests() {
        List<TestDTO> tests = testService.getAllTests();
        return ResponseEntity.ok(tests);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SPECIALIST', 'USER')")
    public ResponseEntity<TestDetailsDTO> getTestById(@PathVariable Long id) {
        var test = testService.getTestById(id);
        return ResponseEntity.ok(test);
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SPECIALIST', 'USER')")
    public ResponseEntity<List<TestDTO>> getTestsByCategory(@PathVariable Long categoryId) {
        var tests = testService.getTestsByCategoryId(categoryId);
        return ResponseEntity.ok(tests);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TestResultDTO> submitTest(
            @PathVariable Long id,
            @Valid @RequestBody SubmitTestRq request,
            @CurrentUserId Long userId
    ) {
        var testResult = testService.submitTest(id, request, userId);
        return ResponseEntity.ok(testResult);
    }
}
