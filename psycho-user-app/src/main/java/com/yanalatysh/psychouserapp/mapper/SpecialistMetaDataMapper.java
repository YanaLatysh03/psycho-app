package com.yanalatysh.psychouserapp.mapper;

import com.yanalatysh.psychouserapp.dto.SpecialistMetaDataResponseDTO;
import com.yanalatysh.psychouserapp.entity.SpecialistMetaData;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SpecialistMetaDataMapper {
    SpecialistMetaDataResponseDTO fromSpecialistMetaDataToResponseDto(SpecialistMetaData specialistMetaData);
}
