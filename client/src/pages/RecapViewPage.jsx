import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecapById, deleteRecap } from "../services/apiService";
import { Spinner } from "react-bootstrap";
import { FALLBACK_IMAGE_URL } from "../constants";
import { useNotification } from "../contexts/NotificationContext";
import "./RecapViewPage.css";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

function RecapViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { isAuthenticated, user } = useAuth();
  const { showError, showSuccess, confirmAction } = useNotification();

  const currentUser = isAuthenticated ? user.id : null;

  useEffect(() => {
    setLoading(true);
    getRecapById(id)
      .then((data) => {
        setRecap(data);
        setLoading(false);
        setCurrentPage(0);
      })
      .catch((err) => {
        const errorMsg = err.message || t("ui.viewer.error_loading");
        showError(t("ui.viewer.error_title"), errorMsg);
        setLoading(false);
      });
  }, [id, showError, confirmAction, t]);

  const handleDelete = async () => {
    await confirmAction(t("ui.viewer.delete_title"), t("ui.viewer.delete_confirm"), async () => {
      try {
        await deleteRecap(id);
        showSuccess(t("ui.viewer.delete_success_title"), t("ui.viewer.delete_success_msg"));
        navigate("/profile");
      } catch (error) {
        showError(t("ui.viewer.error_title"), t("ui.viewer.delete_error", { msg: error.message }));
      }
    });
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  if (!recap) return null;

  const pages = recap.pages || [];
  const page = pages[currentPage] || {};
  const totalPages = pages.length;

  return (
    <div className="recap-view-container">
      <div className="recap-header-row">
        <button className="back-btn" onClick={() => navigate(-1)}>
          &larr; {t("ui.viewer.back")}
        </button>
        <h2 className="recap-title">{recap.title}</h2>
        <button
          className="delete-btn"
          onClick={handleDelete}
          style={{ visibility: recap.user_id === currentUser ? "visible" : "hidden" }}
        >
          {t("ui.viewer.delete")}
        </button>
      </div>

      <div className="recap-info">
        <div className="recap-card-meta" style={{ justifyContent: "center" }}>
          <span className="recap-card-badge-author">
            {t("ui.recap_card.by")} {recap.author_name}
          </span>
          <span className="recap-card-badge-theme">{recap.theme_name}</span>
          <span className="recap-card-badge-visibility">
            {recap.visibility === "public" ? t("ui.recap_card.public") : t("ui.recap_card.private")}
          </span>
        </div>

        <div className="recap-card-meta">
          <span
            className="recap-card-badge-derived"
            style={{ visibility: recap.derived_from_recap_id ? "visible" : "hidden" }}
          >
            {t("ui.recap_card.from")} <i>{recap.derived_from_author}</i>
          </span>
        </div>
      </div>
      <div className="recap-slideshow">
        <div className="recap-slideshow-img-wrapper" style={{ position: "relative" }}>
          <img
            src={page.background_image_url || FALLBACK_IMAGE_URL}
            alt={t("ui.viewer.page_alt", { page: currentPage + 1 })}
            className="recap-slideshow-img"
            style={{ width: "100%", borderRadius: "16px", boxShadow: "0 4px 24px rgba(15,118,110,0.10)" }}
          />
          {page.text_positions && page.text_positions.fields && (
            <>
              {page.text_field_1 && page.text_positions.fields[0] && (
                <div
                  className="recap-slideshow-text"
                  style={{
                    position: "absolute",
                    left: `${page.text_positions.fields[0].x * 100}%`,
                    top: `${page.text_positions.fields[0].y * 100}%`,
                    width: `${page.text_positions.fields[0].w * 100}%`,
                    height: `${page.text_positions.fields[0].h * 100}%`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  {page.text_field_1}
                </div>
              )}
              {page.text_field_2 && page.text_positions.fields[1] && (
                <div
                  className="recap-slideshow-text"
                  style={{
                    position: "absolute",
                    left: `${page.text_positions.fields[1].x * 100}%`,
                    top: `${page.text_positions.fields[1].y * 100}%`,
                    width: `${page.text_positions.fields[1].w * 100}%`,
                    height: `${page.text_positions.fields[1].h * 100}%`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  {page.text_field_2}
                </div>
              )}
              {page.text_field_3 && page.text_positions.fields[2] && (
                <div
                  className="recap-slideshow-text"
                  style={{
                    position: "absolute",
                    left: `${page.text_positions.fields[2].x * 100}%`,
                    top: `${page.text_positions.fields[2].y * 100}%`,
                    width: `${page.text_positions.fields[2].w * 100}%`,
                    height: `${page.text_positions.fields[2].h * 100}%`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  {page.text_field_3}
                </div>
              )}
            </>
          )}
        </div>
        <div className="recap-slideshow-controls">
          <button
            className="recap-slideshow-btn"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            {t("ui.viewer.prev")}
          </button>
          <span className="recap-slideshow-page">
            {t("ui.viewer.page_status", { current: currentPage + 1, total: totalPages })}
          </span>
          <button
            className="recap-slideshow-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pages.length - 1))}
            disabled={currentPage === pages.length - 1}
          >
            {t("ui.viewer.next")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecapViewPage;
