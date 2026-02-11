package com.yanalatysh.psychotrackerapp.repository;

import com.yanalatysh.psychotrackerapp.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
}
