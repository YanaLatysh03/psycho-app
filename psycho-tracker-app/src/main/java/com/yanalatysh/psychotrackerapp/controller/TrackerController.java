package com.yanalatysh.psychotrackerapp.controller;

import com.yanalatysh.psychotrackerapp.dto.TrackerEntryDetailResponseDTO;
import com.yanalatysh.psychotrackerapp.dto.TrackerEntryRequestDTO;
import com.yanalatysh.psychotrackerapp.dto.TrackerEntrySummaryResponseDTO;
import com.yanalatysh.psychotrackerapp.service.TrackerService;
import com.yanalatysh.psychotrackerapp.util.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/v1/api/trackers")
@RequiredArgsConstructor
@Tag(name = "Tracker", description = "Трекинг психологического состояния")
public class TrackerController {
    private final TrackerService trackerService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<TrackerEntryDetailResponseDTO> createEntry(
            @CurrentUserId Long userId,
            @Valid @RequestBody TrackerEntryRequestDTO request) {
        var response = trackerService.createEntry(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<TrackerEntrySummaryResponseDTO>> getMyEntries(
            @CurrentUserId Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var entries = trackerService.getMyEntriesByDateRange(userId, start, end, page, size);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('SPECIALIST')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<TrackerEntryDetailResponseDTO>> getUserEntries(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var entries = trackerService.getEntriesByUserId(currentUserId, userId, start, end, page, size);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<TrackerEntryDetailResponseDTO> getEntryById(
            @CurrentUserId Long userId,
            @PathVariable Long id) {
        var response = trackerService.getEntryById(userId, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<TrackerEntryDetailResponseDTO> updateEntry(
            @CurrentUserId Long userId,
            @PathVariable Long id,
            @Valid @RequestBody TrackerEntryRequestDTO request) {
        var response = trackerService.updateEntry(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<Void> deleteEntry(
            @CurrentUserId Long userId,
            @PathVariable Long id) {
        trackerService.deleteEntry(userId, id);
        return ResponseEntity.noContent().build();
    }
}
