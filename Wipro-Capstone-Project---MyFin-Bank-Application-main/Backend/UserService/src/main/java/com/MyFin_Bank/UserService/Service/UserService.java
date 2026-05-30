package com.MyFin_Bank.UserService.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;

import com.MyFin_Bank.UserService.DTO.LoginDTO;
import com.MyFin_Bank.UserService.DTO.RegisterDTO;
import com.MyFin_Bank.UserService.Entity.User;
import com.MyFin_Bank.UserService.Repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${myfin.gateway.base-url:http://localhost:8080}")
    private String gatewayBaseUrl;

    @PostConstruct
    public void backfillUserCodes() {
        List<User> users = repository.findAll();
        for (User user : users) {
            if (user.getUserCode() == null || user.getUserCode().trim().isEmpty()) {
                user.setUserCode(generateUserCode());
                repository.save(user);
            }
        }
    }

    // REGISTER USER
    public User register(RegisterDTO dto) {

        if(dto == null){
            throw new RuntimeException("Registration details are required");
        }

        User existingUser = repository.findByEmail(dto.getEmail());

        if(existingUser != null){
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole("USER");
        user.setUserCode(generateUserCode());

        User savedUser = repository.save(user);

        try {
            // Provision the user's bank account via the API Gateway (routes to AccountService).
            restTemplate.postForObject(
                    gatewayBaseUrl + "/account/create",
                    Map.of("userId", savedUser.getId(), "accountType", "SAVINGS"),
                    Object.class
            );
        } catch (Exception ex) {
            // Best-effort compensation: remove the user if account provisioning fails.
            repository.deleteById(savedUser.getId());
            throw new RuntimeException("Account provisioning failed. Please try again.");
        }

        return savedUser;
    }

    private String generateUserCode() {
        String candidate;
        do {
            int randomDigits = ThreadLocalRandom.current().nextInt(100000, 1000000);
            candidate = "UR" + randomDigits;
        } while (repository.existsByUserCode(candidate));
        return candidate;
    }

    // LOGIN USER
    public User login(LoginDTO dto) {

        User user = repository.findByEmail(dto.getEmail());

        if(user == null){
            throw new RuntimeException("User not found");
        }

        if(!user.getPassword().equals(dto.getPassword())){
            throw new RuntimeException("Wrong password");
        }

        return user;
    }

    // GET USERS
    public java.util.List<User> getAllUsers() {
        return repository.findAll();
    }
}
