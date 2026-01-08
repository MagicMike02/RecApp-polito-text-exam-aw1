import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTemplateById, getRecapById, getImagesByTheme, createRecap } from "../services/apiService";
import PagePreview from "../components/PagePreview";
import BackgroundSelector from "../components/BackgroundSelector";
import PageThumbnail from "../components/PageThumbnail";
import ResultModal from "../components/ResultModal";
import Toast from "../components/Toast";
import { Spinner } from "react-bootstrap";
import "./RecapEditorPage.css";

function RecapEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [recapData, setRecapData] = useState({
    title: "",
    visibility: "private",
    theme_id: null,
    derived_from_recap_id: null,
    pages: [],
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deletePageIndex, setDeletePageIndex] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modale
  const [modal, setModal] = useState({
    show: false,
    type: null,
    title: null,
    message: null,
  });

  // Toast
  const [toast, setToast] = useState({
    show: false,
    type: null,
    title: null,
    message: null,
  });

  const showModal = (type, title, message) => {
    setModal({ show: true, type, title, message });
  };

  const hideModal = () => {
    setModal({ show: false, type: null, title: null, message: null });
  };

  const showToast = (type, title, message) => {
    setToast({ show: true, type, title, message });
  };

  const hideToast = () => {
    setToast({ show: false, type: null, title: null, message: null });
  };

  useEffect(() => {
    const initEditor = async () => {
      const templateId = searchParams.get("template");
      const cloneId = searchParams.get("clone");

      try {
        setLoading(true);
        setError(null);

        if (templateId) {
          // Carica da template
          const template = await getTemplateById(templateId);
          const bgImages = await getImagesByTheme(template.theme_id);

          setRecapData({
            title: `Nuovo ${template.name}`,
            visibility: "private",
            theme_id: template.theme_id,
            derived_from_recap_id: null,
            pages: template.pages.map((p, index) => ({
              page_number: index + 1,
              background_image_id: p.background_image_id,
              text_field_1: "",
              text_field_2: "",
              text_field_3: "",
            })),
          });
          setBackgrounds(bgImages);
        } else if (cloneId) {
          // Carica da recap esistente (clone)
          const recap = await getRecapById(cloneId);
          const bgImages = await getImagesByTheme(recap.theme_id);

          setRecapData({
            title: `Copia di ${recap.title}`,
            visibility: "private",
            theme_id: recap.theme_id,
            derived_from_recap_id: recap.id,
            pages: recap.pages.map((p, index) => ({
              page_number: index + 1,
              background_image_id: p.background_image_id,
              text_field_1: p.text_field_1 || "",
              text_field_2: p.text_field_2 || "",
              text_field_3: p.text_field_3 || "",
            })),
          });
          setBackgrounds(bgImages);
        } else {
          setError("Parametri non validi. Usa ?template=ID o ?clone=ID");
        }
      } catch (err) {
        setError(err.message || "Errore durante il caricamento");
      } finally {
        setLoading(false);
      }
    };

    initEditor();
  }, [searchParams]);

  const updateTitle = (value) => {
    setRecapData((prev) => ({ ...prev, title: value }));
  };

  const updateVisibility = (value) => {
    setRecapData((prev) => ({ ...prev, visibility: value }));
  };

  const updatePageText = (field, value) => {
    setRecapData((prev) => ({
      ...prev,
      pages: prev.pages.map((page, i) => (i === currentPageIndex ? { ...page, [field]: value } : page)),
    }));
  };

  const selectBackground = (bgId) => {
    setRecapData((prev) => ({
      ...prev,
      pages: prev.pages.map((page, i) => (i === currentPageIndex ? { ...page, background_image_id: bgId } : page)),
    }));
  };

  const addPage = () => {
    setRecapData((prev) => ({
      ...prev,
      pages: [
        ...prev.pages,
        {
          page_number: prev.pages.length + 1,
          background_image_id: null,
          text_field_1: "",
          text_field_2: "",
          text_field_3: "",
        },
      ],
    }));
    // Seleziona automaticamente la nuova pagina
    setCurrentPageIndex(recapData.pages.length);
  };

  const deletePage = (index) => {
    if (recapData.pages.length <= 3) {
      showToast("error", "Errore", "Servono almeno 3 pagine per creare un riepilogo!");
      return;
    }

    setDeletePageIndex(index);
    showModal(
      "confirm",
      "Elimina Pagina?",
      `Sei sicuro di voler eliminare la pagina ${index + 1}? Questa azione non può essere annullata.`
    );
  };

  const confirmDeletePage = () => {
    if (deletePageIndex === null) return;

    setIsDeleting(true);
    setTimeout(() => {
      const newPages = recapData.pages.filter((_, i) => i !== deletePageIndex);
      setRecapData((prev) => ({ ...prev, pages: newPages }));

      // Aggiusta l'indice corrente se necessario
      if (currentPageIndex >= newPages.length) {
        setCurrentPageIndex(newPages.length - 1);
      } else if (currentPageIndex === deletePageIndex && deletePageIndex > 0) {
        setCurrentPageIndex(deletePageIndex - 1);
      }

      hideModal();
      setIsDeleting(false);
      setDeletePageIndex(null);

      showToast("success", "Fatto", "Pagina eliminata con successo");
    }, 300);
  };

  const movePage = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= recapData.pages.length) return;

    const newPages = [...recapData.pages];
    [newPages[fromIndex], newPages[toIndex]] = [newPages[toIndex], newPages[fromIndex]];
    setRecapData((prev) => ({ ...prev, pages: newPages }));

    // Aggiorna l'indice corrente se la pagina selezionata è stata mossa
    if (currentPageIndex === fromIndex) {
      setCurrentPageIndex(toIndex);
    } else if (currentPageIndex === toIndex) {
      setCurrentPageIndex(fromIndex);
    }
  };

  const validateRecap = () => {
    if (!recapData.title.trim()) {
      return "Inserisci un titolo per il riepilogo";
    }
    if (recapData.pages.length < 3) {
      return "Servono almeno 3 pagine";
    }

    // Validazione per ogni pagina
    for (let i = 0; i < recapData.pages.length; i++) {
      const page = recapData.pages[i];

      // Controlla che il background sia selezionato
      if (!page.background_image_id) {
        return `Pagina ${i + 1}: devi selezionare un background`;
      }

      // Controlla che almeno un campo di testo sia compilato
      const hasText = page.text_field_1?.trim() || page.text_field_2?.trim() || page.text_field_3?.trim();

      if (!hasText) {
        return `Pagina ${i + 1}: devi inserire almeno un testo`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    // Validazioni
    const validationError = validateRecap();
    if (validationError) {
      showToast("error", "Errore di validazione", validationError);
      return;
    }

    try {
      setSaving(true);

      // Prepara i dati per l'API
      const payload = {
        ...recapData,
        derived_from_recap_id: recapData.derived_from_recap_id || undefined,
      };

      await createRecap(payload);

      showModal("success", "Successo!", "Recap creato con successo!");

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      // Cerca di estrarre messaggio di errore dall'API
      let errorMsg = "Errore durante il salvataggio";

      if (err.response?.data?.errors) {
        // Errori di validazione dal backend
        const errors = err.response.data.errors;
        errorMsg = errors.map((e) => e.msg).join(", ");
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }

      showModal("error", "Errore", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <Spinner animation="border" role="status" />
        <p>Caricamento editor...</p>
      </div>
    );
  }

  if (error && !recapData.theme_id) {
    return (
      <div className="editor-error">
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#e74c3c", marginBottom: "1rem" }}>Errore</h2>
          <p style={{ marginBottom: "1.5rem" }}>{error}</p>
          <button className="btn btn-primary-custom" onClick={() => navigate("/create")}>
            Torna alla creazione
          </button>
        </div>
      </div>
    );
  }

  const currentPage = recapData.pages[currentPageIndex];
  const currentBackground = backgrounds.find((bg) => bg.id === currentPage?.background_image_id);

  return (
    <div className="editor-container">
      {/* SIDEBAR SINISTRA - Lista Pagine */}
      <aside className="editor-sidebar">
        <div className="editor-sidebar-header">
          <h3 className="editor-sidebar-title">Pagine ({recapData.pages.length})</h3>
        </div>

        <div className="editor-sidebar-content">
          {recapData.pages.map((page, index) => (
            <PageThumbnail
              key={index}
              page={page}
              background={backgrounds.find((bg) => bg.id === page.background_image_id)}
              index={index}
              isActive={index === currentPageIndex}
              onSelect={() => setCurrentPageIndex(index)}
              onMoveUp={() => movePage(index, -1)}
              onMoveDown={() => movePage(index, 1)}
              onDelete={() => deletePage(index)}
              canMoveUp={index > 0}
              canMoveDown={index < recapData.pages.length - 1}
            />
          ))}
        </div>

        <div className="editor-sidebar-footer">
          <button className="btn-add-page" onClick={addPage}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Aggiungi Pagina
          </button>
        </div>
      </aside>

      {/* AREA CENTRALE - Preview */}
      <main className="editor-main">
        <div className="editor-preview-container">
          <PagePreview page={currentPage} background={currentBackground} />
          <div className="editor-preview-info">
            Pagina {currentPageIndex + 1} di {recapData.pages.length}
          </div>
        </div>
      </main>

      {/* PANNELLO DESTRO - Controlli */}
      <aside className="editor-controls">
        <div className="editor-controls-header">
          <h2 className="editor-controls-title">Modifica Riepilogo</h2>
        </div>

        <div className="editor-controls-content">
          {/* Titolo e Visibilità */}
          <div className="editor-section">
            <div className="form-group">
              <label className="form-label-custom">Titolo</label>
              <input
                type="text"
                className="form-control"
                value={recapData.title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="Inserisci un titolo..."
              />
            </div>

            <div className="form-group">
              <label className="form-label-custom">Visibilità</label>
              <select
                className="form-control"
                value={recapData.visibility}
                onChange={(e) => updateVisibility(e.target.value)}
              >
                <option value="private">Privato</option>
                <option value="public">Pubblico</option>
              </select>
            </div>
          </div>

          <hr className="editor-divider" />

          {/* Testi Pagina Corrente */}
          <div className="editor-section">
            <h3 className="editor-section-title">Pagina {currentPageIndex + 1}</h3>

            {currentBackground ? (
              <>
                <div className="form-group">
                  <label className="form-label-custom">Testo 1</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={currentPage.text_field_1}
                    onChange={(e) => updatePageText("text_field_1", e.target.value)}
                    placeholder="Inserisci il primo testo..."
                  />
                </div>

                {currentBackground.text_fields_count >= 2 && (
                  <div className="form-group">
                    <label className="form-label-custom">Testo 2</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={currentPage.text_field_2}
                      onChange={(e) => updatePageText("text_field_2", e.target.value)}
                      placeholder="Inserisci il secondo testo..."
                    />
                  </div>
                )}

                {currentBackground.text_fields_count >= 3 && (
                  <div className="form-group">
                    <label className="form-label-custom">Testo 3</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={currentPage.text_field_3}
                      onChange={(e) => updatePageText("text_field_3", e.target.value)}
                      placeholder="Inserisci il terzo testo..."
                    />
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)" }}>
                Seleziona un background per aggiungere testi
              </div>
            )}
          </div>

          <hr className="editor-divider" />

          {/* Background Selector */}
          <div className="editor-section">
            <h3 className="editor-section-title">Scegli Background</h3>
            <BackgroundSelector
              backgrounds={backgrounds}
              selectedId={currentPage?.background_image_id}
              onSelect={selectBackground}
            />
          </div>
        </div>

        {/* Azioni */}
        <div className="editor-controls-footer">
          <button
            className="btn btn-primary-custom w-100 mb-2"
            onClick={handleSave}
            disabled={saving || recapData.pages.length < 3}
          >
            {saving ? "Salvataggio..." : "Salva Riepilogo"}
          </button>
          <button className="btn btn-outline-nav w-100" onClick={() => navigate(-1)} disabled={saving}>
            Annulla
          </button>
        </div>
      </aside>

      {/* Result Modal */}
      <ResultModal
        show={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={hideModal}
        onConfirm={confirmDeletePage}
        confirmText="Elimina"
        cancelText="Annulla"
        isLoading={isDeleting}
      />

      {/* Toast */}
      <Toast show={toast.show} type={toast.type} title={toast.title} message={toast.message} onClose={hideToast} />
    </div>
  );
}

export default RecapEditorPage;
