const chatRepository = require('./chat.repository');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/errors');

class ChatService {
  async assertMembership(roomId, userId) {
    const room = await chatRepository.findRoomById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found', 'ROOM_NOT_FOUND');
    }
    const isMember = room.members.some((m) => m.user.toString() === userId.toString());
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this room', 'NOT_ROOM_MEMBER');
    }
    return room;
  }

  async getMessages(roomId, userId, after = null) {
    await this.assertMembership(roomId, userId);

    const query = { room: roomId };
    if (after) {
      query.createdAt = { $gt: new Date(after) };
    }

    return chatRepository.findMessages(query);
  }

  async postMessage(roomId, userId, userName, text) {
    if (!text || !text.trim()) {
      throw new BadRequestError('Message text is required', 'MESSAGE_TEXT_REQUIRED');
    }

    await this.assertMembership(roomId, userId);

    return chatRepository.createMessage({
      room: roomId,
      sender: userId,
      senderName: userName,
      text: text.trim().slice(0, 1000),
      isSystem: false,
    });
  }
}

module.exports = new ChatService();
