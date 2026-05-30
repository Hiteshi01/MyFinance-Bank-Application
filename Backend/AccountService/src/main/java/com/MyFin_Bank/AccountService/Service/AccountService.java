package com.MyFin_Bank.AccountService.Service;

import java.util.List;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import java.util.UUID;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.MyFin_Bank.AccountService.DTO.AccountOperationResponse;
import com.MyFin_Bank.AccountService.DTO.InvestmentDTO;
import com.MyFin_Bank.AccountService.DTO.TransferDTO;
import com.MyFin_Bank.AccountService.DTO.TransferResponse;
import com.MyFin_Bank.AccountService.Entity.Account;
import com.MyFin_Bank.AccountService.Entity.Transaction;
import com.MyFin_Bank.AccountService.Repository.AccountRepository;
import com.MyFin_Bank.AccountService.Repository.TransactionRepository;

@Service
public class AccountService {

    private static final String STATUS_PENDING_KYC = "PENDING_KYC";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DEACTIVATED = "DEACTIVATED";

    @Autowired
    private AccountRepository accountRepo;

    @Autowired
    private TransactionRepository transactionRepo;

    @PostConstruct
    @Transactional
    public void initializeAccountNumbers() {
        List<Account> accounts = accountRepo.findAll();
        for(Account account : accounts){
            boolean changed = false;

            String accountNumber = account.getAccountNumber();
            if(accountNumber == null || accountNumber.trim().isEmpty()){
                account.setAccountNumber(generateAccountNumber());
                changed = true;
            }

            String normalizedStatus = normalizeAccountStatus(account.getStatus());
            String currentStatus = account.getStatus() == null ? "" : account.getStatus().trim().toUpperCase();
            if(!normalizedStatus.equals(currentStatus)){
                account.setStatus(normalizedStatus);
                changed = true;
            }

            if(changed){
                accountRepo.save(account);
            }
        }
    }


    // Create Account
    public Account createAccount(Account account){

        if(account == null){
            throw new RuntimeException("Account details are required");
        }

        if(account.getUserId() == null){
            throw new RuntimeException("User ID is required to create account");
        }

        if(accountRepo.findByUserId(account.getUserId()).isPresent()){
            throw new RuntimeException("Account already exists for this user");
        }

        account.setAccountNumber(generateAccountNumber());

        // Bank policy: every new account starts with opening balance.
        account.setBalance(2000);

        if(account.getAccountType() == null || account.getAccountType().trim().isEmpty()){
            account.setAccountType("SAVINGS");
        }
        account.setStatus(STATUS_PENDING_KYC);

        return accountRepo.save(account);
    }

    public Account getAccount(Long accountId) {
        Account account = accountRepo.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return ensureAccountDefaults(account);
    }

    public Account getAccountByUserId(Long userId) {
        if(userId == null){
            throw new RuntimeException("User ID is required");
        }

        Account account = accountRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Account not found for user"));
        return ensureAccountDefaults(account);
    }

