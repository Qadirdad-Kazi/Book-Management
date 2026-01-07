# Manual Test Report

This document outlines the manual test cases for the Book Management System, mapping to the student requirements.

| Module | Test Case ID | Description | Input | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Login** | **UT01** | Valid login | `admin@example.com` / `12345678` | Login Success, Token returned | **PASS** |
| **Login** | **UT02** | Invalid password | `admin@example.com` / `wrongpass` | Error 401: Invalid credentials | **PASS** |
| **Search** | **UT05** | Search valid book | Query: `"Python"` | List containing book "Python Programming" | **PASS** |
| **Search** | **UT06** | Search invalid book | Query: `"ZyxwvUT"` | Empty List | **PASS** |
| **Borrow** | **UT08** | Borrow available book | Request to borrow Book ID `101` | Status updates to 'Borrowed' | **PASS** |
| **Borrow** | **UT09** | Borrow already borrowed | Request to borrow Book ID `101` (status: Borrowed) | Error: Book already borrowed | **PASS** |
| **Return** | **UT11** | Return borrowed book | Request to return Book ID `101` | Status updates to 'Available' | **PASS** |
| **Fine** | **UT13** | Late return 3 days | Due: `2023-01-01`, Return: `2023-01-04` | Fine calculated as `30` | **PASS** |

## Notes on Implementation
- **Login**: Implemented via JWT Authentication in `authRoute.js`.
- **Search**: Implemented in `booksRoute.js` via `GET /api/books?search=query`.
- **Borrow/Return**: Business logic implemented in `LibraryService.js` and tested via Unit Tests.
- **Fine**: Calculation logic implemented in `LibraryService.js` and tested via Unit Tests.
