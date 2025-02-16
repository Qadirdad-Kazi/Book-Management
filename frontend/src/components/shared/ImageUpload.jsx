import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { FiUpload, FiX } from 'react-icons/fi';
import { getApiUrl } from '../../config/api';

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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.post(
        getApiUrl('/api/upload/single'), 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      onImageUpload(response.data);
      enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setPreview(initialImage);
      enqueueSnackbar(error.response?.data?.message || 'Error uploading image', { 
        variant: 'error' 
      });
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

  return (
    <div className={className}>
      <div className="relative">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <FiUpload className="w-8 h-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Click to upload image</p>
            <p className="text-xs text-gray-400">Max size: 5MB</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
