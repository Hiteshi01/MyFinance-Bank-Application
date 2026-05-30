# Wipro-Capstone-Project---MyFin-Bank-Application
A full-stack digital banking application built using React and Spring Boot, enabling secure user transactions, account management, and real-time communication between customers and admin.

🚀 Features
👤 User Features

User Registration & Login (JWT Authentication)

View Account Details

Perform Transactions (Deposit, Withdraw, Transfer)

Transaction History

Secure Chat with Admin

🧑‍💼 Admin Features

Monitor Users

View Transactions

Respond to Customer Queries (Chat System)

Manage Banking Operations

💬 Chat System

Real-time-like messaging between User and Admin

Correct message ownership:

User → “You” (user side), “User sent it” (admin side)

Admin → “Admin” (user side), “You (Admin)” (admin side)

Clean chat UI with timestamps

🏗️ Tech Stack
#Frontend

React.js

Axios

React Router

CSS

#Backend

Spring Boot

Spring Data JPA

Spring Security

JWT Authentication

#Database

MySQL

Tools

Maven

Git & GitHub

Postman

📂 Project Structure
🔹 Frontend (React)
src/
 ├── components/
 ├── pages/
 │    ├── user/
 │    ├── admin/
 ├── services/
 ├── utils/
 ├── App.js
 └── index.js
🔹 Backend (Spring Boot)
com.myfinbank/
 ├── controller/
 ├── service/
 ├── repository/
 ├── model/
 ├── dto/
 ├── security/
 └── config/
 
🔄 Application Flow

User Action (React UI)
        ↓
Axios API Call
        ↓
Spring Boot Controller
        ↓
Service Layer (Business Logic)
        ↓
Repository (JPA)
        ↓
MySQL Database
        ↓
Response (JSON)
        ↓
React UI Update

🔐 Authentication

JWT-based authentication

Token stored in localStorage

Secure API access using Authorization headers

⚙️ Setup Instructions

🔹 Backend Setup
cd backend
mvn clean install
mvn spring-boot:run

Configure application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/myfinbank
spring.datasource.username=root
spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=update
server.port=8080


🔹 Frontend Setup
cd frontend
npm install
npm start

Runs on:

http://localhost:3000

📡 API Endpoints
Auth

POST /api/auth/login

POST /api/auth/register

Chat

POST /api/chat/send

GET /api/chat/messages

Transactions

GET /api/transactions

POST /api/transfer

🧪 Testing

Use Postman for backend API testing

Check Network tab in browser for frontend requests

Ensure correct payload structure for chat:

{
  "senderId": 1,
  "receiverId": 2,
  "content": "Hello"
}

🌟 Future Improvements

Real-time chat using WebSockets

Typing indicators

Chat notifications

Multi-user chat support

Enhanced UI (WhatsApp-style)

👨‍💻 Author

Aryan Soni

Passionate Full Stack Developer

Skilled in Java, React, and System Design

Interested in building scalable applications

📌 Conclusion

MyFin Bank is a complete full-stack banking system demonstrating:

Secure authentication

REST API design

Frontend-backend integration

Real-world chat implementation
