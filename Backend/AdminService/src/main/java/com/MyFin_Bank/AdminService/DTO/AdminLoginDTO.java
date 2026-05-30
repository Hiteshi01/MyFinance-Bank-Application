package com.MyFin_Bank.AdminService.DTO;

public class AdminLoginDTO {

    private String email;
    private String password;

    public AdminLoginDTO(){}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}