import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientAPI } from '../../services/api';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await clientAPI.getDashboard();
        setDashboardData(response.data.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-center p-5">Loading dashboard...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Client Dashboard</h1>
        <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Welcome, {user.handle}</h5>
          <p className="card-text">Your anonymous consultation platform</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {dashboardData && (
        <div className="row">
          <div className="col-md-4">
            <div className="card text-center mb-3">
              <div className="card-body">
                <h5 className="card-title">Active Requests</h5>
                <p className="card-text display-4">{dashboardData.activeRequestCount}</p>
                <p className="text-muted">of {dashboardData.maxActiveRequests} maximum</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center mb-3">
              <div className="card-body">
                <h5 className="card-title">Completed</h5>
                <p className="card-text display-4">{dashboardData.completedRequestCount}</p>
                <p className="text-muted">consultations</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center mb-3">
              <div className="card-body">
                <h5 className="card-title">Payment Status</h5>
                <p className="card-text">
                  {dashboardData.hasPaid ? 
                    <span className="badge bg-success">Paid</span> : 
                    <span className="badge bg-warning">Free Tier</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        <button className="btn btn-primary">New Consultation Request</button>
      </div>
    </div>
  );
};

export default ClientDashboard;