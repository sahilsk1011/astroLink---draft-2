import React, { useState } from 'react';
import { Card, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { astrologerAPI } from '../../services/api';

const RequestCard = ({ request, onAccept }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      setError('');
      await astrologerAPI.acceptRequest(request._id);
      onAccept(request._id);
    } catch (err) {
      console.error('Error accepting request:', err);
      setError(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Card className="mb-3 request-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title>{request.title}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              Created: {formatDate(request.createdAt)}
            </Card.Subtitle>
          </div>
          <Badge bg="primary" pill>
            {request.assignedAstrologersCount}/{request.maxAstrologers} astrologers
          </Badge>
        </div>
        
        {error && <div className="alert alert-danger mt-2">{error}</div>}
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <Button 
            variant="outline-primary" 
            as={Link} 
            to={`/astrologer/request/${request._id}`}
            size="sm"
          >
            View Details
          </Button>
          
          <Button 
            variant="success" 
            size="sm"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Accepting...</span>
              </>
            ) : (
              'Accept Request'
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RequestCard;