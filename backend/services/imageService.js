import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'book-management',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 500, height: 750, crop: 'fill' }, // Standard book cover size
      { quality: 'auto' }, // Auto-optimize quality
      { fetch_format: 'auto' } // Auto-select best format
    ]
  }
});

// Configure upload middleware
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export class ImageService {
  static async uploadImage(file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'book-management',
        transformation: [
          { width: 500, height: 750, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  static async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  static async updateImage(oldPublicId, file) {
    try {
      // Delete old image if it exists
      if (oldPublicId) {
        await this.deleteImage(oldPublicId);
      }

      // Upload new image
      return await this.uploadImage(file);
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  }

  static generateImagePlaceholder(title) {
    // Generate a placeholder image URL using DiceBear API
    const encodedTitle = encodeURIComponent(title);
    return \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodedTitle}&backgroundColor=random\`;
  }
}
