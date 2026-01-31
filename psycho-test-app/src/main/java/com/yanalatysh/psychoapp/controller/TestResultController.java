package com.yanalatysh.psychoapp.controller;

import com.yanalatysh.psychoapp.dto.TestResultDTO;
import com.yanalatysh.psychoapp.dto.TestResultDetailsDTO;
import com.yanalatysh.psychoapp.service.TestResultService;
import com.yanalatysh.psychoapp.util.CurrentUserId;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/api/tests/results")
@Data
public class TestResultController {

    private final TestResultService testResultService;

    @GetMapping("/by-user")
    @PreAuthorize("hasAnyRole('SPECIALIST', 'USER')")
    public ResponseEntity<List<TestResultDTO>> getResultsByUserId(@CurrentUserId Long userId) {
        var results = testResultService.getResultsByUserId(userId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SPECIALIST', 'USER')")
    public ResponseEntity<TestResultDTO> getResultById(@PathVariable Long id) {
        var result = testResultService.getResultById(id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/by-test/{testId}")
    @PreAuthorize("hasRole('SPECIALIST')")
    public ResponseEntity<List<TestResultDTO>> getResultsByTestId(@PathVariable Long testId) {
        var results = testResultService.getResultsByTestId(testId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/details/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TestResultDetailsDTO> getResultDetailsById(@PathVariable Long id) {
        var result = testResultService.getResultDetailsById(id);
        return ResponseEntity.ok(result);
    }
}
