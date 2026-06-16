const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
});

// Configure Multer with Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// All upload routes require ADMIN or MANAGER privileges
router.use(protect, authorizeRoles('ADMIN', 'MANAGER'));

// Upload multiple images
router.post('/order-images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const uploadPromises = req.files.map(file => {
      // Convert buffer to base64 data URI
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
      
      return cloudinary.uploader.upload(dataURI, { 
        folder: 'vishnu_creations/orders' 
      });
    });

    const results = await Promise.all(uploadPromises);
    
    // Format response
    const images = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date()
    }));

    res.status(200).json({ message: 'Images uploaded successfully', images });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload images' });
  }
});

// Delete a single image
router.post('/delete-image', async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'Public ID is required' });

    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
});

module.exports = router;
