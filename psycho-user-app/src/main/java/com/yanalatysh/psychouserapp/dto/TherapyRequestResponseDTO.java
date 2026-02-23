package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TherapyRequestResponseDTO {
    private Long id;
    private Long userId;
    private Long specialistId;
    private RequestStatus status = RequestStatus.PENDING;
    private String message; // Сообщение от пациента
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
