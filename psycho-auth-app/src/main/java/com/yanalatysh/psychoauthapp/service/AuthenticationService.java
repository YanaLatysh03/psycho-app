package com.yanalatysh.psychoauthapp.service;

import com.yanalatysh.psychoauthapp.dto.AuthRequest;
import com.yanalatysh.psychoauthapp.dto.AuthResponse;
import com.yanalatysh.psychoauthapp.dto.RegisterRequest;
import com.yanalatysh.psychoauthapp.dto.TokenValidationResponse;
import com.yanalatysh.psychoauthapp.entity.ErrorCode;
import com.yanalatysh.psychoauthapp.entity.Role;
import com.yanalatysh.psychoauthapp.exception.AuthInvalidStateException;
import com.yanalatysh.psychoauthapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import com.yanalatysh.psychoauthapp.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthInvalidStateException(ErrorCode.E_EMAIL_ALREADY_EXISTS.name(), HttpStatus.CONFLICT);
        }

        var user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .id(user.getId())
                .token(jwtToken)
                .email(user.getEmail())
                .role("ROLE_" + user.getRole().name())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User userDetails = (User) auth.getPrincipal();

        var jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .id(userDetails.getId())
                .token(jwtToken)
                .email(userDetails.getUsername())
                // TODO: вынести получение родит в getter на класс User
                .role(userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).toList().getFirst())
                .build();
    }

    public TokenValidationResponse validateToken(String token) {
        try {
            if (!jwtService.validateToken(token)) {
                return TokenValidationResponse.builder()
                        .valid(false)
                        .message("Token is expired or invalid")
                        .build();
            }

            String email = jwtService.extractUsername(token);

            // Проверяем, существует ли пользователь
            if (!userRepository.existsByEmail(email)) {
                return TokenValidationResponse.builder()
                        .valid(false)
                        .message("User not found")
                        .build();
            }

            return TokenValidationResponse.builder()
                    .valid(true)
                    .message("Token is valid")
                    .build();
        } catch (Exception e) {
            return TokenValidationResponse.builder()
                    .valid(false)
                    .message("Token validation failed: " + e.getMessage())
                    .build();
        }
    }
}
