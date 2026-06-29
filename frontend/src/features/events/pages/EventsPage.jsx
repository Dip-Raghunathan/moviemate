import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import * as eventService from '../../../services/eventService';
import { useAuth } from '../../../core/contexts/AuthContext';
import Spinner from '../../../shared/components/ui/Spinner';
import Avatar from '../../../shared/components/ui/Avatar';
import Badge from '../../../shared/components/ui/Badge';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating event
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [movie, setMovie] = useState('');
  const [theatre, setTheatre] = useState('');
  const [showtime, setShowtime] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventService.getEvents();
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId, currentlyRsvped) => {
    try {
      const updated = await eventService.rsvpEvent(eventId, !currentlyRsvped);
      // Update local state list
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, participants: updated.data.participants } : e))
      );
    } catch (err) {
      console.error('Failed to RSVP:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !movie || !theatre || !showtime) return;

    setCreating(true);
    try {
      await eventService.createEvent({
        title,
        description,
        movie,
        theatre,
        showtime,
      });
      setTitle('');
      setDescription('');
      setMovie('');
      setTheatre('');
      setShowtime('');
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <PremiumIcon name="popcorn" size={28} color="#f5a623" />
              Movie Events
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Join local theater meetups, weekend marathons, or online co-watch parties organized by communities.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e8102a] to-[#ff4b5e] text-xs font-bold shadow-[0_4px_24px_rgba(232,16,42,0.35)] hover:brightness-110 active:scale-95 transition-all"
          >
            + Create Event
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="md" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.01] rounded-2xl border border-white/[0.03] max-w-xl mx-auto p-8">
            <div className="text-5xl mb-4 block flex justify-center">
              <PremiumIcon name="movie" size={56} color="#4a4a60" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">No Scheduled Events</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              No cinema watch parties are currently active. Be the first to coordinate a meetup by clicking "Create Event"!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => {
              const isRsvped = evt.participants?.some(p => (p._id || p) === user?.id);
              const dateStr = new Date(evt.showtime).toLocaleDateString([], {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              });
              const timeStr = new Date(evt.showtime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={evt._id}
                  className="p-6 rounded-2xl border border-white/[0.03] bg-white/[0.01] backdrop-blur-md flex flex-col gap-4 hover:bg-white/[0.02] hover:border-white/[0.06] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="glow" className="mb-2 text-[9px] bg-red-900/20 text-[#ff4b5e]" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                        <PremiumIcon name="popcorn" size={12} color="#ff4b5e" />
                        Watch Party
                      </Badge>
                      <h3 className="text-base font-bold text-slate-100">{evt.title}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">
                        {evt.description}
                      </p>
                      {evt.organizer && (
                        <p className="text-[11px] text-slate-500 mt-2">
                          Hosted by:{' '}
                          <Link
                            to={`/profile/${evt.organizer._id}`}
                            className="text-[#ff4b5e] hover:underline font-bold"
                          >
                            {evt.organizer.name}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-white/[0.03] py-4 my-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">
                        Movie / Theater
                      </span>
                      <span className="font-bold text-slate-300 block truncate mt-1" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PremiumIcon name="movie" size={16} color="#a8a8c0" />
                        {evt.movie}
                      </span>
                      <span className="text-slate-400 block truncate" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PremiumIcon name="pin" size={16} color="#6b6b85" />
                        {evt.theatre}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">
                        Date / Showtime
                      </span>
                      <span className="font-bold text-slate-300 block mt-1" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <PremiumIcon name="calendar" size={14} color="#a8a8c0" />
                        {dateStr}
                      </span>
                      <span className="text-slate-400 block" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <PremiumIcon name="clock" size={14} color="#6b6b85" />
                        {timeStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        Attending ({evt.participants?.length || 0})
                      </span>
                      <div className="flex -space-x-2 overflow-hidden mt-1">
                        {evt.participants?.slice(0, 5).map((p) => (
                          <Link
                            to={`/profile/${p._id || p}`}
                            key={p._id || p}
                            className="inline-block rounded-full ring-2 ring-[#05050a] hover:scale-110 transition-transform"
                          >
                            <Avatar size="xs" name={p.name || 'Participant'} src={p.profilePicture} />
                          </Link>
                        ))}
                        {evt.participants?.length > 5 && (
                          <div className="w-6 h-6 rounded-full bg-[#1b1b2a] flex items-center justify-center font-bold text-[9px] text-slate-400 ring-2 ring-[#05050a]">
                            +{evt.participants.length - 5}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {evt.room && isRsvped && (
                        <Link
                          to={`/chat/${evt.room}`}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#e8102a] text-white hover:brightness-110 active:scale-95 transition-all"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                        >
                          <PremiumIcon name="message" size={12} color="white" /> Open Chat
                        </Link>
                      )}
                      <button
                        onClick={() => handleRSVP(evt._id, isRsvped)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          isRsvped
                            ? 'bg-[#1b1b2a] text-[#ff4b5e] border border-[#ff4b5e]/30'
                            : 'bg-white/[0.05] text-slate-200 hover:bg-white/[0.08]'
                        }`}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {isRsvped ? (
                          <>
                            <PremiumIcon name="check" size={12} color="#ff4b5e" /> RSVPed
                          </>
                        ) : (
                          'RSVP'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a14] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
              <h3 className="text-base font-bold text-slate-100">Schedule Match Meetup</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4 text-xs font-medium">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Marvel Fans Premiere"
                  className="w-full bg-[#1b1b2a]/40 border border-white/[0.04] rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-[#e8102a]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Movie
                </label>
                <input
                  type="text"
                  required
                  value={movie}
                  onChange={(e) => setMovie(e.target.value)}
                  placeholder="e.g. Deadpool & Wolverine"
                  className="w-full bg-[#1b1b2a]/40 border border-white/[0.04] rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-[#e8102a]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Theater Hall
                </label>
                <input
                  type="text"
                  required
                  value={theatre}
                  onChange={(e) => setTheatre(e.target.value)}
                  placeholder="e.g. IMAX PVR, Forum Mall"
                  className="w-full bg-[#1b1b2a]/40 border border-white/[0.04] rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-[#e8102a]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Showtime Date/Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={showtime}
                  onChange={(e) => setShowtime(e.target.value)}
                  className="w-full bg-[#1b1b2a]/40 border border-white/[0.04] rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-[#e8102a]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell people about the meetup plan..."
                  rows={3}
                  className="w-full bg-[#1b1b2a]/40 border border-white/[0.04] rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-[#e8102a]"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e8102a] to-[#ff4b5e] font-bold text-slate-100 mt-2 shadow-[0_4px_16px_rgba(232,16,42,0.3)] disabled:opacity-50 hover:brightness-110 transition-all"
              >
                {creating ? 'Scheduling...' : 'Schedule Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
