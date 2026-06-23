import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation'];

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleGenre = (genre) => {
    setGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.gender) {
      setError('Please select your gender');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        age: Number(form.age),
        gender: form.gender,
        favoriteGenres: genres,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center px-5 pt-24 pb-5"
      style={{
        background:
          "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80') center/cover",
      }}
    >
      <div className="glass-card w-full max-w-md text-center animate-fade-in">
        <h2 className="text-primary-red text-2xl font-bold mb-5">Join MovieMate</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5 text-left">
            <input name="name" placeholder="Full Name" className="form-input" value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-5 text-left">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5 text-left">
            <input
              type="number"
              name="age"
              placeholder="Age"
              min="16"
              max="100"
              className="form-input"
              value={form.age}
              onChange={handleChange}
              required
            />
            <select name="gender" className="form-input" value={form.gender} onChange={handleChange} required>
              <option value="" disabled>
                Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="mb-5 text-left">
            <label className="block mb-2 text-text-muted text-sm">Favorite Genres (optional)</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    genres.includes(g)
                      ? 'bg-primary-red border-primary-red text-white'
                      : 'border-white/20 text-text-muted hover:border-white/40'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5 text-left">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="mb-6 text-left">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="form-input"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mb-4" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-bold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
