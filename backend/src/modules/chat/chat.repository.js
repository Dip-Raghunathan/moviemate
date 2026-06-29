const Message = require('../../database/models/Message');
const Room = require('../../database/models/Room');

class ChatRepository {
  async findRoomById(roomId) {
    return Room.findById(roomId);
  }

  async findMessages(query, limit = 200) {
    return Message.find(query).sort({ createdAt: 1 }).limit(limit);
  }

  async createMessage(messageData) {
    return Message.create(messageData);
  }
}

module.exports = new ChatRepository();
