package com.yanalatysh.psychouserapp.dto;

import com.yanalatysh.psychouserapp.entity.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminSearchUsersDTO {
    private Long id;
    private String email;
    private String passwordHash;
    private Role role;
    private LocalDateTime createdAt;
}
