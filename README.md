# Finance Dashboard Backend

## Project Description

This project is a backend system built using Node.js and Express for managing users and financial transactions. It supports role-based access control, CRUD operations for users and transactions, and provides summary APIs for dashboard analytics.

SQLite is used as the database for simplicity and local persistence.

---

## Tech Stack

* Node.js
* Express.js
* SQLite3
* Nodemon
* Thunder Client (for testing APIs)

---

## Project Structure

finance-dashboard-backend/
│
├── config/
│   └── db.js              # Database connection and table creation
│
├── routes/                # (Optional, not used currently)
├── controllers/           # (Optional, not used currently)
├── models/                # (Optional, not used currently)
├── middleware/            # (Optional, can be used for role checks)
│
├── app.js                 # Main server file with all APIs
├── database.sqlite        # SQLite database file
├── .env                   # Environment variables (PORT)
├── package.json           # Dependencies and scripts
├── package-lock.json
└── README.md

---

## Installation and Setup

1. Clone the repository
   git clone <your-repo-link>
   cd finance-dashboard-backend

2. Install dependencies
   npm install

3. Run the server
   npm run dev

4. Server runs on
   http://localhost:5000

---

## Packages Used

* express: for building APIs
* sqlite3: for database
* cors: to enable cross-origin requests
* dotenv: for environment variables
* nodemon: for auto-restart during development

---

## Database Design

### Users Table

* id (Primary Key)
* name
* email
* role (viewer / analyst / admin)
* status (active / inactive)

### Transactions Table

* id (Primary Key)
* amount
* type (income / expense)
* category
* date
* note

---

## Implemented Features

### 1. User Management

* Create user
* Get all users
* Update user
* Delete user
* Assign role and status

---

### 2. Transaction Management

* Add transaction
* Get all transactions
* Filter transactions (type, category)
* Update transaction
* Delete transaction

---

### 3. Dashboard APIs

* Total income, total expense, balance
* Category-wise totals
* Recent transactions

---

### 4. Access Control

* Role-based access implemented using middleware
* Role is passed through request headers
* Viewer: read-only access
* Analyst: read + analytics
* Admin: full access

---

### 5. Validation and Error Handling

* Required fields validation
* Proper error messages returned
* HTTP status codes used (400, 403, 500)

---

## API Endpoints

### User APIs

POST /add-user
GET /users
PUT /update-user/:id
DELETE /delete-user/:id

---

### Transaction APIs

POST /add-transaction
GET /transactions
GET /transactions?type=expense&category=food
PUT /update-transaction/:id
DELETE /delete-transaction/:id

---

### Dashboard APIs

GET /summary
GET /category-summary
GET /recent-transactions

---

## Testing

All APIs were tested using Thunder Client inside VS Code.

Steps:

* Start server using npm run dev
* Send requests to http://localhost:5000
* Pass role in headers (admin / analyst / viewer)

---

## Output Examples

### Summary API

{
"totalIncome": 5000,
"totalExpense": 1200,
"balance": 3800
}

### Category Summary

[
{ "category": "food", "total": 1200 }
]

---

## Design Decisions

* SQLite was chosen for simplicity and quick setup
* Express.js used for lightweight API development
* Middleware used for implementing role-based access control
* APIs structured to support frontend dashboard requirements

---

## Limitations

* No authentication (JWT not implemented)
* No pagination
* No advanced filtering or search

---

## Future Improvements

* Add authentication and authorization
* Implement pagination and search
* Add Swagger API documentation
* Write unit tests
* Modularize code using routes and controllers

---

## Conclusion

This backend system demonstrates structured API design, role-based access control, CRUD operations, and dashboard analytics using a simple and efficient setup.
