const Event = require('../../database/models/Event');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

class EventService {
  async listEvents(city = null, organizerId = null) {
    const query = { status: 'scheduled' };
    if (city) {
      query.city = city.trim();
    }
    if (organizerId) {
      query.organizer = organizerId;
    }
    return Event.find(query)
      .populate('organizer', 'name profilePicture')
      .populate('participants', 'name profilePicture isPro gender');
  }

  async createEvent(organizerId, eventData) {
    const { title, description, movie, theatre, showtime } = eventData;

    if (!title || !movie || !theatre || !showtime) {
      throw new BadRequestError('title, movie, theatre, and showtime are required', 'MISSING_EVENT_FIELDS');
    }

    return Event.create({
      title,
      description,
      movie,
      theatre,
      showtime: new Date(showtime),
      organizer: organizerId,
      participants: [organizerId],
    });
  }

  async rsvpEvent(userId, eventId, rsvp) {
    const update = rsvp
      ? { $addToSet: { participants: userId } }
      : { $pull: { participants: userId } };

    const event = await Event.findByIdAndUpdate(eventId, update, { new: true });
    if (!event) {
      throw new NotFoundError('Event not found', 'EVENT_NOT_FOUND');
    }

    return event.populate('organizer', 'name profilePicture');
  }
}

module.exports = new EventService();
