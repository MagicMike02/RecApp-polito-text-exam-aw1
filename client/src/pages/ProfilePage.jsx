import React, { useEffect, useState } from "react";
import RecapList from "../components/RecapList";
import { getUserRecaps } from "../services/apiService";

function ProfilePage() {
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getUserRecaps()
      .then((data) => {
        console.log("Recap personali ricevuti:", data);
        setRecaps(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Errore nel caricamento dei recap");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 style={{ color: "var(--primary-color)", marginBlock: "1.5rem", paddingLeft: "2rem" }}>I tuoi recap</h2>
      <RecapList recaps={recaps} loading={loading} error={error} />
    </div>
  );
}

export default ProfilePage;
