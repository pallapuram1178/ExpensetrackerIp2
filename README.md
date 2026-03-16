# Expense Tracker with Oracle Database

A full-stack expense tracking application with React frontend and Node.js backend connected to Oracle SQL database.

## Prerequisites

- Node.js (v14 or higher)
- Oracle Database (installed and running)
- Oracle Instant Client (for oracledb npm package)

## Setup Instructions

### 1. Oracle Database Setup

1. Install Oracle Database (you mentioned you're installing Oracle SQL)
2. Create a user and database for the application
3. Note down your connection details:
   - Username
   - Password
   - Connection string (e.g., localhost:1521/XE for Express Edition)

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd d:\ip2\backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update database configuration in `server.js`:
   ```javascript
   const dbConfig = {
     user: 'your_oracle_username',
     password: 'your_oracle_password',
     connectString: 'localhost:1521/XE' // Update with your connection string
   };
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```

   The server will run on http://localhost:3001

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd d:\ip2\ip2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm run dev
   ```

   The app will run on http://localhost:5173 (or similar)

## Features

- User registration and login with JWT authentication
- Add, view expenses and incomes
- Dashboard with summary statistics
- Reports with categorized data
- Oracle database integration
- Minimalist UI design

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses for logged-in user
- `POST /api/expenses` - Add new expense

### Incomes
- `GET /api/incomes` - Get all incomes for logged-in user
- `POST /api/incomes` - Add new income

## Database Schema

The application automatically creates the following tables:

- `users` - User accounts
- `expenses` - Expense records
- `incomes` - Income records

## Security

- Passwords are hashed using bcrypt
- JWT tokens for session management
- CORS enabled for frontend-backend communication

## Troubleshooting

1. **Oracle Connection Issues**: Ensure Oracle Database is running and connection string is correct
2. **Port Conflicts**: Make sure ports 3001 (backend) and 5173 (frontend) are available
3. **CORS Errors**: Backend has CORS enabled, but check if running on different ports
4. **Database Permissions**: Ensure the Oracle user has permissions to create tables and insert data

## Development

- Backend uses Express.js with oracledb driver
- Frontend uses React with modern hooks
- Data flows from React components → API calls → Oracle DB → Response → UI updates"# ExpensetrackerIp2" 
