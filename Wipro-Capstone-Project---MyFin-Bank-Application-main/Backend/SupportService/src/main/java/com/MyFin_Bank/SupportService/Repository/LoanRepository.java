package com.MyFin_Bank.SupportService.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.MyFin_Bank.SupportService.Entity.Loan;

public interface LoanRepository extends JpaRepository<Loan,Long>{
    List<Loan> findAllByOrderByLoanIdDesc();
    List<Loan> findByUserIdOrderByLoanIdDesc(Long userId);
}
