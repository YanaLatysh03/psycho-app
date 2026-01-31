package com.yanalatysh.psychoapp.controller;

import com.yanalatysh.psychoapp.dto.CreateTestRequestDTO;
import com.yanalatysh.psychoapp.dto.TestDTO;
import com.yanalatysh.psychoapp.service.AdminTestService;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/v1/api/tests/admin")
@Data
public class AdminTestController {

    private final AdminTestService adminTestService;

    @PostMapping("/")
    public ResponseEntity<TestDTO> createTest(
            @Valid @RequestBody CreateTestRequestDTO request
    ) {
        var testDto = adminTestService.createTest(request);
        return ResponseEntity.ok(testDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable Long id) {
        adminTestService.deleteTest(id);
        return ResponseEntity.ok().build();
    }
}
