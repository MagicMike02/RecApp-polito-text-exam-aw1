import PropTypes from "prop-types";
import "./PagePreview.css";
import { FALLBACK_IMAGE_URL } from "../constants";

function PagePreview({ page, background, className = "" }) {
  const backgroundUrl = background?.url || FALLBACK_IMAGE_URL;
  const textPositions = background?.text_positions?.fields || [];
  const isEmpty = !page || !background;

  // Filtra solo i testi non vuoti e li associa alle posizioni
  const texts = isEmpty
    ? []
    : [page.text_field_1, page.text_field_2, page.text_field_3]
        .map((text, index) => ({
          text: text?.trim() || "",
          position: textPositions[index] || null,
        }))
        .filter((item) => item.text && item.position);

  return (
    <div className={`page-preview ${className}`}>
      {/* Background image */}
      <div
        className="page-preview-background"
        style={{
          backgroundImage: isEmpty ? `url(${FALLBACK_IMAGE_URL})` : `url(${backgroundUrl})`,
          opacity: isEmpty ? 0.3 : 1,
        }}
      />

      {/* Text overlay con posizionamento assoluto basato su coordinate DB */}
      <div className="page-preview-overlay">
        {isEmpty ? (
          <p className="page-preview-placeholder">Seleziona un background per visualizzare la pagina</p>
        ) : (
          texts.map((item, index) => {
            const { x, y, w, h } = item.position;
            const style = {
              position: "absolute",
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: `${w * 100}%`,
              height: `${h * 100}%`,
            };

            return (
              <div key={index} className="text-slot" style={style}>
                <p className="text-content">{item.text}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

PagePreview.propTypes = {
  page: PropTypes.shape({
    text_field_1: PropTypes.string,
    text_field_2: PropTypes.string,
    text_field_3: PropTypes.string,
  }),
  background: PropTypes.shape({
    url: PropTypes.string,
    text_positions: PropTypes.shape({
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          x: PropTypes.number.isRequired,
          y: PropTypes.number.isRequired,
          w: PropTypes.number.isRequired,
          h: PropTypes.number.isRequired,
        })
      ),
    }),
    text_fields_count: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default PagePreview;
