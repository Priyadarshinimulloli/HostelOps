const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/complaints - Create a new complaint (Student only)
router.post('/', authenticate, async (req, res) => {
  try {
    // Only students can create complaints
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit complaints' });
    }

    const { category, description, priority } = req.body;

    // Validate input
    if (!category || !description) {
      return res.status(400).json({ error: 'Please provide category and description' });
    }

    // Validate category
    const validCategories = ['Electrical', 'Plumbing', 'Cleaning', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Validate priority
    const validPriorities = ['Low', 'Medium', 'High'];
    const complaintPriority = priority && validPriorities.includes(priority) ? priority : 'Medium';

    // Validate description length
    if (description.length < 10 || description.length > 1000) {
      return res.status(400).json({ error: 'Description must be between 10 and 1000 characters' });
    }

    // Create complaint
    const complaint = await Complaint.create({
      userId: req.user.id,
      category,
      description,
      priority: complaintPriority,
      status: 'Pending',
    });

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
