const matchingService = require('./matching.service');
const { RoomDTO } = require('./matching.dto');

class MatchingController {
  startMatch = async (req, res, next) => {
    try {
      const room = await matchingService.startMatch(req.user, req.body);
      const response = RoomDTO.fromRoom(room);
      return res.success({ room: response }, 'Match pairing processed');
    } catch (error) {
      next(error);
    }
  };

  getRoom = async (req, res, next) => {
    try {
      const room = await matchingService.getRoom(req.params.id, req.user._id);
      const response = RoomDTO.fromRoom(room);
      return res.success({ room: response }, 'Room details fetched');
    } catch (error) {
      next(error);
    }
  };

  getMyRoom = async (req, res, next) => {
    try {
      const room = await matchingService.getMyRoom(req.user._id);
      const response = RoomDTO.fromRoom(room);
      return res.success({ room: response }, 'User active room retrieved');
    } catch (error) {
      next(error);
    }
  };

  leave = async (req, res, next) => {
    try {
      const result = await matchingService.leaveRoom(req.params.id, req.user._id);
      if (result.deleted) {
        return res.success(result, 'Room deleted since all members left');
      }
      const response = RoomDTO.fromRoom(result.room);
      return res.success({ deleted: false, room: response }, 'Successfully left the room');
    } catch (error) {
      next(error);
    }
  };

  getVacantRooms = async (req, res, next) => {
    try {
      const { city } = req.query;
      const rooms = await matchingService.getVacantRooms(req.user._id, city);
      const response = rooms.map(room => RoomDTO.fromRoom(room));
      return res.success({ rooms: response }, 'Vacant sessions fetched');
    } catch (error) {
      next(error);
    }
  };

  joinRoom = async (req, res, next) => {
    try {
      const room = await matchingService.joinRoom(req.params.id, req.user, req.body.introduction);
      const response = RoomDTO.fromRoom(room);
      return res.success({ room: response }, 'Joined vacant session successfully');
    } catch (error) {
      next(error);
    }
  };

  getUnreviewedRoom = async (req, res, next) => {
    try {
      const room = await matchingService.getUnreviewedRoom(req.user._id);
      if (room) {
        const { RoomDTO } = require('./matching.dto');
        const response = RoomDTO.fromRoom(room);
        return res.success({ room: response }, 'Unreviewed room found');
      }
      return res.success({ room: null }, 'No unreviewed room');
    } catch (error) {
      next(error);
    }
  };

  setReadyToChat = async (req, res, next) => {
    try {
      const result = await matchingService.setReadyToChat(req.params.id, req.user._id);
      const response = RoomDTO.fromRoom(result.room);
      return res.success({ allReady: result.allReady, room: response }, 'Ready to chat status updated');
    } catch (error) {
      next(error);
    }
  };

  leaveIntro = async (req, res, next) => {
    try {
      const result = await matchingService.leaveIntro(req.params.id, req.user._id);
      return res.success(result, 'Successfully left match introduction');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new MatchingController();
