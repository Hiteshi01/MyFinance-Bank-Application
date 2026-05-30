package com.MyFin_Bank.SupportService.DTO;

public class NotificationDTO {

    private Long userId;

    private String message;

    public NotificationDTO(){}

    public Long getUserId() {
        return userId;
    }

    public String getMessage() {
        return message;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}