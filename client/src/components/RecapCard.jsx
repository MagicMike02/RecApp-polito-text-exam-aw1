import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./RecapCard.css";

function RecapCard({ recap }) {
  const coverUrl = recap.pages?.[0]?.background_url || "";
  return (
    <div className="recap-card">
      <div className="recap-card-cover" style={{ backgroundImage: `url(${coverUrl})` }} />
      <div className="recap-card-body">
        <h3 className="recap-card-title">{recap.title}</h3>
        <div className="recap-card-meta">
          <span className="recap-card-author">di {recap.author_name}</span>
          <span className="recap-card-theme">{recap.theme_name}</span>
        </div>
        {recap.original_summary_id && <span className="recap-card-derived">Derivato da un altro recap</span>}
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
    author_name: PropTypes.string.isRequired,
    theme_name: PropTypes.string,
    original_summary_id: PropTypes.number,
    pages: PropTypes.arrayOf(
      PropTypes.shape({
        background_url: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default RecapCard;
