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
        console.log(themesResult);

        if (themesResult.length > 0) {
          setSelectedTheme(themesResult[0].id);
        }

        const recapsResult = await getPublicRecaps();
        setPublicRecaps(recapsResult);
        console.log(recapsResult);
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
      <div className="crp-create-recap-container crp-center-text">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading options...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crp-create-recap-container">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="crp-create-recap-container">
      <div className="crp-create-recap-header">
        <h1 className="crp-create-recap-title">Crea un nuovo riepilogo</h1>
        <button className="crp-create-recap-cancel" onClick={() => navigate("/profile")}>
          Annulla
        </button>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="crp-create-recap-tabs mb-4">
        <Tab eventKey="templates" title="Da Template">
          <div className="crp-create-recap-section">
            <h2 className="crp-theme-title">Scegli un tema:</h2>
            <div className="crp-theme-btns">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  className={`crp-theme-btn${selectedTheme === theme.id ? " selected" : ""}`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  {theme.name}
                </button>
              ))}
            </div>

            {templates.length === 0 ? (
              <Alert variant="info">Nessun template disponibile per questo tema.</Alert>
            ) : (
              <div className="crp-list">
                {templates.map((template) => (
                  <div key={template.id} className="crp-card">
                    <div className="crp-title">{template.name}</div>
                    <div className="crp-desc">{template.description}</div>
                    <div className="crp-badges">
                      <span className="crp-badge">{themes.find((t) => t.id === template.theme_id)?.name}</span>
                      <span className="crp-pages">{template.pages_count || 3} pagine</span>
                    </div>
                    <div className="crp-btn-row">
                      <button className="crp-btn" onClick={() => handleCreateFromTemplate(template.id)}>
                        Usa template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tab>

        <Tab eventKey="recaps" title="Da Recap Pubblico">
          <div className="crp-create-recap-section">
            <Alert variant="info">
              Crea un nuovo recap ispirato a un recap pubblico. La tua versione terrà traccia dell'originale.
            </Alert>
            {publicRecaps.length === 0 ? (
              <Alert variant="warning">Nessun recap pubblico disponibile.</Alert>
            ) : (
              <div className="crp-list">
                {publicRecaps.map((recap) => (
                  <div key={recap.id} className="crp-card">
                    {recap.pages && recap.pages[0] && recap.pages[0].background_url && (
                      <img
                        src={recap.pages[0].background_url}
                        alt={recap.title + " cover"}
                        className="crp-preview-img"
                      />
                    )}
                    <div className="crp-title">{recap.title}</div>
                    <div className="crp-badges">
                      <span className="crp-badge">{recap.theme_name}</span>
                      <span className="crp-pages">
                        {recap.pages_count || (recap.pages ? recap.pages.length : 0)} pagine
                      </span>

                      <br />

                      <span className="crp-author-badge">
                        by <strong>{recap.author_name}</strong>
                      </span>
                    </div>
                    <div className="crp-btn-row">
                      <button className="crp-btn" onClick={() => navigate(`/recaps/${recap.id}`)}>
                        Anteprima
                      </button>
                      <button className="crp-btn" onClick={() => handleCreateFromRecap(recap.id)}>
                        Usa template
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
