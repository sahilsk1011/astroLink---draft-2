import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { astrologerAPI } from '../../services/api';

const RequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const response = await astrologerAPI.getRequestDetails(requestId);
        setRequest(response.data.data.request);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError(err.response?.data?.message || 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      setAcceptError('');
      const response = await astrologerAPI.acceptRequest(requestId);
      
      // Navigate to the chat page with the new chat channel
      navigate(`/astrologer/chat/${response.data.data.chatChannelId}`);
    } catch (err) {
      console.error('Error accepting request:', err);
      setAcceptError(err.response?.data?.message || 'Failed to accept request');
      setIsAccepting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading request details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-primary" onClick={() => navigate('/astrologer/dashboard')}>
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/astrologer/dashboard')}>
          &larr; Back to Dashboard
        </Button>
      </div>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{request.title}</h2>
          <Badge bg={request.status === 'open' ? 'success' : 'primary'}>
            {request.status}
          </Badge>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>Request Details</h5>
            <p><strong>Created:</strong> {formatDate(request.createdAt)}</p>
            <p><strong>Astrologers:</strong> {request.assignedAstrologersCount} of {request.maxAstrologers}</p>
          </div>

          {acceptError && <Alert variant="danger">{acceptError}</Alert>}

          <div className="d-flex justify-content-end">
            <Button 
              variant="success" 
              onClick={handleAccept}
              disabled={isAccepting || request.status !== 'open'}
            >
              {isAccepting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Processing...</span>
                </>
              ) : (
                'Accept Request'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RequestDetails;