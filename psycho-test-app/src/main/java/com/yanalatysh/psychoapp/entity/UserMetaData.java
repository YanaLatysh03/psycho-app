package com.yanalatysh.psychoapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(name = "current_therapist_id")
    private Long currentTherapistId; // ID текущего терапевта

    // Связь с профилем
    @OneToOne
    @MapsId
    @JoinColumn(name = "profile_id")
    private Profile profile;
}
