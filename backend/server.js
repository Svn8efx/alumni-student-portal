const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const User = require('./models/User');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const postRoutes = require('./routes/postRoutes');
const forumRoutes = require('./routes/forumRoutes');
const jobRoutes = require('./routes/jobRoutes');
const eventRoutes = require('./routes/eventRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time notifications and messaging
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});

// Authenticate every socket connection via the JWT sent in the handshake.
// The verified user id (not anything the client claims) decides which private
// room the socket joins — so nobody can subscribe to another user's
// notifications or messages.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Not authorized: no token'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id isActive');
    if (!user || !user.isActive) return next(new Error('Not authorized: invalid user'));

    socket.userId = user._id.toString();
    next();
  } catch (err) {
    next(new Error('Not authorized: token failed'));
  }
});

io.on('connection', (socket) => {
  // Join the room for the VERIFIED user — no client-supplied id involved.
  socket.join(socket.userId);

  socket.on('disconnect', () => {
    // no-op: rooms are cleaned up automatically by socket.io
  });
});

// Make io accessible inside controllers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy', timestamp: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));

module.exports = { app, server, io };