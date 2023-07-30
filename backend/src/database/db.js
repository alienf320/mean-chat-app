const mongoose = require('mongoose')

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/chat');
}