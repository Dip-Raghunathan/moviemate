class MessageDTO {
  constructor(message) {
    this.id = message.id || message._id;
    this.room = message.room;
    this.sender = message.sender || null;
    this.senderName = message.senderName;
    this.text = message.text;
    this.isSystem = message.isSystem || false;
    this.createdAt = message.createdAt;
  }

  static fromMessage(message) {
    if (!message) return null;
    return new MessageDTO(message);
  }

  static fromMessages(messages) {
    if (!Array.isArray(messages)) return [];
    return messages.map((m) => new MessageDTO(m));
  }
}

module.exports = {
  MessageDTO,
};
