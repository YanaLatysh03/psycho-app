package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequestDTO {
    private String name;
    private Gender gender;
    private String city;
    private String phone;
    private LocalDate birthday;

    // Метаданные (опционально, в зависимости от роли)
    private CreateSpecialistMetaDataDTO specialistMetaData;
    private CreateUserMetaDataDTO userMetaData;
}

