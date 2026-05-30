package com.MyFin_Bank.SupportService.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.MyFin_Bank.SupportService.DTO.MessageDTO;
import com.MyFin_Bank.SupportService.Entity.Message;
import com.MyFin_Bank.SupportService.Repository.MessageRepository;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    private MessageRepository repo;

    public Message sendMessage(MessageDTO dto){

        if(dto == null){
            throw new RuntimeException("Message payload is required");
        }

        logger.info("Chat payload received: senderId={}, receiverId={}", dto.getSenderId(), dto.getReceiverId());

        if(dto.getSenderId() == null || dto.getReceiverId() == null){
            throw new RuntimeException("Sender and receiver are required");
        }

        if(dto.getContent() == null || dto.getContent().trim().isEmpty()){
            throw new RuntimeException("Message cannot be empty");
        }

        Message msg = new Message();
        msg.setSenderId(dto.getSenderId());
        msg.setReceiverId(dto.getReceiverId());
        msg.setContent(dto.getContent().trim());
        msg.setTimestamp(LocalDateTime.now());

        return repo.save(msg);
    }

    public List<Message> getMessages(Long senderId, Long receiverId){
        if(senderId != null && receiverId != null){
            return repo.findConversation(senderId, receiverId);
        }

        return repo.findAllByOrderByTimestampAsc();
    }

}
