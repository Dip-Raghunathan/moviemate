const eventService = require('./event.service');

class EventController {
  list = async (req, res, next) => {
    try {
      const { city, organizer } = req.query;
      const list = await eventService.listEvents(city, organizer);
      return res.success(list, 'Events list fetched');
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const event = await eventService.createEvent(req.user._id, req.body);
      res.statusCode = 201;
      return res.success(event, 'Event created successfully');
    } catch (error) {
      next(error);
    }
  };

  rsvp = async (req, res, next) => {
    try {
      const { id: eventId } = req.params;
      const { rsvp } = req.body;
      const event = await eventService.rsvpEvent(req.user._id, eventId, rsvp);
      return res.success(event, rsvp ? 'RSVP confirmed' : 'RSVP cancelled');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new EventController();
