package com.yanalatysh.psychotrackerapp.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "profiles")
public class Profile {
    @Id
    @Column(name = "user_id")
    private Long id;

    @OneToOne(mappedBy = "profile",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private UserMetaData userMetaData;
}
