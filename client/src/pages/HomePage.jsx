import React, { useEffect, useState } from "react";
import RecapList from "../components/RecapList";
import { useNotification } from "../contexts/NotificationContext";
import { getPublicRecaps } from "../services/apiService";

function HomePage() {
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
        const errorMsg = err.message || "Errore nel caricamento dei riepiloghi pubblici.";
        showError("Errore", errorMsg);
        setLoading(false);
      });
  }, [showError]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Lasciati ispirare dagli altri!</h2>
      </div>
      <RecapList recaps={recaps} loading={loading} />
    </div>
  );
}

export default HomePage;
