import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";

const BooksCard = ({ books }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <div
          key={book._id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {book.title}
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-medium">Author:</span> {book.author}
              </p>
              <p>
                <span className="font-medium">Publish Year:</span>{" "}
                {book.publishYear}
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <Link
                to={`/books/details/${book._id}`}
                className="text-blue-600 hover:text-blue-900"
              >
                <BsInfoCircle className="text-2xl" />
              </Link>
              <Link
                to={`/books/edit/${book._id}`}
                className="text-yellow-600 hover:text-yellow-900"
              >
                <AiOutlineEdit className="text-2xl" />
              </Link>
              <Link
                to={`/books/delete/${book._id}`}
                className="text-red-600 hover:text-red-900"
              >
                <MdOutlineDelete className="text-2xl" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BooksCard;
