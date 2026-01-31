package com.yanalatysh.psychouserapp.repository;

import com.yanalatysh.psychouserapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
