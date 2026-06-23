import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ rightContent }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center px-5 py-5 fixed top-0 w-full z-10 bg-bg-dark/95 md:bg-transparent md:relative md:absolute">
      <Link to={user ? '/dashboard' : '/'} className="text-2xl font-bold text-primary-red">
        MovieMate
      </Link>
      <div className="flex items-center gap-5">
        {rightContent}
        {user && (
          <>
            <Link to="/profile" className="hover:text-primary-red transition-colors">
              My Profile
            </Link>
            <button onClick={handleLogout} className="text-text-muted hover:text-white transition-colors text-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
