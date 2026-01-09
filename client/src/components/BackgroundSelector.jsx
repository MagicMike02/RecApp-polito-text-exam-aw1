import PropTypes from "prop-types";
import "./BackgroundSelector.css";
import { FALLBACK_IMAGE_URL } from "../constants";
import { useTranslation } from "react-i18next";

function BackgroundSelector({ backgrounds, selectedId, onSelect }) {
  const { t } = useTranslation();
  if (!backgrounds || backgrounds.length === 0) {
    return (
      <div className="background-selector-empty">
        <p className="background-selector-empty-text">{t("ui.background_selector.empty")}</p>
      </div>
    );
  }

  return (
    <div className="background-selector">
      <div className="background-selector-grid">
        {backgrounds.map((bg) => {
          const isSelected = bg.id === selectedId;
          const imageUrl = bg.url || FALLBACK_IMAGE_URL;

          return (
            <div
              key={bg.id}
              className={`background-selector-item ${isSelected ? "selected" : ""}`}
              onClick={() => onSelect(bg.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(bg.id);
                }
              }}
            >
              {/* Thumbnail image */}
              <div className="background-selector-thumbnail" style={{ backgroundImage: `url(${imageUrl})` }}>
                {/* Badge con numero di campi testo */}
                {bg.text_fields_count && (
                  <span className="background-selector-badge">
                    {t("ui.background_selector.text_fields_count", { count: bg.text_fields_count })}
                  </span>
                )}
              </div>

              {/* Checkmark per il selezionato */}
              {isSelected && (
                <div className="background-selector-check">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="var(--primary-color)" />
                    <path
                      d="M7 12L10.5 15.5L17 9"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

BackgroundSelector.propTypes = {
  backgrounds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      url: PropTypes.string,
      text_fields_count: PropTypes.number,
      layout_type: PropTypes.string,
    })
  ).isRequired,
  selectedId: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
};

export default BackgroundSelector;
