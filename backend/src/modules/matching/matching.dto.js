class RoomMemberDTO {
  constructor(member, hostId) {
    // If user is populated, user is an object, otherwise it's just the ObjectId
    const userObj = member.user || {};
    this.user = userObj._id || userObj.id || member.user;
    this.name = userObj.name || '';
    this.age = userObj.age || null;
    this.isHost = hostId && this.user && hostId.toString() === this.user.toString() ? true : false;
    this.profilePicture = ''; // Do not display profile pictures
    this.gender = member.gender;
    this.joinedAt = member.joinedAt;
    this.introduction = member.introduction || 'Hi! Excited to watch this movie together.';
    this.readyToChat = member.readyToChat || false;
  }
}

class RoomDTO {
  constructor(room) {
    this.id = room.id || room._id;
    this.movie = room.movie;
    this.cinema = room.cinema;
    this.city = room.city;
    this.date = room.date;
    this.showTiming = room.showTiming;
    this.time = room.time;
    this.matchType = room.matchType;
    this.intent = room.intent;
    this.womenOnly = room.womenOnly;
    this.capacity = room.capacity;
    
    // Determine status (Active / Full / Expired)
    let cleanStatus = room.status || 'Active';
    if (cleanStatus === 'open') cleanStatus = 'Active';
    else if (cleanStatus === 'full') cleanStatus = 'Full';
    if (room.expiryTimestamp && new Date() > new Date(room.expiryTimestamp)) {
      cleanStatus = 'Expired';
    }
    this.status = cleanStatus;
    
    this.expiryTimestamp = room.expiryTimestamp;
    this.members = (room.members || []).map((m) => new RoomMemberDTO(m, room.createdBy));
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
