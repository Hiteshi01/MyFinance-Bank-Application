package com.MyFin_Bank.SupportService.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.MyFin_Bank.SupportService.Entity.Notification;
import com.MyFin_Bank.SupportService.Service.NotificationService;

@RestController
@RequestMapping("/notification")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @PostMapping("/send")
    public Notification sendNotification(@RequestBody Notification notification){
        return service.sendNotification(notification);
    }

    @GetMapping("/all")
    public List<Notification> getNotifications(){
        return service.getNotifications();
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUserId(@PathVariable Long userId){
        return service.getNotificationsByUserId(userId);
    }
}
