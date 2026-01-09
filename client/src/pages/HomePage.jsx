import React, { useEffect, useState } from "react";
import RecapList from "../components/RecapList";
import { useNotification } from "../contexts/NotificationContext";
import { getPublicRecaps } from "../services/apiService";
import { useTranslation } from "react-i18next";

function HomePage() {
  const { t } = useTranslation();
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    setLoading(true);
    getPublicRecaps()
      .then((data) => {
        setRecaps(data);
        setLoading(false);
      })
      .catch((err) => {
        const errorMsg = err.message || t("ui.home.error_loading");
        showError(t("ui.home.error_title"), errorMsg);
        setLoading(false);
      });
  }, [showError, t]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">{t("ui.home.title")}</h2>
      </div>
      <RecapList recaps={recaps} loading={loading} />
    </div>
  );
}

export default HomePage;
