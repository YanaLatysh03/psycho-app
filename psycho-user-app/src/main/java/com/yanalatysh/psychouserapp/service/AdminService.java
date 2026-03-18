package com.yanalatysh.psychouserapp.service;

import com.yanalatysh.psychouserapp.dto.AdminSearchUsersDTO;
import com.yanalatysh.psychouserapp.dto.ProfileResponseDTO;
import com.yanalatysh.psychouserapp.dto.UserSearchCriteriaDTO;
import com.yanalatysh.psychouserapp.entity.User;
import com.yanalatysh.psychouserapp.mapper.UserMapper;
import com.yanalatysh.psychouserapp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public List<AdminSearchUsersDTO> searchUsers(int page, int size) {
        var pageable = PageRequest.of(page, size);

        var result = userRepository.findAll(pageable);
        return result.map(userMapper::fromUserToDto).stream().toList();
    }

    public void updateUserPassword(Long userId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
    }
}
