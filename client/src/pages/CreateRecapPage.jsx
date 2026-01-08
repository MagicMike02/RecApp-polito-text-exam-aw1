import { useState, useEffect } from "react";
import { Tabs, Tab, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  getThemes,
  getTemplatesByTheme,
  getPublicRecaps,
  getImagesByTheme,
  getTemplateById,
} from "../services/apiService";
import { useNotification } from "../contexts/NotificationContext";
import RecapGalleryCard from "../components/RecapGalleryCard";
import "./CreateRecapPage.css";

function CreateRecapPage() {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [activeTab, setActiveTab] = useState("templates");

  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [themeBackgrounds, setThemeBackgrounds] = useState([]);

  const [publicRecaps, setPublicRecaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const themesResult = await getThemes();
        setThemes(themesResult);

        if (themesResult.length > 0) {
          setSelectedTheme(themesResult[0].id);
        }

        const recapsResult = await getPublicRecaps();
        setPublicRecaps(recapsResult);
      } catch (err) {
        const errorMsg = err.message || "Error loading data";
        showError("Errore", errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showError]);

  useEffect(() => {
    const fetchTemplatesAndBackgrounds = async () => {
      if (!selectedTheme) return;
      try {
        // Prendi solo i metadati dei template
        const [templatesMeta, themeBackgroundsResult] = await Promise.all([
          getTemplatesByTheme(selectedTheme),
          getImagesByTheme(selectedTheme),
        ]);
        // Prendi i dettagli di ogni template (con pages)
        const templatesFull = await Promise.all(templatesMeta.map((t) => getTemplateById(t.id)));
        setTemplates(templatesFull);
        setThemeBackgrounds(themeBackgroundsResult);
      } catch (err) {
        const errorMsg = err.message || "Error loading templates or backgrounds";
        showError("Errore", errorMsg);
      }
    };
    fetchTemplatesAndBackgrounds();
  }, [selectedTheme, showError]);

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
            {/* TITOLO */}
            <h2 className="crp-theme-title">Scegli un tema:</h2>

            {/* BOTTONI SELEZIONE TEMA */}
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

            {/* LISTA TEMPLATE */}
            {templates.length === 0 ? (
              <Alert variant="info">Nessun template disponibile per questo tema.</Alert>
            ) : (
              <div className="crp-list">
                {templates.map((template) => {
                  if (!Array.isArray(template.pages)) return null;
                  const pages = template.pages.map((page) => {
                    const bg = themeBackgrounds.find((bg) => bg.id === page.background_image_id);
                    return { background_url: bg ? bg.url : "" };
                  });
                  const fakeRecapFromTemplate = {
                    id: template.id,
                    title: template.name,
                    author_name: "Template",
                    theme_name: themes.find((t) => t.id === template.theme_id)?.name,
                    visibility: "public",
                    pages,
                    description: template.description,
                    onUse: () => handleCreateFromTemplate(template.id),
                  };
                  return <RecapGalleryCard key={template.id} recap={fakeRecapFromTemplate} showDesc showUseBtn />;
                })}
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
                  <RecapGalleryCard
                    key={recap.id}
                    recap={{
                      ...recap,
                      onPreview: () => navigate(`/recaps/${recap.id}`),
                      onUse: () => handleCreateFromRecap(recap.id),
                    }}
                    showUseBtn
                    showPreviewBtn
                  />
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
