# Sales Management System

A backend system for managing **products, orders, and customers** built with **Spring Boot**.  
The system provides REST APIs for product management, order processing, authentication, and payment integration.

This project was developed to gain **hands-on experience with Spring Boot backend development, API design, authentication, and payment integration**.

---

# Features

## User Features

- User authentication with **JWT**
- Browse products
- Create and manage orders
- Secure login and authorization
- Order payment support

## Admin Features

- Product management (CRUD)
- Order management
- Customer management
- Admin dashboard for monitoring system data
- Upload product images

## Payment Integration

- **PayOS** payment gateway
- **VNPay** sandbox payment
- **Sepay** payment webhook

---

# Tech Stack

## Backend

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate

## Database

- Microsoft SQL Server
- JPA / Hibernate ORM

## Authentication

- JWT (JSON Web Token)

## External Services

- Cloudinary – image storage
- Gmail SMTP – email service
- PayOS – online payment
- VNPay – payment gateway

## Other Libraries

- Lombok
- Apache HttpClient
- PDFBox

---

# Project Structure

```
QuanLyBanHang
│
├── backend
│   ├── src/main/java/com/example/demo
│   │   ├── controllers
│   │   ├── services
│   │   ├── repositories
│   │   ├── entity
│   │   ├── models
│   │   ├── configs
│   │   ├── utils
│   │   ├── filter
│   │   ├── exceptions
│   │   └── DemoApplication.java
│   │
│   ├── resources
│   │   └── application.yml
│   │
│   └── pom.xml
│
├── frontend
```

---

# Backend Setup

## 1 Install dependencies

```bash
mvn clean install
```

## 2 Configure database

Edit `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1435;databaseName=QuanLyBanHang
    username: sa
    password: your_password
```

## 3 Run the application

```bash
mvn spring-boot:run
```

Server will start at:

```
http://localhost:8080
```

---

# Core Modules

## Authentication

- JWT-based authentication
- Secure API access using Spring Security

## Product Management

- Create products
- Update product information
- Delete products
- Upload product images

## Order Management

- Create orders
- Track order status
- Payment integration

## Customer Management

- Manage customer accounts
- View customer order history

---

# Payment Integration

The system integrates multiple payment gateways:

### PayOS
Used for online payment processing.

### VNPay
Sandbox integration for payment testing.

### Sepay
Webhook-based payment notification.

---

# Email Service

The system supports sending emails using **Gmail SMTP**, which can be used for:

- Order confirmation
- Notifications
- Account related emails

---

# Author

This project was developed to gain **hands-on experience with Spring Boot backend development, API design, authentication, and payment integration**.
