import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecapList from "../components/RecapList";
import CreateRecapButton from "../components/CreateRecapButton";
import { getUserRecaps } from "../services/apiService";

function ProfilePage() {
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getUserRecaps()
      .then((data) => {
        console.log("Recap personali ricevuti:", data);
        setError("");
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
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2rem 2rem 0 2rem" }}
      >
        <h2 style={{ color: "var(--primary-color)", margin: 0 }}>I tuoi recap</h2>
        <CreateRecapButton onClick={() => navigate("/create")}>+ Crea nuovo riepilogo</CreateRecapButton>
      </div>
      <RecapList recaps={recaps} loading={loading} error={error} />
    </div>
  );
}

export default ProfilePage;
