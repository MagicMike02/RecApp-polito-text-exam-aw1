
import PropTypes from "prop-types";
import "./PagePreview.css";
import { FALLBACK_IMAGE } from "../utils/constants";

/**
 * PagePreview - Componente per visualizzare una pagina con background e testi sovrapposti
 *
 * Gestisce il posizionamento dinamico dei testi in base al layout_type del background:
 * - CENTER: Testo centrato
 * - TOP_DOWN: Testi dall'alto verso il basso
 * - LEFT_RIGHT: Testi distribuiti orizzontalmente
 * - BOTTOM_UP: Testi dal basso verso l'alto
 */
function PagePreview({ page, background, className = "" }) {
  if (!page || !background) {
    return (
      <div className={`page-preview page-preview-empty ${className}`}>
        <p className="page-preview-placeholder">Seleziona un background per visualizzare la pagina</p>
      </div>
    );
  }

  const backgroundUrl = background.url || FALLBACK_IMAGE;
  const layoutType = (background.layout_type || "CENTER").toUpperCase();

  // Filtra solo i testi non vuoti
  const texts = [page.text_1, page.text_2, page.text_3].filter((text) => text && text.trim());

  return (
    <div className={`page-preview ${className}`}>
      {/* Background image */}
      <div className="page-preview-background" style={{ backgroundImage: `url(${backgroundUrl})` }} />

      {/* Text overlay container con layout dinamico */}
      <div className={`page-preview-overlay layout-${layoutType.toLowerCase()}`}>
        {texts.map((text, index) => (
          <div key={index} className={`text-slot text-slot-${index + 1}`}>
            <p className="text-content">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

PagePreview.propTypes = {
  page: PropTypes.shape({
    text_1: PropTypes.string,
    text_2: PropTypes.string,
    text_3: PropTypes.string,
  }),
  background: PropTypes.shape({
    url: PropTypes.string,
    layout_type: PropTypes.string,
    text_fields_count: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default PagePreview;
