import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";

const BooksTable = ({ books }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="table-header">No</th>
          <th className="table-header">Title</th>
          <th className="table-header">Author</th>
          <th className="table-header">Publish Year</th>
          <th className="table-header">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {books.map((book, index) => (
          <tr key={book._id} className="hover:bg-gray-50">
            <td className="table-cell">{index + 1}</td>
            <td className="table-cell font-medium">{book.title}</td>
            <td className="table-cell">{book.author}</td>
            <td className="table-cell">{book.publishYear}</td>
            <td className="table-cell">
              <div className="flex items-center space-x-4">
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
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BooksTable;
