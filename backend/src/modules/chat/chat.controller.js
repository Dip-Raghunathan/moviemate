const chatService = require('./chat.service');
const { MessageDTO } = require('./chat.dto');
const socketUtil = require('../../utils/socket');

class ChatController {
  getMessages = async (req, res, next) => {
    try {
      const messages = await chatService.getMessages(req.params.id, req.user._id, req.query.after);
      const response = MessageDTO.fromMessages(messages);
      return res.success(response, 'Room messages fetched');
    } catch (error) {
      next(error);
    }
  };

  postMessage = async (req, res, next) => {
    try {
      const message = await chatService.postMessage(
        req.params.id,
        req.user._id,
        req.user.name,
        req.body.text
      );
      const response = MessageDTO.fromMessage(message);
      
      // Emit the message via Socket.io
      const io = socketUtil.getIO();
      if (io) {
        io.to(req.params.id).emit('message', response);
      }

      res.statusCode = 201;
      return res.success(response, 'Message posted successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ChatController();
