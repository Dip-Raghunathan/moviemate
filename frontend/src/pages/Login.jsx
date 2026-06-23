import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
        <h2 className="text-primary-red text-2xl font-bold">MovieMate</h2>
        <p className="mb-5 mt-1">Welcome back.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6 text-left">
            <input
              type="email"
              placeholder="Email Address"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6 text-left">
            <input
              type="password"
              placeholder="Password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full mb-4" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-sm">
          <Link to="/forgot-password" className="text-text-muted hover:text-white">
            Forgot Password?
          </Link>
          <br />
          <br />
          New to MovieMate?{' '}
          <Link to="/signup" className="text-white font-bold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
