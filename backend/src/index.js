const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*'
  }
});
const cors = require('cors');
require('./database/db.js')
const Message = require('./models/messageModel.js')

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

io.on('connection', async (socket) => {
  console.log('User connected');

  try {
    const chatHistory = await Message.find({});
    socket.emit('chat-history', chatHistory);
  } catch (error) {
    console.error('Error getting chat history:', error);
  }

  socket.on('send-message', async (data) => {
    //console.log('Message received:', data);
    try {
      const newMessage = new Message({ text: data.text, sender: data.sender });
      await newMessage.save();

      socket.broadcast.emit('message', data);
    } catch (error) {
      console.error('Error saving the message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

http.listen(port, () => {
  console.log('Server is running on port ' + port);
});
