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
    await handleJoinRoom(socket, username, room, callback);
  });

  socket.on("send-message", async (data) => {
    await handleSendMessage(socket, data);
  });

  socket.on("send-notification", async (text, room) => {
    await handleSendNotification(socket, text, room);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

async function handleJoinRoom(socket, username, room, callback) {
  try {
    socket.join(room);
    const msj = `User ${username} has joined the room`;
    socket.broadcast.to(room).emit('notification', msj);
    callback(msj);

    let user = await User.findOne({ username });

    if (!user) {
      user = new User({
        username: username,
      });
      await user.save();
    }

    let chatRoom = await ChatRoom.findOneAndUpdate(
      { name: room },
      { $addToSet: { participants: user._id } },
      { upsert: true, new: true }
    );

    const rooms = await ChatRoom.find({});
    const messages = await Message.find({ room: chatRoom._id }).populate(
      "sender"
    );

    socket.emit("chat-history", { chatRoom, messages, rooms });
  } catch (error) {
    console.error("Error joining room:", error);
  }
}


async function handleSendMessage(socket, data) {
  const room = await ChatRoom.findOne({ name: data.room });
  const newMessage = new Message({
    text: data.text,
    sender: data.sender,
    room: room._id,
  });
  await newMessage.save();
  socket.broadcast.to(data.room).emit("message", data);
}

async function handleSendNotification(socket, text, room) {
  console.log('Debería enviar la noti al room: ', room, text)
  socket.broadcast.to(room).emit("notification", text)
}

http.listen(port, () => {
  console.log("Server is running on port " + port);
});
