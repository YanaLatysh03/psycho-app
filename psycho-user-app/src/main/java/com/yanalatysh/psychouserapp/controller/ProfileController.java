package com.yanalatysh.psychouserapp.controller;

import com.yanalatysh.psychouserapp.dto.*;
import com.yanalatysh.psychouserapp.service.ProfileService;
import com.yanalatysh.psychouserapp.util.CurrentUserId;
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
@RequestMapping("/v1/api/users/profile")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<ProfileResponseDTO> getProfile(
            @CurrentUserId Long userId) {
        var response = profileService.getProfile(userId);
        return ResponseEntity.ok(response);
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

}
