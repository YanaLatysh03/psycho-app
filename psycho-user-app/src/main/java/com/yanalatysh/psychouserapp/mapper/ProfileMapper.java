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
    @Mapping(target = "name", expression = "java(capitalizeWords(profile.getName()))")
    ProfileResponseDTO fromProfileToProfileResponseDTO(Profile profile);

    default String capitalizeWords(String input) {
        if (input == null || input.isBlank()) return input;
        return java.util.Arrays.stream(input.trim().split("\\s+"))
                .map(word -> word.isEmpty() ? word :
                        Character.toUpperCase(word.charAt(0)) + word.substring(1).toLowerCase())
                .collect(java.util.stream.Collectors.joining(" "));
    }
}
