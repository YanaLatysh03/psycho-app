package com.yanalatysh.psychotrackerapp.service;

import com.yanalatysh.psychotrackerapp.dto.DailyAveragesResponseDTO;
import com.yanalatysh.psychotrackerapp.dto.StatisticsResponseDTO;
import com.yanalatysh.psychotrackerapp.entity.Emotion;
import com.yanalatysh.psychotrackerapp.entity.Tracker;
import com.yanalatysh.psychotrackerapp.repository.TrackerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    private final TrackerRepository trackerRepository;

    public StatisticsResponseDTO getStatistics(Long userId, LocalDateTime start, LocalDateTime end) {
        var stats = new StatisticsResponseDTO();

        // Общее количество записей
        stats.setTotalEntries(trackerRepository.countByUserIdAndEntryDatetimeBetween(userId, start, end));

        // Средние значения
        stats.setAverageEnergyLevel(trackerRepository.getAverageEnergyLevel(userId, start, end));
        stats.setAverageSleepQuality(trackerRepository.getAverageSleepQuality(userId, start, end));
        stats.setAverageStressLevel(trackerRepository.getAverageStressLevel(userId, start, end));
        stats.setAverageProductivityLevel(trackerRepository.getAverageProductivityLevel(userId, start, end));

        // Частота эмоций
        List<Object[]> emotionData = trackerRepository.getEmotionFrequency(userId, start, end);
        Map<String, Long> emotionFrequency = new HashMap<>();
        for (Object[] row : emotionData) {
            Emotion emotion = (Emotion) row[0];
            Long count = (Long) row[1];
            if (emotion != null) {
                emotionFrequency.put(emotion.name(), count);
            }
        }
        stats.setEmotionFrequency(emotionFrequency);

        // Тренды (сравнение первой и второй половины периода)
        stats.setEnergyTrend(calculateTrend(userId, start, end, "energy"));
        stats.setStressTrend(calculateTrend(userId, start, end, "stress"));

        return stats;
    }

    public List<DailyAveragesResponseDTO> getDailyAverages(Long userId, LocalDateTime start, LocalDateTime end) {
        List<Object[]> results = trackerRepository.findAllByUserIdAndEntryDatetimeBetweenOrderByEntryDatetimeDesc(
                        userId, start, end)
                .stream()
                .collect(Collectors.groupingBy(
                        tracker -> tracker.getEntryDatetime().toLocalDate()
                ))
                .entrySet()
                .stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    var trackers = entry.getValue();

                    double avgEnergy = trackers.stream()
                            .filter(t -> t.getEnergyLevel() != null)
                            .mapToInt(Tracker::getEnergyLevel)
                            .average()
                            .orElse(0.0);

                    double avgStress = trackers.stream()
                            .filter(t -> t.getStressLevel() != null)
                            .mapToInt(Tracker::getStressLevel)
                            .average()
                            .orElse(0.0);

                    double avgSleep = trackers.stream()
                            .filter(t -> t.getSleepQuality() != null)
                            .mapToInt(Tracker::getSleepQuality)
                            .average()
                            .orElse(0.0);

                    double avgProductivity = trackers.stream()
                            .filter(t -> t.getProductivityLevel() != null)
                            .mapToInt(Tracker::getProductivityLevel)
                            .average()
                            .orElse(0.0);

                    return new Object[]{date, avgEnergy, avgStress, avgSleep, avgProductivity, (long) trackers.size()};
                }).toList();

        return results.stream()
                .map(row -> new DailyAveragesResponseDTO(
                        (LocalDate) row[0],
                        (Double) row[1],
                        (Double) row[2],
                        (Double) row[3],
                        (Double) row[4],
                        (Long) row[5]
                ))
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .collect(Collectors.toList());
    }

    private StatisticsResponseDTO.TrendData calculateTrend(Long userId, LocalDateTime start, LocalDateTime end, String metric) {

        var daysBetween = Period.between(start.toLocalDate(), end.toLocalDate()).getDays();
        var middle = start.plusDays(daysBetween / 2);

        Double firstHalfAvg;
        Double secondHalfAvg;

        if ("energy".equals(metric)) {
            firstHalfAvg = trackerRepository.getAverageEnergyLevel(userId, start, middle);
            secondHalfAvg = trackerRepository.getAverageEnergyLevel(userId, middle, end);
        } else {
            firstHalfAvg = trackerRepository.getAverageStressLevel(userId, start, middle);
            secondHalfAvg = trackerRepository.getAverageStressLevel(userId, middle, end);
        }

        StatisticsResponseDTO.TrendData trend = new StatisticsResponseDTO.TrendData();

        if (firstHalfAvg == null || secondHalfAvg == null) {
            trend.setTrend("STABLE");
            trend.setChangePercentage(0.0);
            return trend;
        }

        double change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
        trend.setChangePercentage(change);

        if (Math.abs(change) < 5) {
            trend.setTrend("STABLE");
        } else if (change > 0) {
            trend.setTrend("energy".equals(metric) ? "IMPROVING" : "DECLINING");
        } else {
            trend.setTrend("energy".equals(metric) ? "DECLINING" : "IMPROVING");
        }

        return trend;
    }
}
