// routes/chat.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/auth');
const prisma = new PrismaClient();

// Role-based chat permissions
const ALLOWED_COMMUNICATION = {
  admin: ['teacher'],
  teacher: ['teacher', 'student', 'admin'],
  student: ['teacher']
};

// Get all messages between two users
router.get('/messages/:receiverId', authenticateToken, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { AND: [{ senderId: userId }, { receiverId: parseInt(receiverId) }] },
          { AND: [{ senderId: parseInt(receiverId) }, { receiverId: userId }] }
        ]
      },
      orderBy: { timestamp: 'asc' },
      include: {
        user_message_senderIdTouser: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get all conversations for the current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId']
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId']
    });

    const participantIds = [
      ...new Set([
        ...sentMessages.map(m => m.receiverId),
        ...receivedMessages.map(m => m.senderId)
      ])
    ];

    const conversations = await Promise.all(
      participantIds.map(async (participantId) => {
        const user = await prisma.user.findUnique({
          where: { id: participantId },
          select: { id: true, name: true, role: true, email: true, teachersNo: true, aridno: true }
        });

        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: participantId },
              { senderId: participantId, receiverId: userId }
            ]
          },
          orderBy: { timestamp: 'desc' },
          take: 1
        });

        return {
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email,
            identifier: user.role === 'teacher' ? user.teachersNo : user.aridno
          },
          lastMessage: lastMessage ? {
            content: lastMessage.message,
            timestamp: lastMessage.timestamp,
            isCurrentUser: lastMessage.senderId === userId
          } : null
        };
      })
    );

    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) },
      select: { role: true }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check role-based permissions
    if (!ALLOWED_COMMUNICATION[senderRole]?.includes(receiver.role)) {
      return res.status(403).json({ error: 'You are not allowed to message this user' });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderType: senderRole,
        receiverType: receiver.role,
        message,
        user_message_senderIdTouser: { connect: { id: senderId } },
        user_message_receiverIdTouser: { connect: { id: parseInt(receiverId) } }
      },
      include: {
        user_message_senderIdTouser: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    const io = req.app.get('socketio');
    io.to(`user_${receiverId}`).emit('newMessage', newMessage);
    io.to(`user_${senderId}`).emit('messageSent', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get users by role
router.get('/users/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check role-based visibility
    if (!ALLOWED_COMMUNICATION[userRole]?.includes(role)) {
      return res.status(403).json({ error: 'You are not allowed to view users of this role' });
    }

    const users = await prisma.user.findMany({
      where: { 
        role: role,
        id: { not: userId }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teachersNo: true,
        aridno: true
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      identifier: user.role === 'teacher' ? user.teachersNo : user.aridno
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;