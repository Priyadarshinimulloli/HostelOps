const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST /api/complaints - Create a new complaint (Student only)
// Middleware to handle both JSON and multipart form data
const handleComplaintUpload = (req, res, next) => {
  const contentType = req.get('Content-Type') || '';
  
  // If multipart, use multer
  if (contentType.includes('multipart/form-data')) {
    upload.single('image')(req, res, next);
  } else {
    // If JSON, skip multer
    next();
  }
};

router.post('/', authenticate, handleComplaintUpload, async (req, res) => {
  try {
    // Debug logging
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Only students can create complaints
    if (req.user.role !== 'student') {
      // Delete uploaded file if user is not a student
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ error: 'Only students can submit complaints' });
    }

    const { category, description, priority } = req.body;

    // Validate input
    if (!category || !description) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        error: 'Please provide category and description',
        debug: { category, description, body: req.body }
      });
    }

    // Validate category
    const validCategories = ['Electrical', 'Plumbing', 'Cleaning', 'Other'];
    if (!validCategories.includes(category)) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Validate priority
    const validPriorities = ['Low', 'Medium', 'High'];
    const complaintPriority = priority && validPriorities.includes(priority) ? priority : 'Medium';

    // Validate description length
    if (description.length < 10 || description.length > 1000) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Description must be between 10 and 1000 characters' });
    }

    // Prepare complaint data
    const complaintData = {
      userId: req.user.id,
      category,
      description,
      priority: complaintPriority,
      status: 'Pending',
    };

    // Add image URL if file was uploaded
    if (req.file) {
      complaintData.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create complaint
    const complaint = await Complaint.create(complaintData);

    // Fetch complaint with user details
    const complaintWithUser = await Complaint.findByPk(complaint.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
      }],
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: complaintWithUser,
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    // Delete uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum size is 5MB' });
      }
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error while creating complaint' });
  }
});

// GET /api/complaints/my - Get logged-in student's complaints
router.get('/my', authenticate, async (req, res) => {
  try {
    // Only students can view their own complaints
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view their complaints' });
    }

    const complaints = await Complaint.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      complaints,
      count: complaints.length,
    });
  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({ error: 'Server error while fetching complaints' });
  }
});

// GET /api/complaints - Get all complaints (Admin only) with optional filters
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, category } = req.query;
    
    // Build filter object
    const where = {};
    
    if (status) {
      const validStatuses = ['Pending', 'In Progress', 'Resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status filter' });
      }
      where.status = status;
    }
    
    if (category) {
      const validCategories = ['Electrical', 'Plumbing', 'Cleaning', 'Other'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category filter' });
      }
      where.category = category;
    }

    const complaints = await Complaint.findAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      complaints,
      count: complaints.length,
      filters: { status, category },
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ error: 'Server error while fetching complaints' });
  }
});

// PUT /api/complaints/:id - Update complaint status (Admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: Pending, In Progress, or Resolved' });
    }

    // Find complaint
    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Update status
    complaint.status = status;
    await complaint.save();

    // Fetch updated complaint with user details
    const updatedComplaint = await Complaint.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
      }],
    });

    res.json({
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ error: 'Server error while updating complaint' });
  }
});

module.exports = router;
