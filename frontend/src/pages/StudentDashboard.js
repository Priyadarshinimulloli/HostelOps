import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../api';
import { useAuth } from '../AuthContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isStudent } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    category: 'Electrical',
    description: '',
    priority: 'Medium',
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isStudent) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [isStudent, navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintsAPI.getMy();
      setComplaints(response.data.complaints);
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    setSubmitting(true);

    try {
      await complaintsAPI.create(formData);
      setSuccessMessage('Complaint submitted successfully!');
      setFormData({
        category: 'Electrical',
        description: '',
        priority: 'Medium',
      });
      fetchComplaints();
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
        <h2>Submit New Complaint</h2>
        
        <div className="complaint-form">
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <form onSubmit={handleSubmit}>
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
              <label htmlFor="priority">Priority</label>
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

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail (minimum 10 characters)"
                disabled={submitting}
                rows="5"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        <h2>My Complaints ({complaints.length})</h2>
        
        {loading ? (
          <div className="loading">Loading your complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <p>You haven't submitted any complaints yet.</p>
          </div>
        ) : (
          <div className="complaints-list">
            {complaints.map((complaint) => (
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
                
                <div className="complaint-meta">
                  <div>Submitted: {formatDate(complaint.createdAt)}</div>
                  <div>Last Updated: {formatDate(complaint.updatedAt)}</div>
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
