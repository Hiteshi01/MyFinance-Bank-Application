package com.MyFin_Bank.AccountService.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.MyFin_Bank.AccountService.DTO.AccountOperationResponse;
import com.MyFin_Bank.AccountService.DTO.InvestmentDTO;
import com.MyFin_Bank.AccountService.DTO.TransferDTO;
import com.MyFin_Bank.AccountService.DTO.TransferResponse;
import com.MyFin_Bank.AccountService.Entity.Account;
import com.MyFin_Bank.AccountService.Entity.Transaction;
import com.MyFin_Bank.AccountService.Service.AccountService;

@RestController
@RequestMapping("/account")
public class AccountController {

    @Autowired
    private AccountService service;

    @PostMapping("/create")
    public Account createAccount(@RequestBody Account account){
        return service.createAccount(account);
    }

    @GetMapping("/{id}")
    public Account getAccount(@PathVariable Long id){
        return service.getAccount(id);
    }

    @GetMapping("/user/{userId}")
    public Account getAccountByUserId(@PathVariable Long userId){
        return service.getAccountByUserId(userId);
    }

    @GetMapping("/number/{accountNumber}")
    public Account getAccountByAccountNumber(@PathVariable String accountNumber){
        return service.getAccountByAccountNumber(accountNumber);
    }

    @GetMapping("/all")
    public List<Account> getAllAccounts(){
        return service.getAllAccounts();
    }

    @PutMapping("/kyc/approve/{accountId}")
    public Account approveKyc(@PathVariable Long accountId){
        return service.approveKyc(accountId);
    }

    @PutMapping("/deactivate/{accountId}")
    public Account deactivateAccount(@PathVariable Long accountId){
        return service.deactivateAccount(accountId);
    }

    @PutMapping("/activate/{accountId}")
    public Account activateAccount(@PathVariable Long accountId){
        return service.activateAccount(accountId);
    }

    @GetMapping("/transactions/{accountId}")
    public List<Transaction> getTransactions(@PathVariable Long accountId){
        return service.getTransactions(accountId);
    }

    @PostMapping("/deposit/{id}/{amount}")
    public AccountOperationResponse deposit(@PathVariable Long id,@PathVariable double amount){
        return service.deposit(id,amount);
    }

    @PostMapping("/withdraw/{id}/{amount}")
    public AccountOperationResponse withdraw(@PathVariable Long id,@PathVariable double amount){
        return service.withdraw(id,amount);
    }
    
    @PostMapping("/transfer")
    public TransferResponse transfer(@RequestBody TransferDTO transferDTO){
        return service.transfer(transferDTO);
    }

    @PostMapping("/invest")
    public AccountOperationResponse invest(@RequestBody InvestmentDTO investmentDTO){
        return service.invest(investmentDTO);
    }
}
