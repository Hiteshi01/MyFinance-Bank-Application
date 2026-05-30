package com.MyFin_Bank.UserService.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.MyFin_Bank.UserService.Service.UserService;
import com.MyFin_Bank.UserService.DTO.LoginDTO;
import com.MyFin_Bank.UserService.DTO.RegisterDTO;
import com.MyFin_Bank.UserService.Entity.User;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public User register(@RequestBody RegisterDTO dto){

        return service.register(dto);

    }

    @PostMapping("/login")
    public User login(@RequestBody LoginDTO dto){

        return service.login(dto);

    }

    @GetMapping("/all")
    public java.util.List<User> getAllUsers() {
        return service.getAllUsers();
    }

}
