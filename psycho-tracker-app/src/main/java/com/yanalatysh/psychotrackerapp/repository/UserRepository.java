package com.yanalatysh.psychotrackerapp.repository;

import com.yanalatysh.psychotrackerapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
