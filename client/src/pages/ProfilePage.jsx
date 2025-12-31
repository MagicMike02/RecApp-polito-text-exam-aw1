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
      <div className="page-header">
        <h2 className="page-title">I tuoi recap</h2>
        <CreateRecapButton onClick={() => navigate("/create")}>+ Crea nuovo riepilogo</CreateRecapButton>
      </div>
      <RecapList recaps={recaps} loading={loading} error={error} />
    </div>
  );
}

export default ProfilePage;
