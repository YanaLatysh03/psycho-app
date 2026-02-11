package com.yanalatysh.psychotrackerapp.service;

import com.yanalatysh.psychotrackerapp.dto.TrackerEntryDetailResponseDTO;
import com.yanalatysh.psychotrackerapp.dto.TrackerEntryRequestDTO;
import com.yanalatysh.psychotrackerapp.dto.TrackerEntrySummaryResponseDTO;
import com.yanalatysh.psychotrackerapp.entity.Tracker;
import com.yanalatysh.psychotrackerapp.mapper.TrackerMapper;
import com.yanalatysh.psychotrackerapp.repository.ProfileRepository;
import com.yanalatysh.psychotrackerapp.repository.TrackerRepository;
import com.yanalatysh.psychotrackerapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackerService {

    private final UserRepository userRepository;
    private final TrackerMapper trackerMapper;
    private final TrackerRepository trackerRepository;
    private final ProfileRepository profileRepository;

    public TrackerEntryDetailResponseDTO createEntry(Long userId, TrackerEntryRequestDTO request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден " + userId));

        var tracker = trackerMapper.fromRequestDtoToTracker(request);
        tracker.setUser(user);

        var savedTracker = trackerRepository.save(tracker);
        return trackerMapper.fromTrackerToDetailsResponseDto(savedTracker);
    }

    public List<TrackerEntrySummaryResponseDTO> getMyEntriesByDateRange(
            Long currentUserId,
            LocalDateTime start,
            LocalDateTime end,
            int page,
            int size) {
        var pageable = PageRequest.of(page, size);

        var entries = findTrackerEntriesByDateRange(start, end, currentUserId, pageable);

        return entries.stream()
                .map(trackerMapper::fromTrackerToSummaryResponseDto)
                .collect(Collectors.toList());
    }

    public List<TrackerEntryDetailResponseDTO> getEntriesByUserId(
            Long currentUserId,
            Long userId,
            LocalDateTime start,
            LocalDateTime end,
            int page,
            int size
    ) {
        var userProfile = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + userId));

        if (userProfile.getUserMetaData() != null
                && userProfile.getUserMetaData().getCurrentTherapistId() == currentUserId) {

            var pageable = PageRequest.of(page, size);
            var entries = findTrackerEntriesByDateRange(start, end, currentUserId, pageable);

            return entries.stream()
                    .map(trackerMapper::fromTrackerToDetailsResponseDto)
                    .toList();
        }
        else {
            throw new RuntimeException("User doesn't have specialist with id " + currentUserId);
        }
    }


    public TrackerEntryDetailResponseDTO getEntryById(Long userId, Long entryId) {
        var tracker = trackerRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Запись не найдена " + entryId));

        if (!tracker.getUser().getId().equals(userId)) {
            throw new RuntimeException("Доступ запрещен");
        }

        return trackerMapper.fromTrackerToDetailsResponseDto(tracker);
    }

    public TrackerEntryDetailResponseDTO updateEntry(Long userId, Long entryId, TrackerEntryRequestDTO request) {
        var tracker = trackerRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Запись не найдена " + entryId));

        if (!tracker.getUser().getId().equals(userId)) {
            throw new RuntimeException("Доступ запрещен");
        }

        // Обновляем поля
        if (request.getThoughts() != null) tracker.setThoughts(request.getThoughts());
        if (request.getThoughtsLevel() != null) tracker.setThoughtsLevel(request.getThoughtsLevel());
        if (request.getEmotions() != null) tracker.setEmotions(request.getEmotions());
        if (request.getEnergyLevel() != null) tracker.setEnergyLevel(request.getEnergyLevel());
        if (request.getSleepQuality() != null) tracker.setSleepQuality(request.getSleepQuality());
        if (request.getStressLevel() != null) tracker.setStressLevel(request.getStressLevel());
        if (request.getStressTriggers() != null) tracker.setStressTriggers(request.getStressTriggers());
        if (request.getProductivityLevel() != null) tracker.setProductivityLevel(request.getProductivityLevel());

        var updatedTracker = trackerRepository.save(tracker);
        return trackerMapper.fromTrackerToDetailsResponseDto(updatedTracker);
    }

    public void deleteEntry(Long userId, Long entryId) {
        var tracker = trackerRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Запись не найдена " + entryId));

        if (!tracker.getUser().getId().equals(userId)) {
            throw new RuntimeException("Доступ запрещен");
        }

        trackerRepository.delete(tracker);
    }

    private List<Tracker> findTrackerEntriesByDateRange(LocalDateTime start, LocalDateTime end, Long currentUserId, Pageable pageable){
        List<Tracker> entries = Collections.emptyList();

        if (start != null && end != null) {
            // Диапазон: с start по end
            entries = trackerRepository.findAllByUserIdAndEntryDatetimeBetweenOrderByEntryDatetimeDesc(currentUserId, start, end, pageable);
        } else if (start != null) {
            // Только start: все записи начиная с start (start и позже)
            entries = trackerRepository.findByUserIdAndEntryDatetimeGreaterThanEqualOrderByEntryDatetimeDesc(currentUserId, start, pageable);
        } else if (end != null) {
            // Только end: все записи до end (end и раньше)
            entries = trackerRepository.findByUserIdAndEntryDatetimeLessThanEqualOrderByEntryDatetimeDesc(currentUserId, end, pageable);
        } else {
            // Без фильтров: все записи пользователя
            entries = trackerRepository.findAllByUserIdOrderByEntryDatetimeDesc(currentUserId, pageable);
        }

        return entries;
    }
}
