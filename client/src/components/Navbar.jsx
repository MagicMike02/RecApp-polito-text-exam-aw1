import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar-custom">
      <div className="navbar-container">
        {/* LATO SINISTRO: Logo + Menu */}
        <div className="navbar-left">
          <Link to="/" className="brand-text">
            RecApp
          </Link>

          <div className="navbar-links">
            <NavLink to="/" className="nav-link-custom" end>
              Home
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/profile" className="nav-link-custom">
                My Recaps
              </NavLink>
            )}
          </div>
        </div>

        {/* LATO DESTRO: Utente */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-3">
              <span className="small fw-bold text-muted">{user?.name || user?.username || "Utente"}</span>

              <button onClick={handleLogout} className="btn-logout">
                Esci
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login-custom">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
