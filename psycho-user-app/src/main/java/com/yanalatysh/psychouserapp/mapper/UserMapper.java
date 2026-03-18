package com.yanalatysh.psychouserapp.mapper;

import com.yanalatysh.psychouserapp.dto.AdminSearchUsersDTO;
import com.yanalatysh.psychouserapp.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    AdminSearchUsersDTO fromUserToDto(User user);
}
