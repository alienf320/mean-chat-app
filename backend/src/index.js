const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
const cors = require("cors");
require("./database/db.js");
const Message = require("./models/messageModel.js");
const User = require("./models/userModel.js");
const ChatRoom = require("./models/roomModel.js");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

io.on("connection", async (socket) => {
  console.log("User connected");

  socket.on("join-room", async ({ username, room }, callback) => {
    //console.log("join-room", username, room);
    try {
      socket.join(room);
      const mensaje = `User ${username} has joined the room`;
      socket.broadcast.to(room).emit('notification', mensaje)
      // socket.data.username = username;
      // callback(mensaje);

      let chatRoom = await ChatRoom.findOne({ name: room });
      let user = await User.findOne({ username });
      if (!user) {
        user = new User({
          username: username,
        });
        await user.save();
      }

      // Crear la sala de chat si no existe
      if (!chatRoom) {
        chatRoom = new ChatRoom({
          name: room,
          participants: [user._id],
        });
      } else if(!chatRoom.participants.includes(user._id)){
        chatRoom.participants.push(user._id);
      }
      await chatRoom.save()

      // Buscar los mensajes de la sala de chat
      const messages = await Message.find({ room: chatRoom._id }).populate(
        "sender"
      );

      // Emitir la información de la sala y los mensajes al cliente
      socket.emit("chat-history", { chatRoom, messages });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  });

  socket.on("send-message", async (data) => {
    //console.log('Message received:', data);
    try {
      const room = await ChatRoom.findOne({ name: data.room });
      const newMessage = new Message({
        text: data.text,
        sender: data.sender,
        room: room._id,
      });
      await newMessage.save();

      socket.broadcast.to(data.room).emit("message", data);
    } catch (error) {
      console.error("Error saving the message:", error);
    }
  });

  socket.on("send-notification", async (text, room) => {
    socket.broadcast.to(room).emit("notification", text)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

http.listen(port, () => {
  console.log("Server is running on port " + port);
});
