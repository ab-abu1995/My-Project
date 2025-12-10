# Online-Savings-Loan-Cooperative-System
# 🏦 Online Savings & Loan Cooperative System – Project Overview

## 1. Project Overview
This system allows cooperative members to **manage savings, request loans, and track repayments online**.  
Admins can manage members, approve loans, and generate financial reports.  

**Frontend:** HTML, CSS, JavaScript  
**Backend:** PHP  
**Database:** MySQL  

---

## 2. System Features

### Member Features
- Register and Login  
- View dashboard  
- Deposit & Withdraw savings  
- Apply for loans  
- View loan status  

### Admin Features
- Manage members  
- Approve or reject loans  
- Monitor transactions  
- Generate financial reports  

### System Reports
- Daily savings summary  
- Loan repayment history  
- Member balance sheet  

---

cooperative-system/
│
├── index.html # Homepage
├── login.html # Login page
├── register.html # Registration page
│
├── dashboard/ # User/Admin dashboards
│ ├── member.html # Member dashboard
│ ├── admin.html # Admin dashboard
│ ├── savings.html # Savings module
│ └── loans.html # Loan module
│
├── includes/ # Reusable PHP includes
│ ├── header.php
│ ├── footer.php
│ ├── navbar.php
│ ├── auth.php # Authentication functions
│ └── db.php # Database connection
│
├── actions/ # Form actions / backend logic
│ ├── register_action.php
│ ├── login_action.php
│ ├── deposit_action.php
│ ├── withdraw_action.php
│ ├── loan_request_action.php
│ ├── loan_approve_action.php
│ └── repay_action.php
│
├── css/
│ └── style.css # All styles
│
├── js/
│ └── app.js # All frontend logic
│
└── database/
└── coop.sql # Database structure


---

## 4. Database Design

### members
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR | Member full name |
| email | VARCHAR | Login email |
| phone | VARCHAR | Contact number |
| password | VARCHAR | Hashed password |
| role | ENUM('admin','member') | User role |
| created_at | DATETIME | Account creation date |

### savings
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| member_id | INT | FK → members.id |
| amount | DECIMAL | Transaction amount |
| type | ENUM('deposit','withdraw') | Transaction type |
| date | DATETIME | Transaction date |

### loans
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| member_id | INT | FK → members.id |
| amount | DECIMAL | Loan requested amount |
| status | ENUM('pending','approved','rejected') | Loan status |
| interest | DECIMAL | Interest applied |
| total_payable | DECIMAL | Total repayment amount |
| created_at | DATETIME | Loan creation date |

### loan_payments
| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| loan_id | INT | FK → loans.id |
| amount | DECIMAL | Payment amount |
| date | DATETIME | Payment date |

---

## 5. Frontend Design

### Homepage (index.html)
- Welcome message  
- Navigation to Login & Register  
- Brief system overview  

### Login Page (login.html)
- Email & password fields  
- Login button  
- Link to registration  

### Register Page (register.html)
- Name, Email, Password, Phone fields  
- Register button  
- Link to login  

### Dashboard
- Member: view savings, loans, request loan  
- Admin: manage members, approve loans, reports  

### Styling
- **CSS**: style.css  
- Responsive, clean layout  
- Forms, tables, buttons, and alerts  

### JS Logic (app.js)
- Form validations  
- Dynamic dashboard updates  
- Connects to PHP backend via forms or fetch API  

---

## 6. Development Notes
- **Frontend-first approach:** Build HTML/CSS/JS pages before connecting PHP backend.  
- **Backend:** Handle database operations, authentication, transactions.  
- **Security:**  
  - Hash passwords using `password_hash()`  
  - Use prepared statements to prevent SQL injection  
  - Manage user sessions for login  

---

## 7. Suggested Workflow
1. Build frontend pages (HTML, CSS, JS)  
2. Build PHP backend for authentication  
3. Connect frontend forms to PHP actions  
4. Implement savings & loan modules  
5. Build admin panel & reports  
6. Test system thoroughly  

---


## 3. Folder Structure

