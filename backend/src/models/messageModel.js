const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true},
  room: {type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true}
}, { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
