import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-hero">
        <div className="landing-content">
          <h1>
            <svg style={{ width: '80px', height: '80px', display: 'inline-block', marginRight: '20px', fill: 'var(--text-primary)', verticalAlign: 'middle' }} viewBox="0 0 24 24">
              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
            </svg>
            Welcome to HostelOps
          </h1>
          <p>
            Streamline your hostel maintenance management with our comprehensive complaint tracking system.
            Report issues, track progress, and ensure timely resolutions - all in one place.
          </p>
          <div className="landing-buttons">
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="btn btn-success" 
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <div className="landing-features">
        <div className="features-grid">
          <div className="feature-card">
            <svg className="feature-icon" style={{ width: '48px', height: '48px', fill: 'var(--primary-color)' }} viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <h3>Easy Complaint Submission</h3>
            <p>
              Submit maintenance complaints in seconds with our intuitive form. 
              Categorize issues and set priority levels.
            </p>
          </div>

          <div className="feature-card">
            <svg className="feature-icon" style={{ width: '48px', height: '48px', fill: 'var(--primary-color)' }} viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            <h3>Real-time Tracking</h3>
            <p>
              Monitor your complaints from submission to resolution. 
              Get instant updates on status changes.
            </p>
          </div>

          <div className="feature-card">
            <svg className="feature-icon" style={{ width: '48px', height: '48px', fill: 'var(--primary-color)' }} viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <h3>Secure & Private</h3>
            <p>
              Your data is protected with industry-standard encryption. 
              Role-based access ensures privacy.
            </p>
          </div>

          <div className="feature-card">
            <svg className="feature-icon" style={{ width: '48px', height: '48px', fill: 'var(--primary-color)' }} viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <h3>Admin Dashboard</h3>
            <p>
              Powerful admin tools to manage all complaints, 
              filter by category, and update status efficiently.
            </p>
          </div>

          <div className="feature-card">
            <svg className="feature-icon" style={{ width: '48px', height: '48px', fill: 'var(--primary-color)' }} viewBox="0 0 24 24">
              <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>
            </svg>
            <h3>Fast & Responsive</h3>
            <p>
              Built with modern technology for lightning-fast performance 
              on all devices.
            </p>
          </div>

          <div className="feature-card">
            <svg className="feature-icon" style={{ width: '48px', height: '48px', fill: 'var(--primary-color)' }} viewBox="0 0 24 24">
              <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
            </svg>
            <h3>Mobile Friendly</h3>
            <p>
              Access from anywhere, anytime. Fully responsive design 
              works on desktop, tablet, and mobile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
