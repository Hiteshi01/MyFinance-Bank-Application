package com.MyFin_Bank.AccountService.DTO;

import com.MyFin_Bank.AccountService.Entity.Account;

public class AccountOperationResponse {

    private Account account;
    private String transactionId;
    private String message;

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
