import PropTypes from "prop-types";
import PagePreview from "./PagePreview";
import "./PageThumbnail.css";

function PageThumbnail({
  page,
  background,
  index,
  isActive,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}) {
  return (
    <div className={`page-thumbnail ${isActive ? "active" : ""}`}>
      {/* Header con numero pagina e azioni */}
      <div className="page-thumbnail-header">
        <span className="page-thumbnail-number">Pagina {index + 1}</span>
        <div className="page-thumbnail-actions">
          {/* Riordina su */}
          <button
            className="page-thumbnail-btn page-thumbnail-btn-move"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            title="Sposta su"
            aria-label="Sposta pagina su"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3l-5 5h10L8 3z" />
            </svg>
          </button>

          {/* Riordina giù */}
          <button
            className="page-thumbnail-btn page-thumbnail-btn-move"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            title="Sposta giù"
            aria-label="Sposta pagina giù"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 13l5-5H3l5 5z" />
            </svg>
          </button>

          {/* Elimina */}
          <button
            className="page-thumbnail-btn page-thumbnail-btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Elimina pagina"
            aria-label="Elimina pagina"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
              <path
                fillRule="evenodd"
                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview cliccabile */}
      <div
        className="page-thumbnail-preview"
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <PagePreview page={page} background={background} className="thumbnail-preview-content" />
      </div>

      {/* Indicator attivo */}
      {isActive && <div className="page-thumbnail-active-indicator" />}
    </div>
  );
}

PageThumbnail.propTypes = {
  page: PropTypes.shape({
    background_image_id: PropTypes.number,
    text_1: PropTypes.string,
    text_2: PropTypes.string,
    text_3: PropTypes.string,
  }).isRequired,
  background: PropTypes.shape({
    id: PropTypes.number,
    url: PropTypes.string,
    layout_type: PropTypes.string,
    text_fields_count: PropTypes.number,
  }),
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canMoveUp: PropTypes.bool.isRequired,
  canMoveDown: PropTypes.bool.isRequired,
};

export default PageThumbnail;
