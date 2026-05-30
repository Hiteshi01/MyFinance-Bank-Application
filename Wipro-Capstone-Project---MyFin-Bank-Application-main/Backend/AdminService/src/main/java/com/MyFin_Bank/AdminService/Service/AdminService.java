package com.MyFin_Bank.AdminService.Service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import com.MyFin_Bank.AdminService.DTO.AdminLoginDTO;
import com.MyFin_Bank.AdminService.DTO.AdminRegisterDTO;
import com.MyFin_Bank.AdminService.Entity.Admin;
import com.MyFin_Bank.AdminService.Repository.AdminRepository;

@Service
public class AdminService {

    private static final String ADMIN_REGISTRATION_KEY = "hacoonamatata";

    @Autowired
    private AdminRepository repository;

    @PostConstruct
    public void backfillAdminCodes() {
        List<Admin> admins = repository.findAll();
        for (Admin admin : admins) {
            if (admin.getAdminCode() == null || admin.getAdminCode().trim().isEmpty()) {
                admin.setAdminCode(generateAdminCode());
                repository.save(admin);
            }
        }
    }

    // REGISTER ADMIN
    public Admin register(AdminRegisterDTO dto){

        if(dto == null){
            throw new RuntimeException("Registration details are required");
        }

        String submittedKey = dto.getKey() == null ? "" : dto.getKey().trim();
        if(!ADMIN_REGISTRATION_KEY.equals(submittedKey)){
            throw new RuntimeException("Wrong key entered");
        }

        Admin existingAdmin = repository.findByEmail(dto.getEmail());

        if(existingAdmin != null){
            throw new RuntimeException("Admin email already exists");
        }

        Admin admin = new Admin();

        admin.setName(dto.getName());
        admin.setEmail(dto.getEmail());
        admin.setPassword(dto.getPassword());
        admin.setRole("ADMIN");
        admin.setAdminCode(generateAdminCode());

        return repository.save(admin);
    }

    // LOGIN ADMIN
    public Admin login(AdminLoginDTO dto){

        Admin admin = repository.findByEmail(dto.getEmail());

        if(admin == null){
            throw new RuntimeException("Admin not found");
        }

        if(!admin.getPassword().equals(dto.getPassword())){
            throw new RuntimeException("Wrong password");
        }

        return admin;
    }

    // GET ADMINS
    public List<Admin> getAllAdmins(){
        return repository.findAll();
    }

    // DELETE ADMIN
    public void deleteAdmin(Long id){
        repository.deleteById(id);
    }

    private String generateAdminCode() {
        String candidate;
        do {
            int randomDigits = ThreadLocalRandom.current().nextInt(100000, 1000000);
            candidate = "AD" + randomDigits;
        } while (repository.existsByAdminCode(candidate));
        return candidate;
    }
}
