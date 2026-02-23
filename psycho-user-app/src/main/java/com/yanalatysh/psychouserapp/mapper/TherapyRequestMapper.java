package com.yanalatysh.psychouserapp.mapper;

import com.yanalatysh.psychouserapp.dto.TherapyRequestResponseDTO;
import com.yanalatysh.psychouserapp.entity.TherapyRequest;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TherapyRequestMapper {
    TherapyRequestResponseDTO fromTherapyRequestToResponseDto(TherapyRequest request);
}
