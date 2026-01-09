import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTemplateById, getRecapById, getImagesByTheme, createRecap } from "../services/apiService";
import { useNotification } from "../contexts/NotificationContext";
import PagePreview from "../components/PagePreview";
import BackgroundSelector from "../components/BackgroundSelector";
import PageThumbnail from "../components/PageThumbnail";
import { Spinner } from "react-bootstrap";
import "./RecapEditorPage.css";
import { useTranslation } from "react-i18next";

function RecapEditorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showModal, hideModal, showToast, hideToast, showError, showSuccess, confirmAction } = useNotification();

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
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletePageIndex, setDeletePageIndex] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const initEditor = async () => {
      const templateId = searchParams.get("template");
      const cloneId = searchParams.get("clone");

      try {
        setLoading(true);

        if (templateId) {
          // Carica da template
          const template = await getTemplateById(templateId);
          const bgImages = await getImagesByTheme(template.theme_id);

          setRecapData({
            title: t("ui.editor.new_title", { name: template.name }),
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
            title: t("ui.editor.copy_title", { title: recap.title }),
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
          const errorMsg = t("ui.editor.invalid_params");
          setError(errorMsg);
          showError(t("ui.editor.error_title"), errorMsg);
        }
      } catch (err) {
        const errorMsg = err.message || t("ui.editor.error_loading");
        setError(errorMsg);
        showError(t("ui.editor.error_title"), errorMsg);
      } finally {
        setLoading(false);
      }
    };

    initEditor();
  }, [searchParams, showError, t]);

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
      showToast("error", t("ui.editor.error_title"), t("ui.validation.min_pages"));
      return;
    }

    setDeletePageIndex(index);
    showModal(
      "confirm",
      t("ui.editor.delete_page_title"),
      t("ui.editor.delete_page_confirm", { page: index + 1 }),
      async () => {
        setIsDeleting(true);
        setTimeout(() => {
          const newPages = recapData.pages.filter((_, i) => i !== index);
          setRecapData((prev) => ({ ...prev, pages: newPages }));

          // Aggiusta l'indice corrente se necessario
          if (currentPageIndex >= newPages.length) {
            setCurrentPageIndex(newPages.length - 1);
          } else if (currentPageIndex === index && index > 0) {
            setCurrentPageIndex(index - 1);
          }

          hideModal();
          setIsDeleting(false);
          setDeletePageIndex(null);

          showToast("success", t("ui.editor.done"), t("ui.editor.page_deleted"));
        }, 300);
      }
    );
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
      return t("ui.validation.title_required");
    }
    if (recapData.pages.length < 3) {
      return t("ui.validation.min_pages");
    }

    // Validazione per ogni pagina
    for (let i = 0; i < recapData.pages.length; i++) {
      const page = recapData.pages[i];

      // Controlla che il background sia selezionato
      if (!page.background_image_id) {
        return t("ui.validation.select_background", { page: i + 1 });
      }

      // Controlla che almeno un campo di testo sia compilato
      const hasText = page.text_field_1?.trim() || page.text_field_2?.trim() || page.text_field_3?.trim();

      if (!hasText) {
        return t("ui.validation.text_required", { page: i + 1 });
      }
    }

    return null;
  };

  const handleSave = async () => {
    // Validazioni
    const validationError = validateRecap();
    if (validationError) {
      showToast("error", t("ui.validation.error_title"), validationError);
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

      showSuccess(t("ui.editor.success_title"), t("notifications.recap_created_success"));

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      // Cerca di estrarre messaggio di errore dall'API
      let errorMsg = t("ui.editor.error_saving");

      if (err.response?.data?.errors) {
        // Errori di validazione dal backend
        const errors = err.response.data.errors;
        errorMsg = errors.map((e) => e.msg).join(", ");
      } else if (err.response?.data?.error) {
        errorMsg = t(`api_errors.${err.response.data.error}`);
      } else if (err.message) {
        errorMsg = err.message;
      }

      showError(t("ui.editor.error_title"), errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <Spinner animation="border" role="status" />
        <p>{t("ui.editor.loading")}</p>
      </div>
    );
  }

  if (error && !recapData.theme_id) {
    return (
      <div className="editor-error">
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#e74c3c", marginBottom: "1rem" }}>{t("ui.editor.error_title")}</h2>
          <p style={{ marginBottom: "1.5rem" }}>{error}</p>
          <button className="btn btn-primary-custom" onClick={() => navigate("/create")}>
            {t("ui.editor.back_to_create")}
          </button>
        </div>
      </div>
    );
  }

  const currentPage = recapData.pages[currentPageIndex];
  const currentBackground = backgrounds.find((bg) => bg.id === currentPage?.background_image_id);
  const totalPages = recapData.pages.length;

  return (
    <div className="editor-container">
      {/* SIDEBAR SINISTRA - Lista Pagine */}
      <aside className="editor-sidebar">
        <div className="editor-sidebar-header">
          <h3 className="editor-sidebar-title">{t("ui.editor.page_count", { count: totalPages })}</h3>
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
            {t("ui.editor.add_page")}
          </button>
        </div>
      </aside>

      {/* AREA CENTRALE - Preview */}
      <main className="editor-main">
        <div className="editor-preview-container">
          <PagePreview page={currentPage} background={currentBackground} />
          <div className="editor-preview-info">
            {t("ui.editor.page_status", { current: currentPageIndex + 1, total: totalPages })}
          </div>
        </div>
      </main>

      {/* PANNELLO DESTRO - Controlli */}
      <aside className="editor-controls">
        <div className="editor-controls-header">
          <h2 className="editor-controls-title">{t("ui.editor.edit_title")}</h2>
        </div>

        <div className="editor-controls-content">
          {/* Titolo e Visibilità */}
          <div className="editor-section">
            <div className="form-group">
              <label className="form-label-custom">{t("ui.editor.title_label")}</label>
              <input
                type="text"
                className="form-control"
                value={recapData.title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder={t("ui.editor.title_placeholder")}
              />
            </div>

            <div className="form-group">
              <label className="form-label-custom">{t("ui.editor.visibility_label")}</label>
              <select
                className="form-control"
                value={recapData.visibility}
                onChange={(e) => updateVisibility(e.target.value)}
              >
                <option value="private">{t("ui.editor.private")}</option>
                <option value="public">{t("ui.editor.public")}</option>
              </select>
            </div>
          </div>

          <hr className="editor-divider" />

          {/* Testi Pagina Corrente */}
          <div className="editor-section">
            <h3 className="editor-section-title">{t("ui.editor.page_label", { page: currentPageIndex + 1 })}</h3>

            {currentBackground ? (
              <>
                <div className="form-group">
                  <label className="form-label-custom">{t("ui.editor.text1")}</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={currentPage.text_field_1}
                    onChange={(e) => updatePageText("text_field_1", e.target.value)}
                    placeholder={t("ui.editor.text1_placeholder")}
                  />
                </div>

                {currentBackground.text_fields_count >= 2 && (
                  <div className="form-group">
                    <label className="form-label-custom">{t("ui.editor.text2")}</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={currentPage.text_field_2}
                      onChange={(e) => updatePageText("text_field_2", e.target.value)}
                      placeholder={t("ui.editor.text2_placeholder")}
                    />
                  </div>
                )}

                {currentBackground.text_fields_count >= 3 && (
                  <div className="form-group">
                    <label className="form-label-custom">{t("ui.editor.text3")}</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={currentPage.text_field_3}
                      onChange={(e) => updatePageText("text_field_3", e.target.value)}
                      placeholder={t("ui.editor.text3_placeholder")}
                    />
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)" }}>
                {t("ui.validation.select_background", { page: currentPageIndex + 1 })}
              </div>
            )}
          </div>

          <hr className="editor-divider" />

          {/* Background Selector */}
          <div className="editor-section">
            <h3 className="editor-section-title">{t("ui.editor.choose_background")}</h3>
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
            {saving ? t("ui.editor.saving") : t("ui.editor.save_button")}
          </button>
          <button className="btn btn-outline-nav w-100" onClick={() => navigate(-1)} disabled={saving}>
            {t("ui.actions.cancel")}
          </button>
        </div>
      </aside>
    </div>
  );
}

export default RecapEditorPage;
