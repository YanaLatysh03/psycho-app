package com.yanalatysh.psychotrackerapp.service;

import com.yanalatysh.psychotrackerapp.dto.TrackerEntryRequestDTO;
import com.yanalatysh.psychotrackerapp.dto.TrackerEntryResponseDTO;
import com.yanalatysh.psychotrackerapp.mapper.TrackerMapper;
import com.yanalatysh.psychotrackerapp.repository.TrackerRepository;
import com.yanalatysh.psychotrackerapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackerService {

    private final UserRepository userRepository;
    private final TrackerMapper trackerMapper;
    private final TrackerRepository trackerRepository;

    public TrackerEntryResponseDTO createEntry(Long userId, TrackerEntryRequestDTO request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден " + userId));

        var tracker = trackerMapper.fromRequestDtoToTracker(request);
        tracker.setUser(user);

        var savedTracker = trackerRepository.save(tracker);
        return trackerMapper.fromTrackerToResponseDto(savedTracker);
    }

    public List<TrackerEntryResponseDTO> getAllUserEntries(Long userId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        return trackerRepository.findAllByUserIdOrderByEntryDatetimeDesc(userId, pageable)
                .stream()
                .map(trackerMapper::fromTrackerToResponseDto)
                .toList();
    }

    public List<TrackerEntryResponseDTO> getEntriesByDateRange(
            Long userId,
            LocalDateTime start,
            LocalDateTime end,
            int page,
            int size) {
        var pageable = PageRequest.of(page, size);
        return trackerRepository.findAllByUserIdAndEntryDatetimeBetweenOrderByEntryDatetimeDesc(
                        userId, start, end, pageable)
                .stream()
                .map(trackerMapper::fromTrackerToResponseDto)
                .collect(Collectors.toList());
    }

    public TrackerEntryResponseDTO getEntryById(Long userId, Long entryId) {
        var tracker = trackerRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Запись не найдена " + entryId));

        if (!tracker.getUser().getId().equals(userId)) {
            throw new RuntimeException("Доступ запрещен");
        }

        return trackerMapper.fromTrackerToResponseDto(tracker);
    }

    public TrackerEntryResponseDTO updateEntry(Long userId, Long entryId, TrackerEntryRequestDTO request) {
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
        return trackerMapper.fromTrackerToResponseDto(updatedTracker);
    }

    public void deleteEntry(Long userId, Long entryId) {
        var tracker = trackerRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Запись не найдена " + entryId));

        if (!tracker.getUser().getId().equals(userId)) {
            throw new RuntimeException("Доступ запрещен");
        }

        trackerRepository.delete(tracker);
    }
}
