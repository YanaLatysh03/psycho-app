package com.yanalatysh.psychotrackerapp.repository;

import com.yanalatysh.psychotrackerapp.entity.Tracker;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TrackerRepository extends JpaRepository<Tracker, Long> {

    List<Tracker> findAllByUserIdOrderByEntryDatetimeDesc(Long userId, Pageable pageable);

    List<Tracker> findAllByUserIdAndEntryDatetimeBetweenOrderByEntryDatetimeDesc(Long userId, LocalDateTime start, LocalDateTime end);

    List<Tracker> findAllByUserIdAndEntryDatetimeBetweenOrderByEntryDatetimeDesc(
            Long userId,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

    long countByUserIdAndEntryDatetimeBetween(Long userId, LocalDateTime start, LocalDateTime end);

    // Средние значения за период
    @Query("SELECT AVG(t.energyLevel) FROM Tracker t WHERE t.user.id = :userId " +
            "AND t.entryDatetime BETWEEN :start AND :end")
    Double getAverageEnergyLevel(@Param("userId") Long userId,
                                 @Param("start") LocalDateTime start,
                                 @Param("end") LocalDateTime end);

    @Query("SELECT AVG(t.stressLevel) FROM Tracker t WHERE t.user.id = :userId " +
            "AND t.entryDatetime BETWEEN :start AND :end")
    Double getAverageStressLevel(@Param("userId") Long userId,
                                 @Param("start") LocalDateTime start,
                                 @Param("end") LocalDateTime end);

    @Query("SELECT AVG(t.sleepQuality) FROM Tracker t WHERE t.user.id = :userId " +
            "AND t.entryDatetime BETWEEN :start AND :end")
    Double getAverageSleepQuality(@Param("userId") Long userId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    @Query("SELECT AVG(t.productivityLevel) FROM Tracker t WHERE t.user.id = :userId " +
            "AND t.entryDatetime BETWEEN :start AND :end")
    Double getAverageProductivityLevel(@Param("userId") Long userId,
                                       @Param("start") LocalDateTime start,
                                       @Param("end") LocalDateTime end);

    // Подсчет эмоций
    @Query("SELECT e, COUNT(t) FROM Tracker t JOIN t.emotions e WHERE t.user.id = :userId " +
            "AND t.entryDatetime BETWEEN :start AND :end GROUP BY e")
    List<Object[]> getEmotionFrequency(@Param("userId") Long userId,
                                       @Param("start") LocalDateTime start,
                                       @Param("end") LocalDateTime end);
}
