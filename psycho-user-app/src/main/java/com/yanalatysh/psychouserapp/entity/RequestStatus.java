package com.yanalatysh.psychouserapp.entity;

public enum RequestStatus {
    PENDING,   // Ожидает ответа
    ACCEPTED,  // Принят (→ currentTherapistId заполняется)
    REJECTED,  // Отклонен
    CANCELLED  // Отменен пациентом
}
