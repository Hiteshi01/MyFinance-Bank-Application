package com.MyFin_Bank.AccountService.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.MyFin_Bank.AccountService.Entity.Loan;

public interface LoanRepository extends JpaRepository<Loan,Long>{
}