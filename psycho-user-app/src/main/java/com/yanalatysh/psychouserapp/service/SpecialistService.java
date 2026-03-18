package com.yanalatysh.psychouserapp.service;

import com.yanalatysh.psychouserapp.dto.EndTherapyRequestDTO;
import com.yanalatysh.psychouserapp.dto.ProfileResponseDTO;
import com.yanalatysh.psychouserapp.entity.ErrorCode;
import com.yanalatysh.psychouserapp.entity.Profile;
import com.yanalatysh.psychouserapp.mapper.ProfileMapper;
import com.yanalatysh.psychouserapp.repository.ProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Data
public class SpecialistService {
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    public List<ProfileResponseDTO> getPatientsBySpecialistId(Long specialistId) {
        return profileRepository.findPatientsBySpecialistId(specialistId)
                .stream().map(profileMapper::fromProfileToProfileResponseDTO)
                .collect(Collectors.toList());
    }

    public ProfileResponseDTO getSpecialistForPatient(Long userId) {
        var patientProfile = profileRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.E_USER_PROFILE_NOT_FOUND_FOR_AVAILABILITY_OF_SPECIALIST.name()));

        if (patientProfile.getUserMetaData() == null
                || patientProfile.getUserMetaData().getCurrentTherapistId() == null) {
            throw new EntityNotFoundException(ErrorCode.E_NOT_HAVE_ACTIVE_SPECIALIST.name());
        }

        var specialistProfile = profileRepository.findById(
                        patientProfile.getUserMetaData().getCurrentTherapistId())
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.E_SPECIALIST_PROFILE_NOT_FOUND.name()));

        return profileMapper.fromProfileToProfileResponseDTO(specialistProfile);
    }

    @Transactional
    public void endTherapy(Long specialistId, Long userId, EndTherapyRequestDTO request) {
        Profile patientProfile = profileRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.E_USER_PROFILE_NOT_FOUND.name()));

        if (patientProfile.getUserMetaData() == null) {
            throw new IllegalStateException("Patient has no metadata");
        }

        // Проверка: пациент действительно связан с этим специалистом
        if (!specialistId.equals(patientProfile.getUserMetaData().getCurrentTherapistId())) {
            throw new SecurityException("This patient is not assigned to you");
        }

        // Завершаем терапию
        patientProfile.getUserMetaData().setCurrentTherapistId(null);
        patientProfile.getUserMetaData().setTherapyStartDate(null);

        if (request != null && request.getRating() != 0) {
            var specialistProfile = profileRepository.findById(specialistId)
                    .orElseThrow(() -> new EntityNotFoundException(ErrorCode.E_SPECIALIST_PROFILE_NOT_FOUND.name()));

            var rating = (specialistProfile.getSpecialistMetaData().getRating() + request.getRating())
                    / (specialistProfile.getSpecialistMetaData().getRatingCount() + 1);

            specialistProfile.getSpecialistMetaData().setRating(rating);
            specialistProfile.getSpecialistMetaData().setRatingCount(specialistProfile.getSpecialistMetaData().getRatingCount() + 1);

            profileRepository.save(specialistProfile);
        }

        profileRepository.save(patientProfile);
    }
}
