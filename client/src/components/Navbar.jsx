import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { t } = useTranslation();
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
            {t("ui.nav.brand")}
          </Link>

          <div className="navbar-links">
            <NavLink to="/" className="nav-link-custom" end>
              {t("ui.nav.home")}
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/profile" className="nav-link-custom">
                {t("ui.nav.my_recaps")}
              </NavLink>
            )}
          </div>
        </div>

        {/* LATO DESTRO: Utente */}
        <div className="navbar-user" style={{ gap: "1rem" }}>
          <LanguageSwitcher />
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-3">
              <span className="small fw-bold text-muted">
                {user?.name || user?.username || t("ui.nav.user_fallback")}
              </span>

              <button className="btn-logout" onClick={handleLogout}>
                {t("ui.buttons.logout")}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login-custom">
              {t("ui.nav.login")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
