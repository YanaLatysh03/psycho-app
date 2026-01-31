package com.yanalatysh.psychoapp.repository;

import com.yanalatysh.psychoapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
