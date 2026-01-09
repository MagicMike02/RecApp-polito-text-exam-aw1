import PropTypes from "prop-types";
import "./RecapList.css";
import RecapCard from "./RecapCard";
import { useTranslation } from "react-i18next";

function RecapList({ recaps, loading }) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="recap-list-center">
        <div className="recap-list-spinner" />
      </div>
    );
  }
  if (!recaps || recaps.length === 0) {
    return (
      <div className="recap-list-center">
        <span className="recap-list-empty">{t("ui.recap_list.empty")}</span>
      </div>
    );
  }
  return (
    <div className="recap-list-grid">
      {recaps.map((recap) => (
        <RecapCard key={recap.id} recap={recap} />
      ))}
    </div>
  );
}

RecapList.propTypes = {
  recaps: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default RecapList;
