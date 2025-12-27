import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./RecapCard.css";

function RecapCard({ recap }) {
  const coverUrl = recap.pages?.[0]?.background_image_url || recap.pages?.[0]?.background_url || "";
  const isPublic = recap.visibility === "public";
  const theme = recap.theme_name || "-";
  const author = recap.author_name || "Tu";
  const isDerived = recap.derived_from_recap_id || recap.original_summary_id;
  const derivedLabel = isDerived ? "Derivato da un altro recap" : null;

  return (
    <div className="recap-card">
      <div className="recap-card-cover" style={{ backgroundImage: `url(${coverUrl})` }} />
      <div className="recap-card-body">
        <h3 className="recap-card-title">{recap.title}</h3>
        <div className="recap-card-meta">
          <span className="recap-card-author">di {author}</span>
          <span className="recap-card-theme">{theme}</span>
          <span className="recap-card-badge">{isPublic ? "Pubblico" : "Privato"}</span>
        </div>
        {derivedLabel && <span className="recap-card-derived">{derivedLabel}</span>}
        <Link to={`/recaps/${recap.id}`} className="recap-card-button">
          Visualizza
        </Link>
      </div>
    </div>
  );
}

RecapCard.propTypes = {
  recap: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    author_name: PropTypes.string,
    theme_name: PropTypes.string,
    original_summary_id: PropTypes.number,
    derived_from_recap_id: PropTypes.number,
    visibility: PropTypes.string,
    pages: PropTypes.arrayOf(
      PropTypes.shape({
        background_url: PropTypes.string,
        background_image_url: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default RecapCard;
