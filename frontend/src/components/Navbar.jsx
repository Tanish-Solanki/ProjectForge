import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors ${isActive
      ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
      : 'text-gray-600 hover:text-gray-900'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2 text-base font-medium rounded-md ${isActive
      ? 'bg-blue-50 text-blue-700 font-semibold'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Project<span className="text-blue-600">Forge</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/projects" className={navLinkClass}>
                  Projects
                </NavLink>
                <NavLink to="/my-projects" className={navLinkClass}>
                  My Projects
                </NavLink>
                <NavLink to="/teammates" className={navLinkClass}>
                  Find Teammates
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
              </div>
            )}
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.experienceLevel}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-2 pt-2 pb-3 space-y-1">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 border-b border-gray-100 mb-2">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email} ({user?.experienceLevel})</div>
              </div>
              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/projects" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Projects
              </NavLink>
              <NavLink to="/my-projects" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                My Projects
              </NavLink>
              <NavLink to="/teammates" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Find Teammates
              </NavLink>
              <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Profile
              </NavLink>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-1 pt-1">
              <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Home
              </NavLink>
              <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Log in
              </NavLink>
              <NavLink to="/register" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Register
              </NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
