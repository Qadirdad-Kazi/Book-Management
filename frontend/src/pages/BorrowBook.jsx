// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

const BorrowBook = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    const handleBorrowBook = () => {
        setLoading(true);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const config = {
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            }
        };

        axios
            .put(`http://localhost:5555/api/books/borrow/${id}`, {}, config)
            .then(() => {
                setLoading(false);
                enqueueSnackbar("Book Borrowed Successfully", { variant: "success" });
                navigate("/");
            })
            .catch((error) => {
                setLoading(false);
                enqueueSnackbar(error.response?.data?.message || "Error borrowing book", { variant: "error" });
                console.error(error);
            });
    };

    return (
        <div className="p-4">
            <BackButton />
            <h1 className="text-3xl my-4">Borrow Book</h1>
            {loading ? <Spinner /> : ""}
            <div className="flex flex-col items-center border-2 border-indigo-400 rounded-xl w-[600px] p-8 mx-auto">
                <h3 className="text-2xl">Are you sure you want to borrow this book?</h3>
                <div className="flex gap-4 mt-8">
                    <button
                        className="bg-indigo-600 text-white px-8 py-2 rounded-lg hover:bg-indigo-700"
                        onClick={handleBorrowBook}
                    >
                        Yes, Borrow
                    </button>
                    <button
                        className="bg-gray-500 text-white px-8 py-2 rounded-lg hover:bg-gray-600"
                        onClick={() => navigate('/')}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BorrowBook;
