package com.MyFin_Bank.SupportService.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.MyFin_Bank.SupportService.Entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification,Long>{
    List<Notification> findAllByOrderByIdDesc();
    List<Notification> findByUserIdOrderByIdDesc(Long userId);
}
