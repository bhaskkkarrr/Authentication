# 🔐 Authentication Backend System

## 🚀 Features
- User register & login
- JWT authentication
- Password hashing (bcrypt)
- OTP verification
- Session based login/logout
- Logout from all devices
- Refresh tokens and Access Tokens

## 🛠 Tech Stack
- Node.js / Express
- MongoDB 
- JWT
- bcrypt
- nodemailer
- OAuth2

## 📦 API Endpoints
| Method | Route | Description |
|--------|------|------------|
| POST | /register | Create user |
| POST | /login | Authenticate user |
| GET | /getAccessToken | Regenerate access token |
| GET | /logout | Logout user |
| GET | /verify-email | Verify email using OTP |
| GET | /logout-all | Logout from all devices |

## ⚙️ Setup Instructions
1. Clone repo
2. npm install
3. Add .env
4. npm start
