import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../api';
import { useAuth } from '../AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [isAdmin, navigate]);

  const fetchComplaints = async (appliedFilters = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await complaintsAPI.getAll(appliedFilters);
      setComplaints(response.data.complaints);
    } catch (err) {
      setError('Failed to fetch complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    const appliedFilters = {};
    if (filters.status) appliedFilters.status = filters.status;
    if (filters.category) appliedFilters.category = filters.category;
    fetchComplaints(appliedFilters);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
    });
    fetchComplaints();
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      setError('');
      setSuccessMessage('');
      await complaintsAPI.updateStatus(complaintId, newStatus);
      setSuccessMessage('Status updated successfully!');
      
      // Refresh complaints list
      const appliedFilters = {};
      if (filters.status) appliedFilters.status = filters.status;
      if (filters.category) appliedFilters.category = filters.category;
      fetchComplaints(appliedFilters);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
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

  const getAvailableStatusUpdates = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return ['In Progress', 'Resolved'];
      case 'In Progress':
        return ['Resolved', 'Pending'];
      case 'Resolved':
        return ['In Progress', 'Pending'];
      default:
        return [];
    }
  };

  const getStatusCounts = () => {
    const counts = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div>
      <nav className="navbar">
        <h1>HostelOps - Admin Dashboard</h1>
        <div className="navbar-user">
          <span>Welcome, {user?.name} (Admin)</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard">
        <h2>All Complaints Management</h2>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <div className="filters">
          <div className="form-group">
            <label htmlFor="status">Filter by Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Filter by Category</label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button onClick={applyFilters} className="btn btn-primary">
            Apply Filters
          </button>
          
          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', flex: '1', minWidth: '150px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50' }}>{statusCounts.total}</div>
            <div style={{ color: '#666' }}>Total Complaints</div>
          </div>
          <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '8px', flex: '1', minWidth: '150px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>{statusCounts.pending}</div>
            <div style={{ color: '#856404' }}>Pending</div>
          </div>
          <div style={{ padding: '1rem', background: '#cfe2ff', borderRadius: '8px', flex: '1', minWidth: '150px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#084298' }}>{statusCounts.inProgress}</div>
            <div style={{ color: '#084298' }}>In Progress</div>
          </div>
          <div style={{ padding: '1rem', background: '#d1e7dd', borderRadius: '8px', flex: '1', minWidth: '150px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f5132' }}>{statusCounts.resolved}</div>
            <div style={{ color: '#0f5132' }}>Resolved</div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints found.</p>
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
                  <div><strong>Student:</strong> {complaint.User.name} ({complaint.User.email})</div>
                  <div>Submitted: {formatDate(complaint.createdAt)}</div>
                  <div>Last Updated: {formatDate(complaint.updatedAt)}</div>
                </div>
                
                <div className="complaint-actions">
                  {getAvailableStatusUpdates(complaint.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(complaint.id, status)}
                      className="btn btn-secondary"
                    >
                      Mark as {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
