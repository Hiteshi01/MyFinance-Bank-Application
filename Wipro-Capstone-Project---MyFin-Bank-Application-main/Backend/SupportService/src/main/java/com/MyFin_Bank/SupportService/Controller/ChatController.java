package com.MyFin_Bank.SupportService.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.MyFin_Bank.SupportService.DTO.MessageDTO;
import com.MyFin_Bank.SupportService.Entity.Message;
import com.MyFin_Bank.SupportService.Service.ChatService;

@RestController
@RequestMapping({"/chat", "/api/chat"})
public class ChatController {

    @Autowired
    private ChatService service;

    @PostMapping("/send")
    public Message sendMessage(@RequestBody MessageDTO dto){
        return service.sendMessage(dto);
    }

    @GetMapping("/messages")
    public List<Message> getMessages(
            @RequestParam(required = false) Long senderId,
            @RequestParam(required = false) Long receiverId){
        return service.getMessages(senderId, receiverId);
    }
}
