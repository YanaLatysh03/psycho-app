package com.yanalatysh.psychouserapp.service;

import com.yanalatysh.psychouserapp.dto.CreateRequestRequestDTO;
import com.yanalatysh.psychouserapp.dto.TherapyRequestResponseDTO;
import com.yanalatysh.psychouserapp.entity.*;
import com.yanalatysh.psychouserapp.mapper.TherapyRequestMapper;
import com.yanalatysh.psychouserapp.repository.ProfileRepository;
import com.yanalatysh.psychouserapp.repository.TherapyRequestRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TherapyRequestService {

    private final TherapyRequestRepository therapyRequestRepository;
    private final TherapyRequestMapper therapyRequestMapper;
    private final ProfileRepository profileRepository;

    public List<TherapyRequestResponseDTO> getRequestsFromUsersBySpecialistId(Long specialistId) {
        return therapyRequestRepository.findAllBySpecialistIdOrderByCreatedAtDesc(specialistId)
                .stream().map(therapyRequestMapper::fromTherapyRequestToResponseDto)
                .collect(Collectors.toList());

    }

    public List<TherapyRequestResponseDTO> getRequestsByUserId(Long userId) {
        return therapyRequestRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(therapyRequestMapper::fromTherapyRequestToResponseDto)
                .collect(Collectors.toList());

    }

    @Transactional
    public TherapyRequestResponseDTO createRequestToSpecialist(
            Long userId,
            Long specialistId,
            CreateRequestRequestDTO requestDTO) {

        // Проверка: пользователь не может отправить запрос самому себе
        if (userId.equals(specialistId)) {
            throw new IllegalArgumentException("Cannot send request to yourself");
        }

        // Проверка: специалист существует и имеет роль SPECIALIST
        Profile specialistProfile = profileRepository.findById(specialistId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.E_SPECIALIST_PROFILE_NOT_FOUND.name()));

        if (specialistProfile.getUser().getRole() != Role.SPECIALIST) {
            throw new IllegalStateException(ErrorCode.E_USER_IS_NOT_SPECIALIST.name());
        }

        // Проверка: нет ли уже активного запроса у этого пользователя
        boolean hasActiveRequest = therapyRequestRepository
                .existsByUserIdAndStatus(userId, RequestStatus.PENDING);

        if (hasActiveRequest) {
            throw new IllegalStateException(ErrorCode.E_HAVE_ACTIVE_REQUEST.name());
        }

        // Проверка: не установлена ли уже связь со специалистом
        Profile userProfile = profileRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.E_USER_PROFILE_NOT_FOUND.name()));

        if (userProfile.getUserMetaData() != null
                && userProfile.getUserMetaData().getCurrentTherapistId() != null) {
            throw new IllegalStateException(ErrorCode.E_HAVE_ACTIVE_SPECIALIST.name());
        }

        var request = TherapyRequest.builder()
                .userId(userId)
                .specialistId(specialistId)
                .message(requestDTO.getMessage())
                .status(RequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        var savedRequest = therapyRequestRepository.save(request);
        return therapyRequestMapper.fromTherapyRequestToResponseDto(savedRequest);
    }

    @Transactional
    public TherapyRequestResponseDTO acceptRequest(Long requestId, Long specialistId) {
        TherapyRequest request = therapyRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.E_THERAPY_REQUEST_NOT_FOUND.name()));

        // Проверка: запрос адресован текущему специалисту
        if (!request.getSpecialistId().equals(specialistId)) {
            throw new SecurityException("You can only accept requests sent to you");
        }

        // Проверка: запрос в статусе PENDING
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request is not pending");
        }

        // Устанавливаем связь: обновляем currentTherapistId у пациента
        Profile patientProfile = profileRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException(ErrorCode.E_USER_PROFILE_NOT_FOUND.name()));

        if (patientProfile.getUserMetaData() == null) {
            throw new IllegalStateException("Patient has no metadata");
        }

        if (patientProfile.getUserMetaData().getCurrentTherapistId() != null) {
            throw new IllegalStateException(ErrorCode.E_HAVE_ACTIVE_SPECIALIST.name());
        }

        patientProfile.getUserMetaData().setCurrentTherapistId(specialistId);
        patientProfile.getUserMetaData().setTherapyStartDate(LocalDateTime.now());
        profileRepository.save(patientProfile);

        request.setStatus(RequestStatus.ACCEPTED);
        request.setUpdatedAt(LocalDateTime.now());

        var updatedRequest = therapyRequestRepository.save(request);
        return therapyRequestMapper.fromTherapyRequestToResponseDto(updatedRequest);
    }

    @Transactional
    public TherapyRequestResponseDTO rejectRequest(Long requestId, Long specialistId) {
        TherapyRequest request = therapyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Therapy request not found with id: " + requestId));

        // Проверка: запрос адресован текущему специалисту
        if (!request.getSpecialistId().equals(specialistId)) {
            throw new SecurityException("You can only reject requests sent to you");
        }

        // Проверка: запрос в статусе PENDING
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request is not pending");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setUpdatedAt(LocalDateTime.now());

        var updatedRequest = therapyRequestRepository.save(request);
        return therapyRequestMapper.fromTherapyRequestToResponseDto(updatedRequest);
    }

    @Transactional
    public void cancelRequest(Long requestId, Long userId) {
        TherapyRequest request = therapyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Therapy request not found with id: " + requestId));

        // Проверка: запрос принадлежит пользователю
        if (!request.getUserId().equals(userId)) {
            throw new SecurityException("You can only cancel your own requests");
        }

        // Проверка: можно отменить только PENDING запросы
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be cancelled");
        }

        // Меняем статус на CANCELLED вместо удаления
        request.setStatus(RequestStatus.CANCELLED);
        request.setUpdatedAt(LocalDateTime.now());
        therapyRequestRepository.save(request);
    }
}
