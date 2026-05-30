package com.MyFin_Bank.SupportService.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.MyFin_Bank.SupportService.Entity.Message;

public interface MessageRepository extends JpaRepository<Message,Long>{
    List<Message> findAllByOrderByTimestampAsc();

    @Query("SELECT m FROM Message m WHERE (m.senderId = :participantA AND m.receiverId = :participantB) OR (m.senderId = :participantB AND m.receiverId = :participantA) ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("participantA") Long participantA, @Param("participantB") Long participantB);
}
