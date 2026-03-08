import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-wrap">
      <div className="container navbar">
        <Link to="/" className="brand">
          Urban Bites
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
          <NavLink to="/menu" className="nav-link">
            Menu
          </NavLink>
          {user && (
            <>
              <NavLink to="/reservations" className="nav-link">
                Reservations
              </NavLink>
              <NavLink to="/orders" className="nav-link">
                Orders
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="nav-link">
              Admin
            </NavLink>
          )}
          <NavLink to="/cart" className="nav-link cart-link">
            Cart ({itemCount})
          </NavLink>
        </nav>

        <div className="auth-actions">
          {user ? (
            <>
              <span className="user-chip">{user.name}</span>
              <button type="button" className="btn btn-outline" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/signup" className="btn btn-solid">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
