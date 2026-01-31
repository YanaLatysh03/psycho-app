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
@Builder
@Table(name = "specialist_metadata")
@NoArgsConstructor
@AllArgsConstructor
public class SpecialistMetaData {
    @Id
    @Column(name = "profile_id")
    private Long id;

    // Образование и квалификация
    @Column(name = "education")
    private String education;

    @Column(name = "specialization")
    private String specialization; // Специализация

    // Опыт работы
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    // Связь с профилем
    @OneToOne
    @MapsId
    @JoinColumn(name = "profile_id")
    private Profile profile;

    // Направления и методы работы
    @ElementCollection
    @CollectionTable(
            name = "specialist_approaches",
            joinColumns = @JoinColumn(name = "profile_id")
    )
    @Enumerated(EnumType.STRING)
    private Set<TherapyApproach> approaches; // Подходы: КПТ, психоанализ и т.д.

    @ElementCollection
    @CollectionTable(
            name = "specialist_work_formats",
            joinColumns = @JoinColumn(name = "profile_id")
    )
    @Column(name = "format")
    @Enumerated(EnumType.STRING)
    private Set<WorkFormat> workFormats; // Форматы: очно, онлайн, групповые

    // Проблемы с которыми работает
    @ElementCollection
    @CollectionTable(
            name = "specialist_problem_areas",
            joinColumns = @JoinColumn(name = "profile_id")
    )
    @Column(name = "problem_area")
    @Enumerated(EnumType.STRING)
    private Set<ProblemArea> problemAreas; // Тревога, депрессия, отношения и т.д.

    @ElementCollection
    @CollectionTable(
            name = "specialist_target_audiences",
            joinColumns = @JoinColumn(name = "profile_id")
    )
    @Column(name = "audience")
    @Enumerated(EnumType.STRING)
    private Set<TargetAudience> targetAudiences; // Взрослые, дети, пары и т.д.

    // Условия работы
    @Column(name = "session_price")
    private Integer sessionPrice; // Стоимость сессии

    @Column(name = "session_duration")
    private Integer sessionDuration; // Длительность сессии в минутах (обычно 50-60)

    @Column(name = "provides_free_consultation")
    private Boolean providesFreeConsultation; // Предоставляет бесплатную первичную консультацию

    // Рейтинг и отзывы
    @Column(name = "rating")
    private Double rating; // Средний рейтинг (0.0 - 5.0)

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
