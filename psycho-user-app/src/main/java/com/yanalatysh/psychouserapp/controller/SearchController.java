package com.yanalatysh.psychouserapp.controller;

import com.yanalatysh.psychouserapp.dto.ProfileResponseDTO;
import com.yanalatysh.psychouserapp.dto.SpecialistSearchCriteriaDTO;
import com.yanalatysh.psychouserapp.dto.UserSearchCriteriaDTO;
import com.yanalatysh.psychouserapp.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/api/search")
public class SearchController {

    private final ProfileService profileService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('SPECIALIST')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<ProfileResponseDTO>> searchUsers(
            @Valid @ModelAttribute UserSearchCriteriaDTO criteria) {

        return ResponseEntity.ok(profileService.searchUsers(criteria));
    }

    @GetMapping("/specialists")
    @PreAuthorize("hasRole('USER')")
    @Operation(security = @SecurityRequirement(name = "BearerAuthentication"))
    public ResponseEntity<List<ProfileResponseDTO>> searchSpecialists(
            @Valid @ModelAttribute SpecialistSearchCriteriaDTO criteria) {

        return ResponseEntity.ok(profileService.searchSpecialists(criteria));
    }
}
