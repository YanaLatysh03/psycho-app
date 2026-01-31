package com.yanalatysh.psychotrackerapp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "tracker_entries")
public class Tracker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entry_datetime")
    private LocalDateTime entryDatetime;

    @Column(name = "thoughts")
    private String thoughts;

    @Column(name = "thoughts_level")
    private Integer thoughtsLevel;

    @ElementCollection
    @CollectionTable(name = "tracker_emotions",
            joinColumns = @JoinColumn(name = "tracker_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "emotion")
    private Set<Emotion> emotions = new HashSet<>();

    @Column(name = "energy_level")
    private Integer energyLevel;

    @Column(name = "sleep_quality")
    private Integer sleepQuality;

    @Column(name = "stress_level")
    private Integer stressLevel;

    private String stressTriggers;

    @Column(name = "productivity_level")
    private Integer productivityLevel;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
