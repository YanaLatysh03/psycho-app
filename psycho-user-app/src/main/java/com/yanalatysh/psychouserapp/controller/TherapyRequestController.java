package com.yanalatysh.psychouserapp.controller;

import com.yanalatysh.psychouserapp.dto.CreateRequestRequestDTO;
import com.yanalatysh.psychouserapp.dto.TherapyRequestResponseDTO;
import com.yanalatysh.psychouserapp.service.TherapyRequestService;
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
@RequestMapping("/v1/api/therapy-requests")
public class TherapyRequestController {
    private final TherapyRequestService therapyRequestService;

    @PostMapping("/sent/{specialistId}")
    @PreAuthorize("hasRole('USER')")
    @Operation(
            summary = "Отправить запрос специалисту на установление связи",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<TherapyRequestResponseDTO> sendRequestToSpecialist(
            @CurrentUserId Long userId,
            @PathVariable Long specialistId,
            @RequestBody CreateRequestRequestDTO request
    ){
        var createdRequest = therapyRequestService.createRequestToSpecialist(userId, specialistId, request);
        return ResponseEntity.ok(createdRequest);
    }

    @GetMapping("/incoming")
    @PreAuthorize("hasRole('SPECIALIST')")
    @Operation(
            summary = "Получить все запросы на установление связи от пользователей",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<TherapyRequestResponseDTO>> getRequestsFromUsers(
            @CurrentUserId Long userId) {

        var requests = therapyRequestService.getRequestsFromUsersBySpecialistId(userId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    @Operation(
            summary = "Получить все запросы пользователя на установление связи со специалистом",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<TherapyRequestResponseDTO>> getMyRequests(
            @CurrentUserId Long userId) {
        var requests = therapyRequestService.getRequestsByUserId(userId);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('SPECIALIST')")
    @Operation(
            summary = "Одобрить запрос на установление связи от пользователя",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<TherapyRequestResponseDTO> acceptRequest(
            @PathVariable Long id,
            @CurrentUserId Long specialistId) {
        var request = therapyRequestService.acceptRequest(id,specialistId);
        return ResponseEntity.ok(request);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('SPECIALIST')")
    @Operation(
            summary = "Отклонить запрос на установление связи от пользователя",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<TherapyRequestResponseDTO> rejectRequest(
            @PathVariable Long id,
            @CurrentUserId Long specialistId) {
        var request = therapyRequestService.rejectRequest(id, specialistId);
        return ResponseEntity.ok(request);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    @Operation(
            summary = "Отменить запрос на установление связи пользователем",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<Void> cancelRequest(
            @PathVariable Long id,
            @CurrentUserId Long userId
    ) {
        therapyRequestService.cancelRequest(id, userId);
        return ResponseEntity.ok().build();
    }
}
