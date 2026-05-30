package com.MyFin_Bank.SupportService.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.MyFin_Bank.SupportService.Entity.Loan;
import com.MyFin_Bank.SupportService.Service.LoanService;

@RestController
@RequestMapping("/loan")
public class LoanController {

    @Autowired
    private LoanService service;

    @PostMapping("/apply")
    public Loan applyLoan(@RequestBody Loan loan){
        return service.applyLoan(loan);
    }

    @GetMapping("/all")
    public List<Loan> getAllLoans(){
        return service.getAllLoans();
    }

    @GetMapping("/user/{userId}")
    public List<Loan> getLoansByUserId(@PathVariable Long userId){
        return service.getLoansByUserId(userId);
    }

    @PutMapping("/approve/{id}")
    public Loan approve(@PathVariable Long id){
        return service.approveLoan(id);
    }

    @PutMapping("/reject/{id}")
    public Loan reject(@PathVariable Long id){
        return service.rejectLoan(id);
    }
}
