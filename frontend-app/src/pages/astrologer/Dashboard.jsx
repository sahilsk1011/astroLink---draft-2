import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Nav, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import DashboardStats from '../../components/astrologer/DashboardStats';
import RequestList from '../../components/astrologer/RequestList';
import ActiveRequestList from '../../components/astrologer/ActiveRequestList';
import { astrologerAPI } from '../../services/api';

const AstrologerDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await astrologerAPI.getDashboard();
        setDashboardData(response.data.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Astrologer Dashboard</h1>
        <div>
          <span className="me-3">Welcome, {user.handle}</span>
          <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <DashboardStats stats={dashboardData} />

          <Tab.Container defaultActiveKey="available">
            <Row>
              <Col>
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="available">Available Requests</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="active">Active Consultations</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content>
                  <Tab.Pane eventKey="available">
                    <RequestList />
                  </Tab.Pane>
                  <Tab.Pane eventKey="active">
                    <ActiveRequestList />
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>

          {!dashboardData?.paymentStatus?.hasPaid && (
            <div className="mt-4 p-3 bg-light rounded">
              <h4>Upgrade to Premium</h4>
              <p>
                Unlock the ability to accept more requests and increase your earning potential.
              </p>
              <button className="btn btn-primary">Upgrade Now</button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default AstrologerDashboard;