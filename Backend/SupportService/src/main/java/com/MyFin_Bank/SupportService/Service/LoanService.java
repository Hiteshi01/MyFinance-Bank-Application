package com.MyFin_Bank.SupportService.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.MyFin_Bank.SupportService.Entity.Loan;
import com.MyFin_Bank.SupportService.Entity.Notification;
import com.MyFin_Bank.SupportService.Repository.LoanRepository;
import com.MyFin_Bank.SupportService.Repository.NotificationRepository;

@Service
public class LoanService {

    @Autowired
    private LoanRepository repo;

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Loan applyLoan(Loan loan){

        if(loan == null){
            throw new RuntimeException("Loan details are required");
        }

        if(loan.getUserId() == null){
            throw new RuntimeException("User ID is required");
        }

        if(loan.getAmount() <= 0){
            throw new RuntimeException("Loan amount must be greater than zero");
        }

        if(loan.getDuration() <= 0){
            throw new RuntimeException("Loan duration must be valid");
        }

        if(loan.getInterestRate() <= 0){
            throw new RuntimeException("Loan interest rate must be greater than zero");
        }

        loan.setEmi(calculateEmi(loan.getAmount(), loan.getInterestRate(), loan.getDuration()));
        loan.setStatus("PENDING");
        loan.setTimestamp(LocalDateTime.now().toString());

        return repo.save(loan);
    }

    public List<Loan> getAllLoans(){

        return repo.findAllByOrderByLoanIdDesc();
    }

    public List<Loan> getLoansByUserId(Long userId) {
        if(userId == null){
            throw new RuntimeException("User ID is required");
        }

        return repo.findByUserIdOrderByLoanIdDesc(userId);
    }

    @Transactional
    public Loan approveLoan(Long id){

        Loan loan = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        if(!"PENDING".equalsIgnoreCase(loan.getStatus())){
            throw new RuntimeException("Loan already processed");
        }

        loan.setStatus("APPROVED");

        Loan savedLoan = repo.save(loan);
        notificationRepository.save(buildLoanNotification(savedLoan, "APPROVED"));
        return savedLoan;
    }

    @Transactional
    public Loan rejectLoan(Long id){

        Loan loan = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        if(!"PENDING".equalsIgnoreCase(loan.getStatus())){
            throw new RuntimeException("Loan already processed");
        }

        loan.setStatus("REJECTED");

        Loan savedLoan = repo.save(loan);
        notificationRepository.save(buildLoanNotification(savedLoan, "REJECTED"));
        return savedLoan;
    }

    private double calculateEmi(double principal, double annualRate, int months) {
        double monthlyRate = annualRate / 12 / 100;

        if(monthlyRate == 0){
            return principal / months;
        }

        double numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
        double denominator = Math.pow(1 + monthlyRate, months) - 1;

        return numerator / denominator;
    }

    private Notification buildLoanNotification(Loan loan, String status) {
        Notification notification = new Notification();
        notification.setUserId(loan.getUserId());
        notification.setTitle("Loan Status Update");
        notification.setMessage("Your loan #" + loan.getLoanId() + " was " + status + ".");
        notification.setTimestamp(LocalDateTime.now().toString());
        return notification;
    }

}
