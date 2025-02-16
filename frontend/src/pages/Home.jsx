// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { Link } from "react-router-dom";
import { MdOutlineAddBox, MdTableView, MdGridView } from "react-icons/md";
import BooksTable from "../components/home/BooksTable";
import BooksCard from "../components/home/BooksCard";
import { useSnackbar } from "notistack";
import AdvancedSearch from "../components/books/AdvancedSearch";
import Navigation from "../components/shared/Navigation";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showType, setShowType] = useState("table");
  const { enqueueSnackbar } = useSnackbar();

  const fetchBooks = async (searchParams = {}) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const config = {
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        params: searchParams
      };
      
      const response = await axios.get("http://localhost:5555/api/books", config);
      setBooks(response.data.data);
    } catch (error) {
      console.error('Error fetching books:', error.response?.data || error.message);
      enqueueSnackbar(error.response?.data?.message || "Error fetching books", { 
        variant: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (searchResults) => {
    setBooks(searchResults);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Book Collection</h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
                <button
                  className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200 ${
                    showType === "table"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setShowType("table")}
                >
                  <MdTableView className="text-xl" />
                  <span>Table</span>
                </button>
                <button
                  className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200 ${
                    showType === "card"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setShowType("card")}
                >
                  <MdGridView className="text-xl" />
                  <span>Cards</span>
                </button>
              </div>

              <Link
                to="/books/create"
                className="btn-primary flex items-center space-x-2"
              >
                <MdOutlineAddBox className="text-xl" />
                <span>Add Book</span>
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <AdvancedSearch onSearch={handleSearch} className="w-full" />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md">
              {books.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p className="text-xl mb-4">No books found</p>
                  <Link to="/books/create" className="btn-primary">
                    Add Your First Book
                  </Link>
                </div>
              ) : showType === "table" ? (
                <div className="overflow-x-auto">
                  <BooksTable books={books} />
                </div>
              ) : (
                <div className="p-6">
                  <BooksCard books={books} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
