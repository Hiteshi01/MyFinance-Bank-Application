package com.MyFin_Bank.AccountService.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.MyFin_Bank.AccountService.Entity.Account;

public interface AccountRepository extends JpaRepository<Account,Long>{
    Optional<Account> findByUserId(Long userId);
    Optional<Account> findByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);
}
