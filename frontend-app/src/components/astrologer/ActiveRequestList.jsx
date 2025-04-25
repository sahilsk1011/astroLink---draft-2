import React, { useState, useEffect } from 'react';
import { Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { astrologerAPI } from '../../services/api';

const ActiveRequestList = () => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActiveRequests = async () => {
      try {
        setLoading(true);
        const response = await astrologerAPI.getActiveRequests();
        setActiveRequests(response.data.data.requests || []);
      } catch (err) {
        console.error('Error fetching active requests:', err);
        setError(err.response?.data?.message || 'Failed to load active requests');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRequests();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">Loading active requests...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (activeRequests.length === 0) {
    return (
      <Alert variant="info">
        You don't have any active requests. Browse available requests to start consulting.
      </Alert>
    );
  }

  return (
    <div className="active-request-list">
      <h3 className="mb-3">Your Active Consultations</h3>
      <div className="row">
        {activeRequests.map(request => (
          <div className="col-md-6 mb-3" key={request._id}>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <Card.Title>{request.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Started: {formatDate(request.acceptedAt || request.createdAt)}
                    </Card.Subtitle>
                  </div>
                  <Badge bg="success">Active</Badge>
                </div>
                <Link 
                  to={`/astrologer/chat/${request.chatChannelId}`} 
                  className="btn btn-primary btn-sm mt-2"
                >
                  Open Chat
                </Link>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveRequestList;