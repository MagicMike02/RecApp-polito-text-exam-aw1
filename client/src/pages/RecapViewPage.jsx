import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecapById, deleteRecap } from "../services/apiService";
import { Spinner } from "react-bootstrap";
import { Alert } from "react-bootstrap";
import { FALLBACK_IMAGE_URL } from "../constants";
import "./RecapViewPage.css";

function RecapViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    getRecapById(id)
      .then((data) => {
        setRecap(data);
        setLoading(false);
        setCurrentPage(0);
      })
      .catch((err) => {
        setError(err.message || "Errore nel caricamento del recap.");
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Sei sicuro di voler eliminare questo recap?")) {
      try {
        await deleteRecap(id);
        alert("Recap eliminato con successo.");
        navigate("/profile");
      } catch (error) {
        alert(`Errore durante l'eliminazione: ${error.message}`);
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" role="status" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!recap) return null;

  const pages = recap.pages || [];
  const page = pages[currentPage] || {};

  return (
    <div className="recap-view-container">
      <div className="recap-header-row">
        <button className="back-btn" onClick={() => navigate(-1)}>
          &larr; Torna indietro
        </button>
        <h2 className="recap-title">{recap.title}</h2>
        <button className="delete-btn" onClick={handleDelete}>
          Elimina
        </button>
      </div>

      <div className="recap-info">
        <div className="recap-card-meta" style={{ justifyContent: "center" }}>
          <span className="recap-card-badge-author">di {recap.author_name}</span>
          <span className="recap-card-badge-theme">{recap.theme_name}</span>
          <span className="recap-card-badge-visibility">{recap.visibility === "public" ? "Pubblico" : "Privato"}</span>
        </div>

        <div className="recap-card-meta">
          <span
            className="recap-card-badge-derived"
            style={{ visibility: recap.derived_from_recap_id ? "visible" : "hidden" }}
          >
            Da <i>{recap.derived_from_author}</i>
          </span>
        </div>
      </div>
      <div className="recap-slideshow">
        <div className="recap-slideshow-img-wrapper" style={{ position: "relative" }}>
          <img
            src={page.background_image_url || FALLBACK_IMAGE_URL}
            alt={"Pagina " + (currentPage + 1)}
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
            Precedente
          </button>
          <span className="recap-slideshow-page">
            {currentPage + 1} / {pages.length}
          </span>
          <button
            className="recap-slideshow-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pages.length - 1))}
            disabled={currentPage === pages.length - 1}
          >
            Successiva
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecapViewPage;
