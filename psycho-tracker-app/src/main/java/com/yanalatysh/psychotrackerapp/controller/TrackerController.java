package com.yanalatysh.psychotrackerapp.controller;

import com.yanalatysh.psychotrackerapp.dto.TrackerEntryRequestDTO;
import com.yanalatysh.psychotrackerapp.dto.TrackerEntryResponseDTO;
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
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<TrackerEntryResponseDTO> createEntry(
            @CurrentUserId Long userId,
            @Valid @RequestBody TrackerEntryRequestDTO request) {
        var response = trackerService.createEntry(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<TrackerEntryResponseDTO>> getAllEntries(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var entries = trackerService.getAllUserEntries(userId, page, size);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/by-date-range")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<TrackerEntryResponseDTO>> getEntriesByDateRange(
            @CurrentUserId Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var entries = trackerService.getEntriesByDateRange(userId, start, end, page, size);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/{id}")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<TrackerEntryResponseDTO> getEntryById(
            @CurrentUserId Long userId,
            @PathVariable Long id) {
        var response = trackerService.getEntryById(userId, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<TrackerEntryResponseDTO> updateEntry(
            @CurrentUserId Long userId,
            @PathVariable Long id,
            @Valid @RequestBody TrackerEntryRequestDTO request) {
        var response = trackerService.updateEntry(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<Void> deleteEntry(
            @CurrentUserId Long userId,
            @PathVariable Long id) {
        trackerService.deleteEntry(userId, id);
        return ResponseEntity.noContent().build();
    }
}
