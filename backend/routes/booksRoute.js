import express from "express";
import { Book } from "../models/bookModel.js";
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Route for save a new book
router.post("/", auth, async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ) {
      return response.status(400).send({
        message: "Send all required fields: title, author, publishYear",
      });
    }

    const newBook = {
      title: request.body.title.trim(),
      author: request.body.author.trim(),
      publishYear: parseInt(request.body.publishYear),
      owner: request.user._id // Add owner from authenticated user
    };

    console.log('Attempting to create book:', newBook);
    const book = await Book.create(newBook);
    console.log('Book created successfully:', book);

    return response.status(201).send(book);
  } catch (error) {
    console.error('Error creating book:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    response.status(500).send({ 
      message: 'Error creating book',
      error: error.message 
    });
  }
});

// Route for get all books from db
router.get("/", auth, async (request, response) => {
  try {
    const books = await Book.find({});
    return response.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    response.status(500).send({ message: error.message });
  }
});

// Route for get books from db by id
router.get("/:id", auth, async (request, response) => {
  try {
    const { id } = request.params;

    console.log('Attempting to fetch book by id:', id);
    const book = await Book.findById(id);
    console.log('Book fetched successfully:', book);

    return response.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book by id:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    response.status(500).send({ 
      message: 'Error fetching book',
      error: error.message 
    });
  }
});

// Route for update a book
router.put("/:id", auth, async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ) {
      return response.status(400).send({
        message: "Send all required fields: title, author, publishYear",
      });
    }

    const { id } = request.params;

    console.log('Attempting to update book by id:', id);
    const result = await Book.findByIdAndUpdate(id, request.body);
    console.log('Book updated successfully:', result);

    if (!result) {
      return response.status(404).json({ message: "Book not found!" });
    }
    return response.status(200).json({ message: "Book updated successfully!" });
  } catch (error) {
    console.error('Error updating book:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    response.status(500).send({ 
      message: 'Error updating book',
      error: error.message 
    });
  }
});

// Route for delete a book
router.delete("/:id", auth, async (request, response) => {
  try {
    const { id } = request.params;

    console.log('Attempting to delete book by id:', id);
    const result = await Book.findByIdAndDelete(id);
    console.log('Book deleted successfully:', result);

    if (!result) {
      return response.status(404).json({ message: "Book not found!" });
    }
    return response.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    console.error('Error deleting book:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    response.status(500).send({ 
      message: 'Error deleting book',
      error: error.message 
    });
  }
});

export default router;
