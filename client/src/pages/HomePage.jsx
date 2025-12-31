import React, { useEffect, useState } from "react";
import RecapList from "../components/RecapList";
import { getPublicRecaps } from "../services/apiService";

function HomePage() {
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getPublicRecaps()
      .then((data) => {
        setError("");
        setRecaps(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Errore nel caricamento dei riepiloghi pubblici.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Lasciati ispirare dagli altri!</h2>
      </div>
      <RecapList recaps={recaps} loading={loading} error={error} />
    </div>
  );
}

export default HomePage;
