package com.yanalatysh.psychouserapp.controller;

import com.yanalatysh.psychouserapp.dto.*;
import com.yanalatysh.psychouserapp.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/api/users")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/{userId}")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<ProfileResponseDTO> getProfile(@PathVariable Long userId) {
        var response = profileService.getProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{userId}/profile")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<ProfileResponseDTO> createProfile(
            @PathVariable Long userId,
            @RequestBody CreateProfileRequestDTO request) {
        var response = profileService.createProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{userId}/profile")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<ProfileResponseDTO> updateProfile(
            @PathVariable Long userId,
            @RequestBody UpdateProfileRequestDTO request) {
        var response = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search/users")
    @PreAuthorize("hasRole('SPECIALIST')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<ProfileResponseDTO>> searchUsers(
            @Valid @ModelAttribute UserSearchCriteriaDTO criteria) {

        return ResponseEntity.ok(profileService.searchUsers(criteria));
    }

    @GetMapping("/search/specialists")
    @PreAuthorize("hasRole('USER')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<ProfileResponseDTO>> searchSpecialists(
            @Valid @ModelAttribute SpecialistSearchCriteriaDTO criteria) {

        return ResponseEntity.ok(profileService.searchSpecialists(criteria));
    }

}
