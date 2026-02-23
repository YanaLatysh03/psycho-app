package com.yanalatysh.psychouserapp.controller;

import com.yanalatysh.psychouserapp.dto.EndTherapyRequestDTO;
import com.yanalatysh.psychouserapp.dto.ProfileResponseDTO;
import com.yanalatysh.psychouserapp.service.SpecialistService;
import com.yanalatysh.psychouserapp.util.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/api/specialist")
public class SpecialistController {
    private final SpecialistService specialistService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('SPECIALIST')")
    @Operation(
            summary = "Получить список моих пациентов",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<ProfileResponseDTO>> getMyPatients(
            @CurrentUserId Long userId) {
        return ResponseEntity.ok(specialistService.getPatientsBySpecialistId(userId));
    }

    @DeleteMapping("/patients/{userId}")
    @PreAuthorize("hasRole('SPECIALIST')")
    @Operation(
            summary = "Завершить терапию с пациентом",
            security = @SecurityRequirement(name = "BearerAuthentication")
    )
    public ResponseEntity<Void> endTherapyWithPatient(
            @CurrentUserId Long specialistId,
            @PathVariable Long userId,
            @RequestBody(required = false) EndTherapyRequestDTO request) {
        specialistService.endTherapy(specialistId, userId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/patient-connection/{specialistId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(
            summary = "Завершить терапию со специалистом",
            security = @SecurityRequirement(name = "BearerAuthentication")
    )
    public ResponseEntity<Void> endTherapyWithSpecialist(
            @CurrentUserId Long userId,
            @PathVariable Long specialistId,
            @RequestBody(required = false) EndTherapyRequestDTO request) {
        specialistService.endTherapy(specialistId, userId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/for-patient")
    @PreAuthorize("hasRole('USER')")
    @Operation(
            summary = "Получить моего терапевта",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<ProfileResponseDTO> getSpecialistForPatient(
            @CurrentUserId Long userId) {
        return ResponseEntity.ok(specialistService.getSpecialistForPatient(userId));
    }
}
