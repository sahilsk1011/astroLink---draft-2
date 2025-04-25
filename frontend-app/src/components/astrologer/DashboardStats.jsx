import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTasks, faCheckCircle, faCoins } from '@fortawesome/free-solid-svg-icons';

const DashboardStats = ({ stats }) => {
  if (!stats) return <div className="text-center">Loading statistics...</div>;

  return (
    <div className="dashboard-stats mb-4">
      <h2 className="mb-3">Your Statistics</h2>
      <Row>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faStar} size="2x" className="mb-2 text-warning" />
              <h3 className="stat-value">{stats.reputation}</h3>
              <Card.Text className="text-muted">Reputation</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faTasks} size="2x" className="mb-2 text-primary" />
              <h3 className="stat-value">{stats.activeRequestCount}</h3>
              <Card.Text className="text-muted">Active Requests</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faCheckCircle} size="2x" className="mb-2 text-success" />
              <h3 className="stat-value">{stats.totalCompletedRequests}</h3>
              <Card.Text className="text-muted">Completed</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faCoins} size="2x" className="mb-2 text-info" />
              <h3 className="stat-value">
                {stats.paymentStatus?.hasPaid ? 'Premium' : 'Free'}
              </h3>
              <Card.Text className="text-muted">Account Status</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardStats;