package com.yanalatysh.psychouserapp.controller;

import com.yanalatysh.psychouserapp.dto.AdminSearchUsersDTO;
import com.yanalatysh.psychouserapp.dto.UpdatePasswordRequestDTO;
import com.yanalatysh.psychouserapp.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/api/admin")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<AdminSearchUsersDTO>> searchUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(adminService.searchUsers(page, size));
    }

    @PatchMapping("/users/{userId}/password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<Void> updateUserPassword(
            @PathVariable Long userId,
            @RequestBody UpdatePasswordRequestDTO request
    ) {
        adminService.updateUserPassword(userId, request.getPassword());
        return ResponseEntity.ok().build();
    }
}
