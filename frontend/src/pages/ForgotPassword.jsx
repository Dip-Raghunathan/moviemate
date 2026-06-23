import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
        <h2 className="text-primary-red text-2xl font-bold">Reset Password</h2>
        <p className="mb-5 mt-1 text-text-muted text-sm">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4 text-left">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-3 mb-4 text-left">
            {message}
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
          <button type="submit" className="btn-primary w-full mb-4" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link to="/login" className="text-text-muted hover:text-white text-sm">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
