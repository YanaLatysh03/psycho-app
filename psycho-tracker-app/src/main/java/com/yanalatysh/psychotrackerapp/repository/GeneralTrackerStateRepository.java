package com.yanalatysh.psychotrackerapp.repository;

import com.yanalatysh.psychotrackerapp.entity.GeneralTrackerState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GeneralTrackerStateRepository extends JpaRepository<GeneralTrackerState, Long> {
    List<GeneralTrackerState> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
}
