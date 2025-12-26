import React, { useEffect, useState } from "react";
import RecapList from "../components/RecapList";
import { getPublicRecaps } from "../services/apiService";

function HomePage() {
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublicRecaps()
      .then((data) => {
        if (active) {
          setError("");
          setRecaps(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Errore nel caricamento dei riepiloghi pubblici.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1 style={{ color: "var(--primary-color)", marginBlock: "1.5rem", paddingLeft: "2rem" }}>Lasciati ispirare dagli altri!</h1>
      <RecapList recaps={recaps} loading={loading} error={error} />
    </div>
  );
}

export default HomePage;
