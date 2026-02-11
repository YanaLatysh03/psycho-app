package com.yanalatysh.psychotrackerapp.controller;

import com.yanalatysh.psychotrackerapp.dto.DailyAveragesResponseDTO;
import com.yanalatysh.psychotrackerapp.dto.StatisticsResponseDTO;
import com.yanalatysh.psychotrackerapp.service.StatisticsService;
import com.yanalatysh.psychotrackerapp.util.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/v1/api/tracker/statistics")
@RequiredArgsConstructor
@Tag(name = "Statistics", description = "Статистика и аналитика")
public class StatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping("/general")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Получить общую статистику за период",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<StatisticsResponseDTO> getStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @CurrentUserId Long userId) {
        var stats = statisticsService.getStatistics(userId, start, end);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/daily")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Получить средние показатели по дням",
            security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<DailyAveragesResponseDTO>> getDailyAverages(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @CurrentUserId Long userId) {
        var dailyAverages = statisticsService.getDailyAverages(userId, start, end);
        return ResponseEntity.ok(dailyAverages);
    }
}

