import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecapList from "../components/RecapList";
import CreateRecapButton from "../components/CreateRecapButton";
import { useNotification } from "../contexts/NotificationContext";
import { getUserRecaps } from "../services/apiService";
import { useTranslation } from "react-i18next";

function ProfilePage() {
  const { t } = useTranslation();
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showError } = useNotification();

  useEffect(() => {
    setLoading(true);
    getUserRecaps()
      .then((data) => {
        setRecaps(data);
        setLoading(false);
      })
      .catch((err) => {
        const errorMsg = err.message || t("ui.profile.error_loading");
        showError(t("ui.profile.error_title"), errorMsg);
        setLoading(false);
      });
  }, [showError, t]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">{t("ui.profile.title")}</h2>
        <CreateRecapButton onClick={() => navigate("/create")}>
          {t("ui.profile.create_button")}
        </CreateRecapButton>
      </div>
      <RecapList recaps={recaps} loading={loading} />
    </div>
  );
}

export default ProfilePage;
