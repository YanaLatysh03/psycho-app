package com.yanalatysh.psychouserapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "profiles")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    @Id
    @Column(name = "user_id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "phone")
    private String phone;

    @Column(name = "birthday")
    private LocalDate birthday;

    @Column(name = "city")
    private String city;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted")
    private boolean isDeleted;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne(mappedBy = "profile",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private SpecialistMetaData specialistMetaData;

    @OneToOne(mappedBy = "profile",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private UserMetaData userMetaData;
}
