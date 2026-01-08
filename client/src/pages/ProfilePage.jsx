import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecapList from "../components/RecapList";
import CreateRecapButton from "../components/CreateRecapButton";
import { useNotification } from "../contexts/NotificationContext";
import { getUserRecaps } from "../services/apiService";

function ProfilePage() {
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
        const errorMsg = err.message || "Errore nel caricamento dei recap";
        showError("Errore", errorMsg);
        setLoading(false);
      });
  }, [showError]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">I tuoi recap</h2>
        <CreateRecapButton onClick={() => navigate("/create")}>+ Crea nuovo riepilogo</CreateRecapButton>
      </div>
      <RecapList recaps={recaps} loading={loading} />
    </div>
  );
}

export default ProfilePage;
