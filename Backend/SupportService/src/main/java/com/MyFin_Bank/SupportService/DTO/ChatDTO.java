package com.MyFin_Bank.SupportService.DTO;

public class ChatDTO {

    private Long senderId;

    private Long receiverId;

    private String message;

    public ChatDTO(){}

    public Long getSenderId() {
        return senderId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public String getMessage() {
        return message;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}