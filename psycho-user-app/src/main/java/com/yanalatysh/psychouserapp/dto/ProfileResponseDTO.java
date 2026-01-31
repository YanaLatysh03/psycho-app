package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.Gender;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProfileResponseDTO {
    private Long userId;
    private String name;
    private String city;
    private Gender gender;
    private String phone;
    private LocalDate birthday;

    // Метаданные (опционально, в зависимости от роли)
    private SpecialistMetaDataResponseDTO specialistMetaData;
    private UserMetaDataResponseDTO userMetaData;
}

