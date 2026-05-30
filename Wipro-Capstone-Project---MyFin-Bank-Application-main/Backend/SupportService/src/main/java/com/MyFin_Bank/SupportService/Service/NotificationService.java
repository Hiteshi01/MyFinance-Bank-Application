package com.MyFin_Bank.SupportService.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.MyFin_Bank.SupportService.Entity.Notification;
import com.MyFin_Bank.SupportService.Repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repo;

    public Notification sendNotification(Notification notification){

        if(notification == null){
            throw new RuntimeException("Notification details are required");
        }

        if(notification.getUserId() == null){
            throw new RuntimeException("Notification user is required");
        }

        if(notification.getMessage() == null || notification.getMessage().trim().isEmpty()){
            throw new RuntimeException("Notification message cannot be empty");
        }

        if(notification.getTitle() == null || notification.getTitle().trim().isEmpty()){
            notification.setTitle("Notification");
        }

        notification.setMessage(notification.getMessage().trim());
        notification.setTimestamp(LocalDateTime.now().toString());

        return repo.save(notification);
    }

    public List<Notification> getNotifications(){

        return repo.findAllByOrderByIdDesc();
    }

    public List<Notification> getNotificationsByUserId(Long userId) {
        if(userId == null){
            throw new RuntimeException("User ID is required");
        }

        return repo.findByUserIdOrderByIdDesc(userId);
    }

}
