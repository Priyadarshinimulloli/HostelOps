import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../api';
import { useAuth } from '../AuthContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isStudent } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    category: 'Electrical',
    description: '',
    priority: 'Medium',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [similarComplaints, setSimilarComplaints] = useState([]);

  useEffect(() => {
    if (!isStudent) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [isStudent, navigate]);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...complaints];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    
    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }
    
    setFilteredComplaints(filtered);
  }, [complaints, searchQuery, filterStatus, sortBy]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintsAPI.getMy();
      setComplaints(response.data.complaints);
      setFilteredComplaints(response.data.complaints);
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Check for similar complaints when description changes
    if (name === 'description' && value.length > 20) {
      checkSimilarComplaints(value, formData.category);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const checkSimilarComplaints = (description, category) => {
    // Simple similarity check based on keywords
    const keywords = description.toLowerCase().split(' ').filter(word => word.length > 3);
    const similar = complaints.filter(c => 
      c.category === category && 
      c.status !== 'Resolved' &&
      keywords.some(keyword => c.description.toLowerCase().includes(keyword))
    ).slice(0, 3);
    setSimilarComplaints(similar);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    if (formData.description.length > 1000) {
      setError('Description must not exceed 1000 characters');
      return;
    }

    setSubmitting(true);

    try {
      // If there's a file, use FormData; otherwise use regular JSON
      if (selectedFile) {
        // Create FormData for requests with image
        const submitData = new FormData();
        submitData.append('category', formData.category);
        submitData.append('description', formData.description);
        submitData.append('priority', formData.priority);
        submitData.append('image', selectedFile);
        
        await complaintsAPI.create(submitData);
      } else {
        // Send as regular JSON when no image
        await complaintsAPI.create(formData);
      }
      
      setSuccessMessage('Complaint submitted successfully!');
      
      // Reset form
      setFormData({
        category: 'Electrical',
        description: '',
        priority: 'Medium',
      });
      setSelectedFile(null);
      setImagePreview(null);
      setShowForm(false);
      fetchComplaints();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusClass = (status) => {
    return `complaint-status status-${status.toLowerCase().replace(' ', '-')}`;
  };

  const getCategoryClass = (category) => {
    return `complaint-category category-${category.toLowerCase()}`;
  };

  const getPriorityClass = (priority) => {
    return `complaint-priority priority-${priority.toLowerCase()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatistics = () => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      high: complaints.filter(c => c.priority === 'High').length,
    };
  };

  // Estimate resolution time based on category and priority
  const getEstimatedResolutionTime = (category, priority) => {
    const baseTime = {
      'Electrical': 24,
      'Plumbing': 36,
      'Cleaning': 12,
      'Other': 48
    };

    const priorityMultiplier = {
      'High': 0.5,
      'Medium': 1,
      'Low': 1.5
    };

    const estimated = baseTime[category] * priorityMultiplier[priority];
    return Math.round(estimated);
  };

  const stats = getStatistics();

  return (
    <div>
      <nav className="navbar">
        <h1>HostelOps - Student Dashboard</h1>
        <div className="navbar-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard">
        {successMessage && <div className="success-message">{successMessage}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <svg className="stat-card-icon" style={{ width: '40px', height: '40px', fill: 'var(--primary-color)' }} viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-label">Total Complaints</div>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
            <svg className="stat-card-icon" style={{ width: '40px', height: '40px', fill: '#f59e0b' }} viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <div className="stat-card-value">{stats.pending}</div>
            <div className="stat-card-label">Pending</div>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
            <svg className="stat-card-icon" style={{ width: '40px', height: '40px', fill: '#3b82f6' }} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div className="stat-card-value">{stats.inProgress}</div>
            <div className="stat-card-label">In Progress</div>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid var(--secondary-color)' }}>
            <svg className="stat-card-icon" style={{ width: '40px', height: '40px', fill: 'var(--secondary-color)' }} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div className="stat-card-value">{stats.resolved}</div>
            <div className="stat-card-label">Resolved</div>
          </div>
        </div>

        {/* New Complaint Button */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-success"
            style={{ 
              width: 'auto', 
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto'
            }}
          >
            {showForm ? 'Cancel' : 'Submit New Complaint'}
          </button>
        </div>

        {/* Complaint Form */}
        {showForm && (
          <div className="complaint-form">
            <h3>Submit New Complaint</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority Level</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Estimated Resolution Time */}
              <div style={{
                background: '#f5f5f5',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <svg style={{ width: '20px', height: '20px', fill: 'var(--text-primary)', flexShrink: 0 }} viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    Estimated Resolution Time
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Approximately {getEstimatedResolutionTime(formData.category, formData.priority)} hours based on {formData.category} - {formData.priority} priority
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail (minimum 10 characters, maximum 1000 characters)"
                  disabled={submitting}
                  rows="6"
                />
                <div className="form-helper-text">
                  {formData.description.length}/1000 characters
                  {formData.description.length < 10 && formData.description.length > 0 && 
                    <span style={{ color: '#ef4444', marginLeft: '1rem' }}>
                      (Need {10 - formData.description.length} more characters)
                    </span>
                  }
                </div>
              </div>

              {/* Image Upload Feature */}
              <div className="form-group">
                <label htmlFor="image">
                  <svg style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle', fill: 'var(--primary-color)' }} viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  Attach Image (Optional)
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={submitting}
                  style={{ padding: '0.75rem' }}
                />
                <div className="form-helper-text">
                  Max file size: 5MB. Supported formats: JPG, PNG, GIF
                </div>
                {imagePreview && (
                  <div style={{ marginTop: '1rem', position: 'relative' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '300px', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        border: '2px solid var(--border-color)'
                      }} 
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Similar Complaints Detection */}
              {similarComplaints.length > 0 && (
                <div style={{
                  background: '#f5f5f5',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <svg style={{ width: '20px', height: '20px', marginRight: '8px', fill: 'var(--text-primary)' }} viewBox="0 0 24 24">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Similar Complaints Found</strong>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    We found {similarComplaints.length} similar complaint(s) in the system:
                  </p>
                  {similarComplaints.map(c => (
                    <div key={c.id} style={{ 
                      background: 'white', 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      marginTop: '0.5rem',
                      fontSize: '0.8rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      <strong>#{c.id}</strong> - {c.description.substring(0, 80)}...
                      <span style={{ 
                        marginLeft: '0.5rem', 
                        color: c.status === 'Resolved' ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}>
                        ({c.status})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </div>
        )}

        {/* Filters and Search */}
        <div className="filters">
          <div className="form-group search-box">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="filterStatus">Filter by Status</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        <h2>My Complaints ({filteredComplaints.length})</h2>
        
        {loading ? (
          <div className="loading">Loading your complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <p>{searchQuery || filterStatus ? 'No complaints match your filters.' : 'You haven\'t submitted any complaints yet.'}</p>
          </div>
        ) : (
          <div className="complaints-list">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <div>
                    <span className={getCategoryClass(complaint.category)}>
                      {complaint.category}
                    </span>
                  </div>
                  <span className={getStatusClass(complaint.status)}>
                    {complaint.status}
                  </span>
                </div>
                
                <div className={getPriorityClass(complaint.priority)}>
                  Priority: {complaint.priority}
                </div>
                
                <div className="complaint-description">
                  {complaint.description}
                </div>

                {/* Display attached image if exists */}
                {complaint.imageUrl && (
                  <div style={{ 
                    marginTop: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ 
                      marginBottom: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      color: 'var(--text-secondary)'
                    }}>
                      Attached Image:
                    </div>
                    <img 
                      src={`http://localhost:5000${complaint.imageUrl}`}
                      alt="Complaint attachment" 
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '400px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        objectFit: 'contain',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => {
                        // Open image in new tab on click
                        window.open(`http://localhost:5000${complaint.imageUrl}`, '_blank');
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="complaint-meta">
                  <div>
                    <strong>Submitted:</strong> {formatDate(complaint.createdAt)}
                  </div>
                  <div>
                    <strong>Last Updated:</strong> {formatDate(complaint.updatedAt)}
                  </div>
                  <div>
                    <strong>ID:</strong> #{complaint.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

