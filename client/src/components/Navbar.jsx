import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar sticky-top navbar-custom d-flex align-items-center">
      <div className="container-fluid px-4 px-md-5 d-flex justify-content-between align-items-center h-100">
        {/* LATO SINISTRO: Logo + Menu */}
        <div className="d-flex align-items-center gap-5">
          <Link to="/" className="brand-text">
            RecApp
          </Link>

          <div className="d-flex">
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
        <div className="d-flex align-items-center">
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-3">
              <span className="small fw-bold text-muted">{user?.name || user?.username || "Utente"}</span>

              <button onClick={handleLogout} className="btn-logout">
                Esci
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary-custom btn-sm d-flex align-items-center text-decoration-none"
              style={{ minHeight: "40px", padding: "0 1.5rem" }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
