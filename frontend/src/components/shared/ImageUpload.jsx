import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FiUpload, FiX } from 'react-icons/fi';

const ImageUpload = ({ onImageUpload, initialImage, className }) => {
  const [preview, setPreview] = useState(initialImage);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const { enqueueSnackbar } = useSnackbar();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please select an image file', { variant: 'error' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Image size should be less than 5MB', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      // Upload image
      const response = await axios.post('http://localhost:5555/api/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: \`Bearer \${localStorage.getItem('token')}\`
        }
      });

      onImageUpload(response.data);
      enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error uploading image:', error);
      enqueueSnackbar('Error uploading image', { variant: 'error' });
      setPreview(initialImage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file) {
      const changeEvent = {
        target: {
          files: [file]
        }
      };
      handleFileChange(changeEvent);
    }
  };

  return (
    <div className={className}>
      <div
        className="relative w-full h-64 border-2 border-dashed rounded-lg overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full h-full group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50">
            <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Drag and drop an image, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-500 hover:text-blue-600"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP up to 5MB
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
