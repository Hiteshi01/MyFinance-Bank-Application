package com.MyFin_Bank.UserService.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.MyFin_Bank.UserService.Entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);
    boolean existsByUserCode(String userCode);

}
