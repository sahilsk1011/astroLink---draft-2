import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';

const ChatPage = () => {
  const { channelId } = useParams();

  return (
    <Container className="py-4">
      <h2>Chat Channel</h2>
      <Alert variant="info">
        <p>This is a placeholder for the chat interface with channel ID: {channelId}</p>
        <p>The full chat implementation will be covered in a future step.</p>
      </Alert>
    </Container>
  );
};

export default ChatPage;