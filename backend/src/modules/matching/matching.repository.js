const Room = require('../../database/models/Room');
const Message = require('../../database/models/Message');

class MatchingRepository {
  async findRoomById(id) {
    return Room.findById(id);
  }

  async findRoomByIdPopulated(id) {
    return Room.findById(id).populate('members.user', 'name profilePicture favoriteGenres profile age gender privacy isPro');
  }

  async findUserActiveRoom(userId) {
    return Room.findOne({ 'members.user': userId })
      .sort({ createdAt: -1 })
      .populate('members.user', 'name profilePicture favoriteGenres profile age gender privacy isPro');
  }

  async findCandidateRooms(query) {
    return Room.find(query).sort({ createdAt: 1 });
  }

  async createRoom(roomData) {
    return Room.create(roomData);
  }

  async saveRoom(room) {
    return room.save();
  }

  async deleteRoom(id) {
    return Room.findByIdAndDelete(id);
  }

  async deleteRoomMessages(roomId) {
    return Message.deleteMany({ room: roomId });
  }

  async createSystemMessage(roomId, text) {
    return Message.create({
      room: roomId,
      sender: null,
      senderName: 'System',
      text,
      isSystem: true,
    });
  }
  async findVacantRooms(userId, city = null) {
    const query = {
      status: 'open',
      'members.user': { $ne: userId }
    };
    if (city) {
      query.city = city.trim();
    }
    return Room.find(query).sort({ createdAt: -1 })
    .populate('members.user', 'name profilePicture gender age');
  }
}

module.exports = new MatchingRepository();
