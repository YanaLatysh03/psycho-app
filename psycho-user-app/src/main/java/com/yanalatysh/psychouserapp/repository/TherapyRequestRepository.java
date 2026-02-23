package com.yanalatysh.psychouserapp.repository;

import com.yanalatysh.psychouserapp.entity.RequestStatus;
import com.yanalatysh.psychouserapp.entity.TherapyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TherapyRequestRepository extends JpaRepository<TherapyRequest, Long> {

    List<TherapyRequest> findAllBySpecialistIdOrderByCreatedAtDesc(
            @Param("userId") Long specialistId);

    List<TherapyRequest> findAllByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    boolean existsByUserIdAndStatus(@Param("userId") Long userId, @Param("status") RequestStatus status);
}
