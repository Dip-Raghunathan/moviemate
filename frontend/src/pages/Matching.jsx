import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import * as roomService from '../services/roomService';

const Matching = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [searching, setSearching] = useState(true);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const roomId = state?.roomId;

  useEffect(() => {
    if (!roomId) {
      navigate('/dashboard');
      return;
    }

    // Brief "searching" animation for UX, matching the original feel,
    // then start polling the real room for live member/status updates.
    const searchTimer = setTimeout(() => setSearching(false), 1500);

    const poll = async () => {
      try {
        const { room } = await roomService.getRoom(roomId);
        setRoom(room);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load room.');
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);

    return () => {
      clearTimeout(searchTimer);
      clearInterval(pollRef.current);
    };
  }, [roomId, navigate]);

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto max-w-[1200px] px-5 pt-32 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto max-w-[1200px] px-5 pt-32 pb-12">
        {searching || !room ? (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white/10 border-t-primary-red rounded-full animate-spin mx-auto mb-5" />
            <h2 className="text-2xl mb-2">Searching for companions...</h2>
            <p className="text-text-muted">Scanning theaters and showtimes...</p>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <h2 className="mb-5 text-2xl">Match Found!</h2>

            <div className="glass-card flex flex-col md:flex-row justify-between items-center gap-4 text-left max-w-2xl mx-auto">
              <div>
                <h3 className="text-primary-red text-lg font-semibold">
                  Room #{room.id.slice(-4).toUpperCase()}
                </h3>
                <p className="text-text-muted">
                  Movie: {room.movie} | Cinema: {room.cinema}
                </p>
                <p className="text-text-muted text-sm capitalize">
                  {room.matchType} Match &middot; {room.intent}
                  {room.womenOnly && ' · Women Only'}
                </p>
                <p className="mt-1">
                  Members: {room.memberCount}/{room.capacity} &middot; Status:{' '}
                  <span className={room.status === 'open' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    {room.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <button className="btn-primary shrink-0" onClick={() => navigate(`/chat/${room.id}`)}>
                {room.status === 'full' ? 'Enter Room' : 'Join Room'}
              </button>
            </div>

            {room.status === 'open' && (
              <p className="text-text-muted text-sm mt-5">
                Waiting for {room.capacity - room.memberCount} more{' '}
                {room.capacity - room.memberCount === 1 ? 'companion' : 'companions'}... You can enter the room now
                and chat while you wait.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matching;
