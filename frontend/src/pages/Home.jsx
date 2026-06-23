import { Link, useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '🎟️',
    title: '1. Choose Movie & Cinema',
    text: 'Pick the movie you want to see, the cinema hall, and your preferred showtime.',
  },
  {
    icon: '👥',
    title: '2. Pick Match Type',
    text: 'Select either a Solo Match (1 companion) or a Small Group Match (3 companions).',
  },
  {
    icon: '✨',
    title: '3. Get Matched Instantly',
    text: 'We auto-match you into a private chat room with others watching the same show!',
  },
];

const testimonials = [
  { quote: 'MovieMate completely changed my weekends. Found a great group to watch Dune 2 with!', name: 'Sarah J.' },
  { quote: 'I travel for work and hate going to theaters alone. Solo match is a lifesaver.', name: 'Mike T.' },
  { quote: 'The UI is beautiful and finding a group is literally instantaneous. Highly recommend!', name: 'Priya K.' },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <nav className="flex justify-between items-center px-5 py-5 absolute top-0 w-full z-10">
        <div className="text-2xl font-bold text-primary-red">MovieMate</div>
        <div className="flex items-center gap-5">
          <Link to="/login" className="hover:text-primary-red transition-colors">
            Login
          </Link>
          <button className="btn-primary" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </nav>

      <header
        className="h-screen flex items-center text-center"
        style={{
          background:
            "linear-gradient(to top, #141414, rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80') center/cover",
        }}
      >
        <div className="container mx-auto max-w-[1200px] px-5 w-full animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-3 leading-tight">Never Watch Movies Alone Again</h1>
          <p className="text-base md:text-lg text-text-muted max-w-xl mx-auto mb-8">
            Find movie companions who are watching the same movie at the same cinema and enjoy movies together.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              Get Started
            </button>
            <button
              className="btn-outline"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            >
              How It Works
            </button>
          </div>
        </div>
      </header>

      <section className="py-20 px-5" id="how-it-works">
        <div className="container mx-auto max-w-[1200px] px-5">
          <h2 className="text-center mb-12 text-4xl">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="glass-card text-center transition-transform hover:-translate-y-2">
                <div className="text-5xl text-primary-red mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5">
        <div className="container mx-auto max-w-[1200px] px-5">
          <h2 className="text-center mb-12 text-4xl">User Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card">
                <p>"{t.quote}"</p>
                <h4 className="mt-4 text-primary-red">- {t.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-5">Ready to grab your popcorn?</h2>
        <button className="btn-primary text-lg px-10 py-4" onClick={() => navigate('/signup')}>
          Join MovieMate Today
        </button>
      </section>

      <footer className="text-center py-10 bg-black/40 border-t border-white/10">
        <p>&copy; 2026 MovieMate. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
