import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./RecapCard.css";
import { useTranslation } from "react-i18next";

function RecapCard({ recap }) {
  const { t } = useTranslation();
  const coverUrl =
    (recap.pages && recap.pages[0] && (recap.pages[0].background_image_url || recap.pages[0].background_url)) || "";
  const theme = t(`db.themes.${recap.theme_name?.toLowerCase() || ""}`) || recap.theme_name || "-";
  const author = recap.author_name || "Tu";
  const isDerived = Boolean(recap.derived_from_recap_id || recap.original_summary_id);
  const mainAuthor = recap.derived_from_author || "?";

  return (
    <div className="recap-card">
      <div className="recap-card-cover" style={{ backgroundImage: `url(${coverUrl})` }} />
      <div className="recap-card-body">
        <h3 className="recap-card-title">{recap.title}</h3>
        <div className="recap-card-meta">
          <span className="recap-card-badge-author">
            {t("ui.recap_card.by")} {author}
          </span>
          <span className="recap-card-badge-theme">{theme}</span>
          <span className="recap-card-badge-visibility">
            {t(`db.visibility.${recap.visibility}`)}
          </span>
        </div>
        <div className="recap-card-meta">
          <span className="recap-card-badge-derived" style={{ visibility: isDerived ? "visible" : "hidden" }}>
            {t("ui.recap_card.from")} <i>{mainAuthor}</i>
          </span>
        </div>

        <Link to={`/recaps/${recap.id}`} className="recap-card-button">
          {t("ui.recap_card.view")}
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
