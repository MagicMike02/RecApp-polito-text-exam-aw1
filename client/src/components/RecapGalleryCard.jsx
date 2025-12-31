import PropTypes from "prop-types";
import "./RecapCard.css";

function RecapGalleryCard({ recap, showDesc = false, showUseBtn = false, showPreviewBtn = false }) {
  const theme = recap.theme_name || "-";
  const author = recap.author_name || "Tu";
  const isPublic = recap.visibility === "public";
  const isDerived = Boolean(recap.derived_from_recap_id || recap.original_summary_id);
  const mainAuthor = recap.derived_from_author || "?";

  // Mostra tutte le immagini delle pagine come una gallery orizzontale in alto
  const pageImages =
    recap.pages && recap.pages.length > 0
      ? recap.pages.map((page, idx) =>
          page.background_image_url || page.background_url ? (
            <div
              key={idx}
              className="recap-card-cover-multi"
              style={{ backgroundImage: `url(${page.background_image_url || page.background_url})` }}
            />
          ) : null
        )
      : null;

  return (
    <div className="recap-card">
      {/* Gallery di immagini come cover unica */}
      <div className="recap-card-covers-multi" style={{ width: "100%" }}>
        {pageImages}
      </div>
      <div className="recap-card-body">
        <h3 className="recap-card-title">{recap.title}</h3>
        <div className="recap-card-meta">
          <span className="recap-card-badge-author">di {author}</span>
          <span className="recap-card-badge-theme">{theme}</span>
          <span className="recap-card-badge-visibility">{isPublic ? "Pubblico" : "Privato"}</span>
        </div>
        <div className="recap-card-meta">
          <span className="recap-card-badge-derived" style={{ visibility: isDerived ? "visible" : "hidden" }}>
            Da <i>{mainAuthor}</i>
          </span>
        </div>
        {showDesc && recap.description && <div className="crp-desc">{recap.description}</div>}
        <div className="crp-btn-row">
          {showPreviewBtn && (
            <button className="crp-btn" onClick={recap.onPreview}>
              Anteprima
            </button>
          )}
          {showUseBtn && (
            <button className="crp-btn" onClick={recap.onUse}>
              Usa template
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

RecapGalleryCard.propTypes = {
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
    description: PropTypes.string,
    onUse: PropTypes.func,
    onPreview: PropTypes.func,
  }).isRequired,
  showDesc: PropTypes.bool,
  showUseBtn: PropTypes.bool,
  showPreviewBtn: PropTypes.bool,
};

export default RecapGalleryCard;
