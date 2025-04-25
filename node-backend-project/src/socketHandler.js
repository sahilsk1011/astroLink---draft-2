const mongoose = require('mongoose');
const ChatChannel = require('./models/ChatChannel');
const encryptionService = require('./services/encryptionService');

module.exports = (io) => {
  // Store active users in channels
  const activeUsers = {};
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.handle}`);
    
    // Join a chat channel
    socket.on('join', async ({ channelId }) => {
      try {
        // Verify user has access to this channel
        const channel = await ChatChannel.findById(channelId);
        
        if (!channel) {
          socket.emit('error', { message: 'Channel not found' });
          return;
        }
        
        // Check if user is part of this channel
        const isClient = channel.client.toString() === socket.user.profileId;
        const isAstrologer = channel.astrologer.toString() === socket.user.profileId;
        
        if (!isClient && !isAstrologer) {
          socket.emit('error', { message: 'Access denied to this channel' });
          return;
        }
        
        // Leave previous rooms
        for (const room of socket.rooms) {
          if (room !== socket.id) {
            socket.leave(room);
          }
        }
        
        // Join the channel room
        socket.join(channelId);
        
        // Add user to active users for this channel
        if (!activeUsers[channelId]) {
          activeUsers[channelId] = {};
        }
        
        activeUsers[channelId][socket.user.userId] = {
          userId: socket.user.userId,
          handle: socket.user.handle,
          role: socket.user.role,
          isTyping: false
        };
        
        // Notify channel about user joining
        io.to(channelId).emit('user_joined', {
          user: {
            handle: socket.user.handle,
            role: socket.user.role
          },
          activeUsers: Object.values(activeUsers[channelId])
        });
        
        console.log(`${socket.user.handle} joined channel: ${channelId}`);
      } catch (error) {
        console.error('Error joining channel:', error);
        socket.emit('error', { message: 'Failed to join channel' });
      }
    });
    
    // Handle new message
    socket.on('message', async ({ channelId, content, contentType = 'text' }) => {
      try {
        // Verify user has access to this channel
        const channel = await ChatChannel.findById(channelId);
        
        if (!channel || !channel.isActive) {
          socket.emit('error', { message: 'Channel not found or inactive' });
          return;
        }
        
        // Check if user is part of this channel
        const isClient = channel.client.toString() === socket.user.profileId;
        const isAstrologer = channel.astrologer.toString() === socket.user.profileId;
        
        if (!isClient && !isAstrologer) {
          socket.emit('error', { message: 'Access denied to this channel' });
          return;
        }
        
        // Encrypt message content
        const encryptedContent = encryptionService.encrypt(content);
        
        // Create message object
        const message = {
          _id: new mongoose.Types.ObjectId(),
          sender: socket.user.role,
          senderHandle: socket.user.handle,
          content: encryptedContent,
          contentType,
          timestamp: new Date()
        };
        
        // Save message to database
        channel.messages.push({
          sender: socket.user.role,
          content: encryptedContent,
          contentType,
          timestamp: new Date()
        });
        
        await channel.save();
        
        // Decrypt for sending back to clients
        message.content = content; // Send original content
        
        // Broadcast message to channel
        io.to(channelId).emit('message', message);
        
        console.log(`Message sent in channel ${channelId} by ${socket.user.handle}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing status
    socket.on('typing', ({ channelId, isTyping }) => {
      if (activeUsers[channelId] && activeUsers[channelId][socket.user.userId]) {
        activeUsers[channelId][socket.user.userId].isTyping = isTyping;
        
        // Broadcast typing status to channel
        io.to(channelId).emit('typing', {
          userId: socket.user.userId,
          handle: socket.user.handle,
          isTyping
        });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.handle}`);
      
      // Remove user from all active channels
      Object.keys(activeUsers).forEach(channelId => {
        if (activeUsers[channelId] && activeUsers[channelId][socket.user.userId]) {
          delete activeUsers[channelId][socket.user.userId];
          
          // Notify channel about user leaving
          io.to(channelId).emit('user_left', {
            user: {
              userId: socket.user.userId,
              handle: socket.user.handle,
              role: socket.user.role
            },
            activeUsers: Object.values(activeUsers[channelId])
          });
        }
      });
    });
  });
};