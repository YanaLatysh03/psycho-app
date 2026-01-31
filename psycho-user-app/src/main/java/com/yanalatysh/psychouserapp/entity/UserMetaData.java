package com.yanalatysh.psychouserapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Data
@Table(name = "user_metadata")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMetaData {

    @Id
    @Column(name = "profile_id")
    private Long id;

    // Запрос на терапию
    @ElementCollection
    @CollectionTable(
            name = "user_problem_areas",
            joinColumns = @JoinColumn(name = "profile_id")
    )
    @Column(name = "problem_area")
    @Enumerated(EnumType.STRING)
    private Set<ProblemArea> problemAreas; // Проблемы пациента (тревога, депрессия)

    @Column(name = "therapy_goals")
    private String therapyGoals; // Цели терапии

    @Column(name = "current_situation")
    private String currentSituation; // Описание текущей ситуации

    // Статистика
    @Column(name = "total_sessions_attended")
    private Integer totalSessionsAttended; // Всего посещенных сессий

    @Column(name = "current_therapist_id")
    private Long currentTherapistId; // ID текущего терапевта

    @Column(name = "therapy_start_date")
    private LocalDateTime therapyStartDate; // Дата начала текущей терапии

    @Column(name = "in_crisis")
    private Boolean inCrisis;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Связь с профилем
    @OneToOne
    @MapsId
    @JoinColumn(name = "profile_id")
    private Profile profile;
}
