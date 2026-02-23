package com.yanalatysh.psychouserapp.controller;

import com.yanalatysh.psychouserapp.dto.CreateProfileRequestDTO;
import com.yanalatysh.psychouserapp.dto.ProfileResponseDTO;
import com.yanalatysh.psychouserapp.dto.UpdateProfileRequestDTO;
import com.yanalatysh.psychouserapp.service.ProfileService;
import com.yanalatysh.psychouserapp.util.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/api/users/profile")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<ProfileResponseDTO> getMyProfile(
            @CurrentUserId Long userId) {
        return profileService.getProfile(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('SPECIALIST', 'USER')")
    @Operation(
            summary = "Получить профиль пользователя",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<ProfileResponseDTO> getUserProfileByUserId(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId) {
        return ResponseEntity.ok(profileService.getUserProfileByUserId(currentUserId, userId));
    }

    @PostMapping
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<ProfileResponseDTO> createProfile(
            @CurrentUserId Long userId,
            @RequestBody CreateProfileRequestDTO request) {
        var response = profileService.createProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<ProfileResponseDTO> updateProfile(
            @CurrentUserId Long userId,
            @RequestBody UpdateProfileRequestDTO request) {
        var response = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/current-therapist")
    @PreAuthorize("hasRole('USER')")
    @Operation(
            summary = "Завершить терапию с текущим специалистом",
            security = @SecurityRequirement(name = "BearerAuthentication")
    )
    public ResponseEntity<Void> endCurrentTherapy(@CurrentUserId Long userId) {
        profileService.endTherapyForUser(userId);
        return ResponseEntity.noContent().build();
    }

}
