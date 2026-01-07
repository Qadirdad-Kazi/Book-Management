# 📚 Book Management System

A modern full-stack web application for managing your book collection. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18.0%2B-green.svg)
![React](https://img.shields.io/badge/React-v18.0%2B-blue.svg)
![Jest](https://img.shields.io/badge/Test-Jest-red.svg)

## ✨ Features

- 📖 **CRUD Operations**: Create, Read, Update, and Delete books
- 🔄 **Borrow/Return System**: Library-style management with status tracking
- 🔍 **Search**: Find books by title or author
- 💰 **Fine Calculation**: Automated logic for overdue books
- 🔒 **Authentication**: Secure login/registration with JWT
- 🧪 **Comprehensive Testing**: Unit, Integration, and Manual test suites

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS**
- **React Router DOM**
- **Notistack** (Notifications)

### Backend
- **Node.js & Express.js**
- **MongoDB** (Mongoose)
- **JWT** (Authentication)

### Testing
- **Jest** (Unit & Integration)
- **Supertest** (API Testing)
- **MongoDB Memory Server** (Test Database)
- **JMeter** (Functional/Load Testing)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/book-management.git
   cd book-management
   ```

2. **Install Dependencies (Root)**
   ```bash
   npm install
   ```
   *This installs dependencies for both backend and frontend.*

3. **Environment Setup**
   Create `backend/.env` file:
   ```env
   PORT=5555
   CONNECTION_STRING=mongodb://localhost:27017/book_management
   JWT_SECRET=your_secret_key
   ```

4. **Start the Application**
   
   *Backend:*
   ```bash
   cd backend
   npm run dev
   ```

   *Frontend:*
   ```bash
   cd frontend
   npm run dev
   ```

## 🧪 Testing

We have implemented a robust testing strategy covering Unit, Regression, and Manual testing scenarios.

### 1. Unit Tests (Library Service)
Tests the business logic for Search, Borrow, Return, and Fines.
```bash
npm run test:library
```

### 2. Regression Tests (End-to-End)
Tests the full user flow (Register -> Login -> Create -> Update -> Delete) using an in-memory database.
```bash
npm run test:regression
```

### 3. API Tests (Jest)
Standard API route testing.
```bash
npm test
```

### 4. Manual Testing
Refer to [MANUAL_TESTS.md](./tests/MANUAL_TESTS.md) and [MANUAL_TEST_INSTRUCTIONS.md](./tests/MANUAL_TEST_INSTRUCTIONS.md) for detailed steps on how to verify features manually using cURL or UI.

### 5. JMeter Testing
A JMeter test plan is available at `tests/jmeter/BookManagementTestPlan.jmx` for functional and load testing.

## 🔐 API Endpoints

### Books
- `GET /api/books` - Get all books (supports `?search=query`)
- `GET /api/books/:id` - Get specific book
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book details
- `DELETE /api/books/:id` - Delete book
- `PUT /api/books/borrow/:id` - Borrow a book
- `PUT /api/books/return/:id` - Return a book

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
