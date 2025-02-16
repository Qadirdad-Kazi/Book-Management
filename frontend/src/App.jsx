import React from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import { SnackbarProvider } from 'notistack'

import Home from './pages/Home'
import CreateBook from './pages/CreateBooks'
import ShowBook from './pages/ShowBook'
import EditBook from './pages/EditBook'
import DeleteBook from './pages/DeleteBook'
import Dashboard from './components/admin/Dashboard'
import ProtectedRoute from './components/shared/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'

const App = () => {
  return (
    <SnackbarProvider maxSnack={3}>
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Protected Routes */}
        <Route path='/' element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path='/books/create' element={
          <ProtectedRoute>
            <CreateBook />
          </ProtectedRoute>
        } />
        <Route path='/books/details/:id' element={
          <ProtectedRoute>
            <ShowBook />
          </ProtectedRoute>
        } />
        <Route path='/books/edit/:id' element={
          <ProtectedRoute>
            <EditBook />
          </ProtectedRoute>
        } />
        <Route path='/books/delete/:id' element={
          <ProtectedRoute>
            <DeleteBook />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route 
          path='/admin/dashboard' 
          element={
            <ProtectedRoute roles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SnackbarProvider>
  )
}

export default App