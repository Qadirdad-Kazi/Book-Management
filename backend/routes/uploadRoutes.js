import express from 'express';
import { upload } from '../services/imageService.js';
import { ImageService } from '../services/imageService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload a single image
router.post('/single', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await ImageService.uploadImage(req.file);
    res.json(result);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Delete an image
router.delete('/:publicId', authenticateToken, async (req, res) => {
  try {
    await ImageService.deleteImage(req.params.publicId);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

// Update an image
router.put('/:publicId', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await ImageService.updateImage(req.params.publicId, req.file);
    res.json(result);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: 'Error updating image' });
  }
});

// Generate placeholder image
router.get('/placeholder/:title', (req, res) => {
  try {
    const url = ImageService.generateImagePlaceholder(req.params.title);
    res.json({ url });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    res.status(500).json({ message: 'Error generating placeholder' });
  }
});

export default router;
