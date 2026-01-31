package com.yanalatysh.psychouserapp.mapper;

import com.yanalatysh.psychouserapp.dto.UserMetaDataResponseDTO;
import com.yanalatysh.psychouserapp.entity.UserMetaData;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMetaDataMapper {
    UserMetaDataResponseDTO fromUserMetaDataToResponseMetaDataDto(UserMetaData userMetaData);
}
