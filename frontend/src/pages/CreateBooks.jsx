// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const CreateBooks = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publishYear, setPublishYear] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const validateForm = () => {
    if (!title.trim()) {
      enqueueSnackbar("Title is required", { variant: "error" });
      return false;
    }
    if (!author.trim()) {
      enqueueSnackbar("Author is required", { variant: "error" });
      return false;
    }
    if (!publishYear) {
      enqueueSnackbar("Publish Year is required", { variant: "error" });
      return false;
    }
    const year = parseInt(publishYear);
    if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
      enqueueSnackbar("Please enter a valid year", { variant: "error" });
      return false;
    }
    return true;
  };

  const handleSaveBook = () => {
    if (!validateForm()) return;

    const data = {
      title: title.trim(),
      author: author.trim(),
      publishYear: parseInt(publishYear),
    };

    console.log('Sending data to server:', data);
    setLoading(true);

    // Get the auth token from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const config = {
      headers: { 
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      }
    };

    axios
      .post("http://localhost:5555/api/books", data, config)
      .then((response) => {
        setLoading(false);
        console.log('Server response:', response.data);
        enqueueSnackbar("Book Created Successfully", { variant: "success" });
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error creating book:', error.response?.data || error.message);
        enqueueSnackbar(error.response?.data?.message || "Error creating book", { 
          variant: "error" 
        });
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Book</h1>
          <BackButton />
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="card">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveBook(); }} className="space-y-6">
              <div>
                <label htmlFor="title" className="input-label">
                  Book Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label htmlFor="author" className="input-label">
                  Author Name
                </label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="input-field"
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label htmlFor="publishYear" className="input-label">
                  Publication Year
                </label>
                <input
                  id="publishYear"
                  type="number"
                  value={publishYear}
                  onChange={(e) => setPublishYear(e.target.value)}
                  className="input-field"
                  placeholder="Enter publication year"
                  min="1000"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Book
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateBooks;
