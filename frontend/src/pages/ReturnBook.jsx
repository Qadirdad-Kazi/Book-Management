// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

const ReturnBook = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    const handleReturnBook = () => {
        setLoading(true);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const config = {
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            }
        };

        axios
            .put(`http://localhost:5555/api/books/return/${id}`, {}, config)
            .then(() => {
                setLoading(false);
                enqueueSnackbar("Book Returned Successfully", { variant: "success" });
                navigate("/");
            })
            .catch((error) => {
                setLoading(false);
                enqueueSnackbar(error.response?.data?.message || "Error returning book", { variant: "error" });
                console.error(error);
            });
    };

    return (
        <div className="p-4">
            <BackButton />
            <h1 className="text-3xl my-4">Return Book</h1>
            {loading ? <Spinner /> : ""}
            <div className="flex flex-col items-center border-2 border-green-400 rounded-xl w-[600px] p-8 mx-auto">
                <h3 className="text-2xl">Are you sure you want to return this book?</h3>
                <div className="flex gap-4 mt-8">
                    <button
                        className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700"
                        onClick={handleReturnBook}
                    >
                        Yes, Return
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

export default ReturnBook;
