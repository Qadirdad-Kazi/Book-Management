# 📚 Book Management System

A modern full-stack web application for managing your book collection. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18.0%2B-green.svg)
![React](https://img.shields.io/badge/React-v18.0%2B-blue.svg)

## ✨ Features

- 📖 Create, Read, Update, and Delete books
- 🔍 Advanced search with filters and real-time suggestions
- 📸 Image upload with Cloudinary integration
- 📚 ISBN lookup and book metadata auto-fill
- 🔄 Switch between Table and Card views
- 🔒 Enhanced authentication with role-based access
- 📊 Admin dashboard with analytics
- 💾 Automated backup system
- 🔎 Elasticsearch-powered search
- 📱 Mobile-friendly design
- ⚡ Fast and efficient data handling
- 🚀 RESTful API architecture

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- Tailwind CSS
- React Icons
- Notistack (for notifications)
- Recharts (for analytics)
- React Dropzone (for image upload)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Elasticsearch
- Cloudinary
- AWS S3 (for backups)
- JWT for authentication
- bcryptjs for password hashing
- node-cron (for scheduled tasks)
- CORS

### Services
- Cloudinary (image storage)
- AWS S3 (backup storage)
- Elasticsearch (search engine)
- Google Books API (ISBN lookup)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/book-management.git
cd book-management
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create a .env file in the backend directory
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5555

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Elasticsearch
ELASTICSEARCH_URL=your_elasticsearch_url
ELASTICSEARCH_USERNAME=your_username
ELASTICSEARCH_PASSWORD=your_password

# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BACKUP_BUCKET=your_bucket_name
```

5. Start the backend server
```bash
cd backend
npm run dev
```

6. Start the frontend application
```bash
cd frontend
npm run dev
```

## 📱 Usage

1. **View Books**: Browse your book collection in either table or card view
2. **Add Books**: Click the "Add Book" button to create a new book entry
   - Upload book covers
   - Auto-fill book details using ISBN
3. **Search Books**: Use advanced search with filters
   - Search by title, author, or description
   - Filter by genres, rating, and publication year
   - Get real-time search suggestions
4. **Edit Books**: Use the edit icon to modify existing book details
5. **Delete Books**: Remove books from your collection using the delete icon
6. **Book Details**: View detailed information about each book
7. **Admin Dashboard**: Access system metrics and management tools
   - View user activity and system performance
   - Manage backups
   - Monitor error logs
   - Track system metrics
 
## 🔐 API Endpoints

### Books
- GET `/api/books` - Get all books
- GET `/api/books/:id` - Get a specific book
- POST `/api/books` - Create a new book
- PUT `/api/books/:id` - Update a book
- DELETE `/api/books/:id` - Delete a book

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile

### Search
- GET `/api/search/books` - Search books with filters
- GET `/api/search/suggest` - Get search suggestions
- GET `/api/search/isbn/:isbn` - Lookup book by ISBN

### Admin
- GET `/api/admin/metrics/system` - Get system metrics
- GET `/api/admin/metrics/users` - Get user metrics
- GET `/api/admin/metrics/books` - Get book metrics
- GET `/api/admin/logs/errors` - Get error logs
- GET `/api/admin/backups` - List backups
- POST `/api/admin/backup` - Create backup
- POST `/api/admin/backup/:id/restore` - Restore from backup

### Upload
- POST `/api/upload/image` - Upload book cover
- DELETE `/api/upload/image/:id` - Delete book cover

## 🎨 UI Components

- Modern and clean interface
- Advanced search interface with filters
- Admin dashboard with charts and metrics
- Image upload with drag-and-drop
- ISBN lookup with auto-fill
- Responsive design for all screen sizes
- Interactive table and card views
- Loading states and animations
- Error handling with user-friendly messages
- Form validation with clear feedback

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Elasticsearch](https://www.elastic.co/)
- [Cloudinary](https://cloudinary.com/)
- [AWS](https://aws.amazon.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Recharts](https://recharts.org/)
