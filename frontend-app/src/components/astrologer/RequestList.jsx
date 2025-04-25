import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import RequestCard from './RequestCard';
import { astrologerAPI } from '../../services/api';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await astrologerAPI.getAvailableRequests();
        setRequests(response.data.data.requests || []);
      } catch (err) {
        console.error('Error fetching available requests:', err);
        setError(err.response?.data?.message || 'Failed to load available requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [refreshKey]);

  const handleRequestAccepted = (requestId) => {
    // Remove the accepted request from the list
    setRequests(requests.filter(request => request._id !== requestId));
    // Optionally show a success message
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading available requests...</p>
      </div>
    );
  }

  return (
    <div className="request-list">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Available Requests</h2>
        <button 
          className="btn btn-outline-secondary btn-sm" 
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {requests.length === 0 ? (
        <Alert variant="info">
          No available requests at the moment. Check back later or refresh the list.
        </Alert>
      ) : (
        requests.map(request => (
          <RequestCard 
            key={request._id} 
            request={request} 
            onAccept={handleRequestAccepted} 
          />
        ))
      )}
    </div>
  );
};

export default RequestList;