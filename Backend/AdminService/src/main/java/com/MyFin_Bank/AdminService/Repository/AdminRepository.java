package com.MyFin_Bank.AdminService.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.MyFin_Bank.AdminService.Entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long>{

    Admin findByEmail(String email);
    boolean existsByAdminCode(String adminCode);

}
