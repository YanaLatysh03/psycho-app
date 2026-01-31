package com.yanalatysh.psychouserapp.mapper;

import com.yanalatysh.psychouserapp.dto.ProfileResponseDTO;
import com.yanalatysh.psychouserapp.entity.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {SpecialistMetaDataMapper.class, UserMetaDataMapper.class})
public interface ProfileMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "specialistMetaData", target = "specialistMetaData")
    @Mapping(source = "userMetaData", target = "userMetaData")
    ProfileResponseDTO fromProfileToProfileResponseDTO(Profile profile);
}
