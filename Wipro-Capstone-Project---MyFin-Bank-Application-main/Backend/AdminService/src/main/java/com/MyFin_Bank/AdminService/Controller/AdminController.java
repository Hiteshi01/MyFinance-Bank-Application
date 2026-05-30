package com.MyFin_Bank.AdminService.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.MyFin_Bank.AdminService.DTO.AdminLoginDTO;
import com.MyFin_Bank.AdminService.DTO.AdminRegisterDTO;
import com.MyFin_Bank.AdminService.Entity.Admin;
import com.MyFin_Bank.AdminService.Service.AdminService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService service;

    @PostMapping("/register")
    public Admin register(@RequestBody AdminRegisterDTO dto){
        return service.register(dto);
    }

    @PostMapping("/login")
    public Admin login(@RequestBody AdminLoginDTO dto){
        return service.login(dto);
    }

    @GetMapping("/all")
    public List<Admin> getAllAdmins(){
        return service.getAllAdmins();
    }

    @DeleteMapping("/delete/{id}")
    public String deleteAdmin(@PathVariable Long id){

        service.deleteAdmin(id);

        return "Admin Deleted Successfully";
    }
}
