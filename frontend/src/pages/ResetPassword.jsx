import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, password);
      localStorage.setItem('moviemate_token', res.token);
      updateUser(res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or has expired.');
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
        <h2 className="text-primary-red text-2xl font-bold mb-5">Set New Password</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5 text-left">
            <input
              type="password"
              placeholder="New Password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="mb-6 text-left">
            <input
              type="password"
              placeholder="Confirm New Password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full mb-4" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <Link to="/login" className="text-text-muted hover:text-white text-sm">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
