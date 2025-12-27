import { useEffect, useState, useContext } from "react";
import "./RecapViewPage.css";
import { useParams, useNavigate } from "react-router-dom";
import { getRecapById } from "../services/apiService";
import { AuthContext } from "../context/AuthContext";
import Spinner from "../components/utils/Spinner";
import Alert from "../components/utils/Alert";

function RecapViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    getRecapById(id)
      .then((data) => {
        setRecap(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Errore nel caricamento.");
        setLoading(false);
      });
  }, [id]);

  const handleDerive = () => {
    navigate("/create", {
      state: {
        derivedFrom: {
          id: recap.id,
          title: recap.title,
          author: recap.author_name,
          themeId: recap.theme_id,
        },
      },
    });
  };

  if (loading) return <Spinner />;
  if (error) return <Alert message={error} type="error" />;
  if (!recap) return null;

  const pages = recap.pages || [];
  const page = pages[currentPage] || {};
  const isLastPage = currentPage === pages.length - 1;
  const isFirstPage = currentPage === 0;

  return (
    <div className="recap-view-container">
      <div className="recap-header-row">
        <button className="back-btn" onClick={() => navigate(-1)}>
          &larr; Indietro
        </button>
        <h2 className="recap-title">{recap.title}</h2>
      </div>

      <div className="recap-info">
        <div className="recap-meta">
          <span className="recap-badge badge-author">di {recap.author_name}</span>
          <span className="recap-badge badge-theme">{recap.theme_name}</span>
          <span className="recap-badge badge-visibility">{recap.visibility === "public" ? "Pubblico" : "Privato"}</span>
        </div>
        {recap.derived_from_recap_id && (
          <div className="recap-meta derived-row">
            <span className="recap-badge badge-derived">Ispirato da {recap.derived_from_author}</span>
          </div>
        )}
      </div>

      <div className="recap-slideshow">
        <div className="recap-slideshow-img-wrapper">
          <img src={page.background_image_url} alt={"Slide " + (currentPage + 1)} className="recap-slideshow-img" />

          {page.text_positions &&
            page.text_positions.fields &&
            page.text_positions.fields.map((pos, index) => {
              const textContent = page[`text_field_${index + 1}`];
              if (!textContent) return null;

              return (
                <div
                  key={index}
                  className="recap-slideshow-text"
                  style={{
                    left: `${pos.x * 100}%`,
                    top: `${pos.y * 100}%`,
                    width: `${pos.w * 100}%`,
                    height: `${pos.h * 100}%`,
                  }}
                >
                  {textContent}
                </div>
              );
            })}
        </div>

        <div className="recap-slideshow-controls">
          <button
            className="recap-slideshow-btn"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={isFirstPage}
          >
            Precedente
          </button>
          <span className="recap-slideshow-page">
            {currentPage + 1} / {pages.length}
          </span>
          <button
            className="recap-slideshow-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pages.length - 1))}
            disabled={isLastPage}
          >
            Successiva
          </button>
        </div>
      </div>

      {user && user.id !== recap.user_id && (
        <div className="recap-footer-actions">
          <button className="derive-btn" onClick={handleDerive}>
            Crea il tuo anno simile a questo
          </button>
        </div>
      )}
    </div>
  );
}

export default RecapViewPage;
