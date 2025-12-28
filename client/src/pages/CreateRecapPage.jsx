import { useState, useEffect } from "react";
import { Tabs, Tab, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getThemes, getTemplatesByTheme, getPublicRecaps } from "../services/apiService";
import "./CreateRecapPage.css";

function CreateRecapPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("templates");

  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [templates, setTemplates] = useState([]);

  const [publicRecaps, setPublicRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

		const themesResult = await getThemes();
        setThemes(themesResult);

		if (themesResult.length > 0) {
          setSelectedTheme(themesResult[0].id);
        }

		const recapsResult = await getPublicRecaps();
        setPublicRecaps(recapsResult);
      } catch (err) {
        setError(err.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!selectedTheme) return;
      try {
        const result = await getTemplatesByTheme(selectedTheme);
        setTemplates(result);
      } catch (err) {
        setError(err.message || "Error loading templates");
      }
    };
    fetchTemplates();
  }, [selectedTheme]);

  const handleCreateFromTemplate = (templateId) => {
    navigate(`/editor/new?template=${templateId}`);
  };

  const handleCreateFromRecap = (recapId) => {
    navigate(`/editor/new?clone=${recapId}`);
  };

  if (loading) {
    return (
      <div className="create-recap-container" style={{ textAlign: "center" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading options...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-recap-container">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="create-recap-container">
      <div className="create-recap-header">
        <h1 className="create-recap-title">Crea un nuovo riepilogo</h1>
        <button className="create-recap-cancel" onClick={() => navigate("/profile")}>
          Annulla
        </button>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="create-recap-tabs mb-4">
        <Tab eventKey="templates" title="Da Template">
          <div className="create-recap-section">
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Scegli un tema:</h2>
            <div className="theme-btns">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-btn${selectedTheme === theme.id ? " selected" : ""}`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            {templates.length === 0 ? (
              <Alert variant="info">Nessun template disponibile per questo tema.</Alert>
            ) : (
              <div className="template-list">
                {templates.map((template) => (
                  <div key={template.id} className="template-card">
                    <div className="template-title">{template.name}</div>
                    <div className="template-desc">{template.description}</div>
                    <div className="template-badges">
                      <span className="template-badge">
                        {themes.find((t) => t.id === template.theme_id)?.name}
                      </span>
                      <span className="template-pages">{template.pages_count || 3} pagine</span>
                    </div>
                    <button className="template-btn" onClick={() => handleCreateFromTemplate(template.id)}>
                      Usa questo template
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tab>

        <Tab eventKey="recaps" title="Da Recap Pubblico">
          <div className="create-recap-section">
            <Alert variant="info">
              Crea un nuovo recap ispirato a un recap pubblico. La tua versione terrà traccia dell'originale.
            </Alert>
            {publicRecaps.length === 0 ? (
              <Alert variant="warning">Nessun recap pubblico disponibile.</Alert>
            ) : (
              <div className="recap-list">
                {publicRecaps.map((recap) => (
                  <div key={recap.id} className="recap-card">
                    <div className="recap-title">{recap.title}</div>
                    <div className="recap-meta">
                      <span style={{ color: "var(--primary-color)", fontWeight: 600 }}>{recap.theme_name}</span>
                      {" | "}
                      <span>
                        by <strong>{recap.author_name}</strong>
                      </span>
                      {" | "}
                      <span>{recap.pages_count} pagine</span>
                    </div>
                    <div className="recap-btns">
                      <button className="recap-btn" onClick={() => navigate(`/recaps/${recap.id}`)}>
                        Anteprima
                      </button>
                      <button className="recap-btn" onClick={() => handleCreateFromRecap(recap.id)}>
                        Usa come template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default CreateRecapPage;
