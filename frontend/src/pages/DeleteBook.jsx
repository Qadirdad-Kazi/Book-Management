// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

const DeleteBook = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteBook = () => {
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const config = {
      headers: { 
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      }
    };

    axios
      .delete(`http://localhost:5555/api/books/${id}`, config)
      .then(() => {
        setLoading(false);
        enqueueSnackbar("Book Deleted Successfully", { variant: "success" });
        navigate("/");
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar(error.response?.data?.message || "Error deleting book", { variant: "error" });
        console.error(error);
      });
  };

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-3xl my-4">Delete Book</h1>
      {loading ? <Spinner /> : ""}
      <div className="flex flex-col items-center border-2 border-sky-400 rounded-xl w-[600px] p-8 mx-auto">
        <h3 className="text-2xl">Are you sure you want to delete this book?</h3>
        <div className="flex gap-4 mt-4">
          <button 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            onClick={handleDeleteBook}
          >
            Yes, Delete
          </button>
          <button 
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBook;
