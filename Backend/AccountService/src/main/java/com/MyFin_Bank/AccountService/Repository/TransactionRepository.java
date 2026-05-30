package com.MyFin_Bank.AccountService.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.MyFin_Bank.AccountService.Entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction,Long>{
    List<Transaction> findByAccountIdOrderByTimestampDesc(Long accountId);
}
