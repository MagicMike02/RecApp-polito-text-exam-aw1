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
      <h2 style={{ color: "var(--primary-color)", marginBlock: "1.5rem", paddingLeft: "2rem" }}>
        Lasciati ispirare dagli altri!
      </h2>
      <RecapList recaps={recaps} loading={loading} error={error} />
    </div>
  );
}

export default HomePage;
