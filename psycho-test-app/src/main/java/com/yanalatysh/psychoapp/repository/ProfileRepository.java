package com.yanalatysh.psychoapp.repository;

import com.yanalatysh.psychoapp.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
}
