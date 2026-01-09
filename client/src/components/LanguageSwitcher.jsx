import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const isEn = i18n.language?.startsWith("en");

  const toggleLanguage = () => {
    i18n.changeLanguage(isEn ? "it" : "en");
  };

  return (
    <button
      className="lang-switch-btn"
      onClick={toggleLanguage}
      type="button"
      title={isEn ? t("ui.langswitch.to_en") : t("ui.langswitch.to_it")}
    >
      <div className={`lang-pill ${isEn ? "en-active" : "it-active"}`}>
        <span className="lang-label">IT</span>
        <div className="lang-slider">{isEn ? "🇬🇧" : "🇮🇹"}</div>
        <span className="lang-label">EN</span>
      </div>
    </button>
  );
}

export default LanguageSwitcher;
