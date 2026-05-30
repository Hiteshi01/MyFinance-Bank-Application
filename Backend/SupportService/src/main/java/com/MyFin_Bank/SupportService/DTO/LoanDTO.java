package com.MyFin_Bank.SupportService.DTO;

public class LoanDTO {

    private Long userId;

    private double amount;

    private int duration;

    private double interestRate;

    public LoanDTO(){}

    public Long getUserId() {
        return userId;
    }

    public double getAmount() {
        return amount;
    }

    public int getDuration() {
        return duration;
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }
}