class RoomMemberDTO {
  constructor(member) {
    // If user is populated, user is an object, otherwise it's just the ObjectId
    const userObj = member.user || {};
    this.user = userObj._id || userObj.id || member.user;
    this.name = userObj.name || '';
    this.profilePicture = userObj.profilePicture || '';
    this.gender = member.gender;
    this.joinedAt = member.joinedAt;
  }
}

class RoomDTO {
  constructor(room) {
    this.id = room.id || room._id;
    this.movie = room.movie;
    this.cinema = room.cinema;
    this.date = room.date;
    this.time = room.time;
    this.matchType = room.matchType;
    this.intent = room.intent;
    this.womenOnly = room.womenOnly;
    this.capacity = room.capacity;
    this.status = room.status;
    this.members = (room.members || []).map((m) => new RoomMemberDTO(m));
    this.memberCount = this.members.length;
    this.createdAt = room.createdAt;
  }

  static fromRoom(room) {
    if (!room) return null;
    return new RoomDTO(room);
  }
}

module.exports = {
  RoomDTO,
  RoomMemberDTO,
};