    public Account getAccountByAccountNumber(String accountNumber) {
        if(accountNumber == null || accountNumber.trim().isEmpty()){
            throw new RuntimeException("Account number is required");
        }

        Account account = accountRepo.findByAccountNumber(accountNumber.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return ensureAccountDefaults(account);
    }

    public List<Account> getAllAccounts() {
        List<Account> accounts = accountRepo.findAll();
        for(int i = 0; i < accounts.size(); i++){
            accounts.set(i, ensureAccountDefaults(accounts.get(i)));
        }
        accounts.sort((left, right) -> Long.compare(
                right.getAccountId() == null ? 0L : right.getAccountId(),
                left.getAccountId() == null ? 0L : left.getAccountId()));
        return accounts;
    }

    @Transactional
    public Account approveKyc(Long accountId) {
        Account account = getAccount(accountId);
        account.setStatus(STATUS_ACTIVE);
        return accountRepo.save(account);
    }

    @Transactional
    public Account deactivateAccount(Long accountId) {
        Account account = getAccount(accountId);
        account.setStatus(STATUS_DEACTIVATED);
        return accountRepo.save(account);
    }

    @Transactional
    public Account activateAccount(Long accountId) {
        Account account = getAccount(accountId);
        account.setStatus(STATUS_ACTIVE);
        return accountRepo.save(account);
    }

    public List<Transaction> getTransactions(Long accountId) {
        getAccount(accountId);
        return transactionRepo.findByAccountIdOrderByTimestampDesc(accountId);
    }


    // Deposit Money
    @Transactional
    public AccountOperationResponse deposit(Long accountId,double amount){

        if(amount <= 0){
            throw new RuntimeException("Deposit amount must be greater than zero");
        }

        Account acc = getAccount(accountId);
        validateAccountForOperations(acc);

        acc.setBalance(acc.getBalance() + amount);

        accountRepo.save(acc);

        String transactionId = generateTransactionId();
        transactionRepo.save(buildTransaction(accountId, "DEPOSIT", amount, transactionId, "Cash deposit"));

        return buildAccountOperationResponse(acc, transactionId, "Deposit successful");
    }


    // Withdraw Money
    @Transactional
    public AccountOperationResponse withdraw(Long accountId,double amount){

        if(amount <= 0){
            throw new RuntimeException("Withdraw amount must be greater than zero");
        }

        Account acc = getAccount(accountId);
        validateAccountForOperations(acc);

        if(acc.getBalance() < amount){
            throw new RuntimeException("Insufficient balance");
        }

        acc.setBalance(acc.getBalance() - amount);

        accountRepo.save(acc);

        String transactionId = generateTransactionId();
        transactionRepo.save(buildTransaction(accountId, "WITHDRAW", amount, transactionId, "Cash withdrawal"));

        return buildAccountOperationResponse(acc, transactionId, "Withdrawal successful");
    }


    // Transfer Money
    @Transactional
    public TransferResponse transfer(TransferDTO transferDTO){

        if(transferDTO == null){
            throw new RuntimeException("Transfer details are required");
        }

        Long senderAccountId = transferDTO.getFromAccountId();
        Long receiverAccountId = transferDTO.getToAccountId();
        double amount = transferDTO.getAmount();

        if(senderAccountId == null || receiverAccountId == null){
            throw new RuntimeException("Sender and receiver accounts are required");
        }

        if(senderAccountId.equals(receiverAccountId)){
            throw new RuntimeException("Sender and receiver account cannot be the same");
        }

        if(amount <= 0){
            throw new RuntimeException("Transfer amount must be greater than zero");
        }

        Account sender = getAccount(senderAccountId);
        Account receiver = getAccount(receiverAccountId);
        validateAccountForOperations(sender);
        validateAccountForOperations(receiver);

        if(sender.getBalance() < amount){
            throw new RuntimeException("Insufficient balance for transfer");
        }

        sender.setBalance(sender.getBalance() - amount);
        receiver.setBalance(receiver.getBalance() + amount);

        accountRepo.save(sender);
        accountRepo.save(receiver);

        String transactionId = generateTransactionId();
        transactionRepo.save(buildTransaction(
                senderAccountId,
                "TRANSFER_OUT",
                amount,
                transactionId,
                "Transferred to account " + receiver.getAccountNumber()));
        transactionRepo.save(buildTransaction(
                receiverAccountId,
                "TRANSFER_IN",
                amount,
                transactionId,
                "Received from account " + sender.getAccountNumber()));

        TransferResponse response = new TransferResponse();
        response.setSenderAccount(sender);
        response.setReceiverAccount(receiver);
        response.setTransactionId(transactionId);
        response.setMessage("Transfer successful");
        return response;
    }

    @Transactional
    public AccountOperationResponse invest(InvestmentDTO investmentDTO) {
        if(investmentDTO == null){
            throw new RuntimeException("Investment details are required");
        }

        if(investmentDTO.getAccountId() == null){
            throw new RuntimeException("Account ID is required");
        }

        if(investmentDTO.getAmount() <= 0){
            throw new RuntimeException("Investment amount must be greater than zero");
        }

        String category = investmentDTO.getCategory() == null ? "" : investmentDTO.getCategory().trim();
        if(category.isEmpty()){
            throw new RuntimeException("Investment category is required");
        }

        if(investmentDTO.getDuration() == null || investmentDTO.getDuration() <= 0){
            throw new RuntimeException("Investment duration must be valid");
        }

        Account account = getAccount(investmentDTO.getAccountId());
        validateAccountForOperations(account);

        if(account.getBalance() < investmentDTO.getAmount()){
            throw new RuntimeException("Investment amount cannot exceed available balance");
        }

        account.setBalance(account.getBalance() - investmentDTO.getAmount());
        accountRepo.save(account);

        String transactionId = generateTransactionId();
        String description = category
                + " | "
                + (investmentDTO.getSchedule() == null ? "One Time" : investmentDTO.getSchedule())
                + " | "
                + investmentDTO.getDuration()
                + " months";
        transactionRepo.save(buildTransaction(
                account.getAccountId(),
                "INVESTMENT",
                investmentDTO.getAmount(),
                transactionId,
                description));

        return buildAccountOperationResponse(account, transactionId, "Investment recorded successfully");
    }


    // Generate Transaction ID
    private String generateTransactionId(){
        return "TXN-" + UUID.randomUUID().toString().substring(0,8).toUpperCase();
    }

    private Account ensureAccountDefaults(Account account) {
        boolean changed = false;

        String currentNumber = account.getAccountNumber();
        if(currentNumber != null && !currentNumber.trim().isEmpty()){
            String normalizedNumber = currentNumber.trim().toUpperCase();
            if(!normalizedNumber.equals(currentNumber)){
                changed = true;
            }
            account.setAccountNumber(normalizedNumber);
        } else {
            account.setAccountNumber(generateAccountNumber());
            changed = true;
        }

        String normalizedStatus = normalizeAccountStatus(account.getStatus());
        if(account.getStatus() == null || !normalizedStatus.equals(account.getStatus().trim().toUpperCase())){
            account.setStatus(normalizedStatus);
            changed = true;
        }

        if(changed){
            return accountRepo.save(account);
        }

        return account;
    }

    private String generateAccountNumber() {
        String candidate;
        do {
            int randomDigits = ThreadLocalRandom.current().nextInt(10000000, 100000000);
            candidate = "AC" + randomDigits;
        } while (accountRepo.existsByAccountNumber(candidate));

        return candidate;
    }

    private Transaction buildTransaction(Long accountId, String type, double amount, String transactionId, String description){
        Transaction tx = new Transaction();
        tx.setAccountId(accountId);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setTransactionId(transactionId);
        tx.setDescription(description);
        tx.setTimestamp(LocalDateTime.now());
        return tx;
    }

    private AccountOperationResponse buildAccountOperationResponse(Account account, String transactionId, String message) {
        AccountOperationResponse response = new AccountOperationResponse();
        response.setAccount(account);
        response.setTransactionId(transactionId);
        response.setMessage(message);
        return response;
    }

    private void validateAccountForOperations(Account account) {
        String status = normalizeAccountStatus(account.getStatus());
        if(STATUS_PENDING_KYC.equals(status)){
            throw new RuntimeException("Account needs the verification(KYC)");
        }

        if(STATUS_DEACTIVATED.equals(status)){
            throw new RuntimeException("This account is deactivated by bank authority contact branch for it");
        }
    }

    private String normalizeAccountStatus(String status) {
        if(status == null || status.trim().isEmpty()){
            return STATUS_PENDING_KYC;
        }

        String normalized = status.trim().toUpperCase();
        if(STATUS_ACTIVE.equals(normalized)){
            return STATUS_ACTIVE;
        }

        if(STATUS_DEACTIVATED.equals(normalized) || "INACTIVE".equals(normalized) || "DEACTIVE".equals(normalized)){
            return STATUS_DEACTIVATED;
        }

        if(STATUS_PENDING_KYC.equals(normalized) || "PENDING".equals(normalized) || "KYC_PENDING".equals(normalized)){
            return STATUS_PENDING_KYC;
        }

        return STATUS_ACTIVE;
    }

}
