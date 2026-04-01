# 🔐 Authentication Backend System

## Key Features 
🔐 Secure user registration with hashed passwords
📧 OTP-based email verification system
🔑 JWT authentication (Access + Refresh tokens)
🔄 Refresh token rotation mechanism
🍪 HTTP-only secure cookies for token storage
📱 Multi-device session management
🌍 Session tracking (IP + user-agent)
🚪 Logout (single session + all devices)
🛡 Token hashing for enhanced security

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
