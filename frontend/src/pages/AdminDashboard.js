import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../api';
import { useAuth } from '../AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPriority, setSelectedPriority] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, [isAdmin, navigate]);

  useEffect(() => {
    // Apply filters, search, and sort
    let filtered = [...complaints];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.User.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.User.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    
    // Category filter
    if (filters.category) {
      filtered = filtered.filter(c => c.category === filters.category);
    }
    
    // Priority filter
    if (selectedPriority) {
      filtered = filtered.filter(c => c.priority === selectedPriority);
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
  }, [complaints, searchQuery, filters, selectedPriority, sortBy]);

  const fetchComplaints = async (appliedFilters = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await complaintsAPI.getAll(appliedFilters);
      setComplaints(response.data.complaints);
      setFilteredComplaints(response.data.complaints);
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

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
    });
    setSearchQuery('');
    setSelectedPriority('');
    setSortBy('newest');
    fetchComplaints();
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      setError('');
      setSuccessMessage('');
      await complaintsAPI.updateStatus(complaintId, newStatus);
      setSuccessMessage(`Status updated to "${newStatus}" successfully!`);
      
      // Refresh complaints list
      fetchComplaints();
      
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
        return [
          { status: 'In Progress', emoji: '', color: '#4a4a4a' },
          { status: 'Resolved', emoji: '', color: '#1a1a1a' }
        ];
      case 'In Progress':
        return [
          { status: 'Resolved', emoji: '', color: '#1a1a1a' },
          { status: 'Pending', emoji: '', color: '#6b6b6b' }
        ];
      case 'Resolved':
        return [
          { status: 'In Progress', emoji: '', color: '#4a4a4a' },
          { status: 'Pending', emoji: '', color: '#6b6b6b' }
        ];
      default:
        return [];
    }
  };

  const getStatistics = () => {
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
      highPriority: complaints.filter(c => c.priority === 'High').length,
      byCategory: {
        electrical: complaints.filter(c => c.category === 'Electrical').length,
        plumbing: complaints.filter(c => c.category === 'Plumbing').length,
        cleaning: complaints.filter(c => c.category === 'Cleaning').length,
        other: complaints.filter(c => c.category === 'Other').length,
      },
      resolutionRate: complaints.length > 0 
        ? ((complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100).toFixed(1)
        : 0
    };
    return stats;
  };

  // Calculate average resolution time by category
  const getResolutionTimeByCategory = () => {
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
    const categories = ['Electrical', 'Plumbing', 'Cleaning', 'Other'];
    
    return categories.map(category => {
      const categoryComplaints = resolvedComplaints.filter(c => c.category === category);
      if (categoryComplaints.length === 0) return { category, avgHours: 0, count: 0 };
      
      const totalHours = categoryComplaints.reduce((acc, c) => {
        const created = new Date(c.createdAt);
        const updated = new Date(c.updatedAt);
        const hours = (updated - created) / (1000 * 60 * 60);
        return acc + hours;
      }, 0);
      
      return {
        category,
        avgHours: Math.round(totalHours / categoryComplaints.length),
        count: categoryComplaints.length
      };
    });
  };

  // Get complaints trend for last 7 days
  const getComplaintsTrend = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = complaints.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= date && createdDate < nextDay;
      }).length;
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }
    return last7Days;
  };

  const resolutionTimeData = getResolutionTimeByCategory();
  const trendData = getComplaintsTrend();

  const stats = getStatistics();

  return (
    <div>
      <nav className="navbar">
        <h1>HostelOps - Admin Dashboard</h1>
        <div className="navbar-user">
          <span>{user?.name} (Admin)</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <h2>Overview &amp; Analytics</h2>
        
        {/* Main Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M8 2v2H3v2h1v16h16V6h1V4h-5V2h-2v2H10V2H8zm5 12h6v2h-6v-2zm0-4h6v2h-6v-2z"/>
              </svg>
            </span>
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-label">Total Complaints</div>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
            <span className="stat-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4 11h-4v4h-2v-4H6v-2h4V7h2v4h4v2z"/>
              </svg>
            </span>
            <div className="stat-card-value">{stats.pending}</div>
            <div className="stat-card-label">Pending</div>
            {stats.total > 0 && (
              <div className="stat-card-trend">
                {((stats.pending / stats.total) * 100).toFixed(0)}% of total
              </div>
            )}
          </div>
          <div className="stat-card" style={{ borderTop: '2px solid var(--border-color)' }}>
            <span className="stat-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </span>
            <div className="stat-card-value">{stats.inProgress}</div>
            <div className="stat-card-label">In Progress</div>
            {stats.total > 0 && (
              <div className="stat-card-trend">
                {((stats.inProgress / stats.total) * 100).toFixed(0)}% of total
              </div>
            )}
          </div>
          <div className="stat-card" style={{ borderTop: '2px solid var(--text-primary)' }}>
            <span className="stat-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </span>
            <div className="stat-card-value">{stats.resolved}</div>
            <div className="stat-card-label">Resolved</div>
            {stats.total > 0 && (
              <div className="stat-card-trend trend-up">
                ↑ {stats.resolutionRate}% Resolution Rate
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600' }}>Complaints by Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', background: '#fafafa', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{stats.byCategory.electrical}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Electrical</div>
            </div>
            <div style={{ padding: '1.25rem', background: '#fafafa', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{stats.byCategory.plumbing}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Plumbing</div>
            </div>
            <div style={{ padding: '1.25rem', background: '#fafafa', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{stats.byCategory.cleaning}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cleaning</div>
            </div>
            <div style={{ padding: '1.25rem', background: '#fafafa', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>{stats.byCategory.other}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Other</div>
            </div>
          </div>
          {stats.highPriority > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {stats.highPriority} High Priority Complaint{stats.highPriority !== 1 ? 's' : ''} - Requires Immediate Attention!
              </strong>
            </div>
          )}
        </div>

        {/* Visual Analytics Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Resolution Time Chart */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: '600' }}>
              <svg style={{ width: '20px', height: '20px', marginRight: '10px', fill: 'var(--text-primary)' }} viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              Avg. Resolution Time by Category
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resolutionTimeData.map(item => {
                const maxHours = Math.max(...resolutionTimeData.map(d => d.avgHours), 1);
                const percentage = (item.avgHours / maxHours) * 100;
                return (
                  <div key={item.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: '600' }}>{item.category}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {item.avgHours > 0 ? `${item.avgHours}h (${item.count} resolved)` : 'No data'}
                      </span>
                    </div>
                    <div style={{ 
                      background: '#f3f4f6', 
                      borderRadius: '10px', 
                      height: '30px', 
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                      background: 'var(--text-primary)',
                        borderRadius: '10px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: '600' }}>
              <svg style={{ width: '20px', height: '20px', marginRight: '10px', fill: 'var(--text-primary)' }} viewBox="0 0 24 24">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
              </svg>
              Complaints Trend (Last 7 Days)
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', height: '200px' }}>
              {trendData.map((item, index) => {
                const maxCount = Math.max(...trendData.map(d => d.count), 1);
                const height = (item.count / maxCount) * 100;
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '100%', 
                      height: `${height}%`, 
                      minHeight: item.count > 0 ? '20px' : '0',
                      background: 'var(--text-primary)',
                      borderRadius: '5px 5px 0 0',
                      position: 'relative',
                      transition: 'height 0.5s ease'
                    }}>
                      <span style={{ 
                        position: 'absolute', 
                        top: '-20px', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'var(--primary-color)'
                      }}>
                        {item.count}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <h2>Complaint Management</h2>
        <div className="filters">
          <div className="form-group search-box">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by description, student name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
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

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
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
          
          <button onClick={clearFilters} className="btn btn-secondary">
            Clear All Filters
          </button>
        </div>

        <h2>All Complaints ({filteredComplaints.length})</h2>
        
        {loading ? (
          <div className="loading">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <p>{searchQuery || filters.status || filters.category || selectedPriority ? 'No complaints match your filters.' : 'No complaints found.'}</p>
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
                    <strong>Student:</strong> {complaint.User.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {complaint.User.email}
                  </div>
                  <div>
                    <strong>Submitted:</strong> {formatDate(complaint.createdAt)}
                  </div>
                  <div>
                    <strong>Updated:</strong> {formatDate(complaint.updatedAt)}
                  </div>
                  <div>
                    <strong>ID:</strong> #{complaint.id}
                  </div>
                </div>
                
                <div className="complaint-actions">
                  {getAvailableStatusUpdates(complaint.status).map(({ status, color }) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(complaint.id, status)}
                      className="btn"
                      style={{ 
                        background: `${color}`,
                        color: 'white'
                      }}
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
