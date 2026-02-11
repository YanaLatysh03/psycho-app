package com.yanalatysh.psychoapp.controller;

import com.yanalatysh.psychoapp.dto.AnonymousTestResultDTO;
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

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TestResultDTO>> getMyTestResults(@CurrentUserId Long userId) {
        var results = testResultService.getMyTestResults(userId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('SPECIALIST')")
    public ResponseEntity<List<TestResultDTO>> getResultsByUserId(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId) {
        var results = testResultService.getResultsByUserId(userId, currentUserId);
        return ResponseEntity.ok(results);
    }

//    @GetMapping("/{id}")
//    @PreAuthorize("hasRole('USER')")
//    public ResponseEntity<TestResultDTO> getResultById(
//            @PathVariable Long id,
//            @CurrentUserId Long currentUserId) {
//        var result = testResultService.getResultById(id, currentUserId);
//        return ResponseEntity.ok(result);
//    }

    @GetMapping("/by-test/{testId}")
    @PreAuthorize("hasRole('SPECIALIST')")
    public ResponseEntity<List<AnonymousTestResultDTO>> getResultsByTestId(@PathVariable Long testId) {
        var results = testResultService.getResultsByTestId(testId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/details/{id}")
    @PreAuthorize("hasAnyRole('SPECIALIST', 'USER')")
    //TODO: возможно добавить роль 'SPECIALIST', чтобы специалист тоже мог просматривать результат теста,
    // если пациент разрешил
    public ResponseEntity<TestResultDetailsDTO> getResultDetailsById(
            @PathVariable Long id,
            @CurrentUserId Long currentUserId) {
        var result = testResultService.getResultDetailsById(id, currentUserId);
        return ResponseEntity.ok(result);
    }
}
