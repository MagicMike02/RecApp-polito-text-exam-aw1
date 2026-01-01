# AI DEVELOPMENT GUIDE: "Il mio anno in..." - Feature Mancanti

## 🎯 RUOLO & APPROCCIO

Sei un **Senior React Developer** esperto in UI/UX e best practices di sviluppo web moderno.
Il tuo compito è **completare le feature mancanti** del frontend React, mantenendo:

- **Coerenza stilistica** assoluta con il design esistente
- **Best practices React** (hooks, context, componenti controllati)
- **User experience fluida** e intuitiva
- **Codice pulito**, manutenibile e ben documentato

## 📋 STATO ATTUALE DEL PROGETTO

### ✅ IMPLEMENTATO (NON MODIFICARE)

#### Backend (Server)

- **API completamente funzionanti** per:
  - Autenticazione (login/logout/sessione)
  - Temi e template
  - Immagini di background
  - Riepiloghi (CRUD completo)
- Database SQLite con tutte le tabelle necessarie
- Validatori e middleware di autenticazione

#### Frontend - Componenti Esistenti

- ✅ **Navbar.jsx**: Navigazione con link attivi e responsive
- ✅ **AuthContext.jsx**: Gestione globale dello stato di autenticazione
- ✅ **ProtectedRoute.jsx**: Protezione delle rotte autenticate
- ✅ **LoginPage.jsx**: Form di login completo e funzionante
- ✅ **HomePage.jsx**: Lista riepiloghi pubblici con filtri
- ✅ **ProfilePage.jsx**: Lista riepiloghi dell'utente
- ✅ **RecapViewPage.jsx**: Viewer slideshow con navigazione pagine
- ✅ **CreateRecapPage.jsx**: Scelta tema/template o clonazione recap
- ✅ **RecapCard.jsx**: Card per visualizzare riepiloghi
- ✅ **RecapGalleryCard.jsx**: Card con gallery immagini
- ✅ **RecapList.jsx**: Lista di card riepiloghi
- ✅ **apiService.js**: Tutte le chiamate API già implementate

### ❌ MANCANTE - DA IMPLEMENTARE

#### 1. **RecapEditorPage.jsx** (PRIORITÀ MASSIMA)

**File**: `client/src/pages/RecapEditorPage.jsx`
**Stato attuale**: Stub placeholder con solo titolo

**Cosa implementare**:

- **Editor completo** per creare/modificare riepiloghi
- **3 aree principali**:

  1. **Sidebar sinistra**: Lista pagine con thumbnails

     - Mostrare preview di ogni pagina
     - Pulsanti riordina (su/giù)
     - Pulsante elimina pagina
     - Pulsante aggiungi nuova pagina
     - Indicatore pagina corrente selezionata

  2. **Area centrale**: Preview live della pagina corrente

     - Mostrare background selezionato
     - Overlay con i testi posizionati secondo il `layout_type`
     - Preview esattamente come apparirà nel viewer

  3. **Pannello destro**: Controlli di editing
     - Input per titolo riepilogo (in alto)
     - Selector visibilità (pubblico/privato)
     - Input per testi della pagina (text_1, text_2, text_3)
       - Numero di campi basato su `slots_count` del background
     - Grid di selezione background (solo del tema scelto)
       - Mostrare thumbnails cliccabili
       - Indicare il background corrente selezionato
     - Pulsanti azione:
       - "Salva Riepilogo" (disabilitato se pagine < 3)
       - "Annulla" (torna alla pagina precedente)

**Logica di stato**:

```javascript
const [recapData, setRecapData] = useState({
  title: "",
  visibility: "private",
  theme_id: null,
  pages: [{ background_image_id: null, text_1: "", text_2: "", text_3: "" }],
});
const [currentPageIndex, setCurrentPageIndex] = useState(0);
const [availableBackgrounds, setAvailableBackgrounds] = useState([]);
```

**Scenari di inizializzazione** (da query params):

- `?template=123`: Carica template e usa le sue pagine come base
- `?clone=456`: Carica recap esistente, mantieni `original_summary_id`
- Nessun param: Inizia vuoto con 3 pagine di default

**Validazioni**:

- Minimo 3 pagine per salvare
- Ogni pagina deve avere un background selezionato
- Title non vuoto
- Mostrare errori chiari se validazione fallisce

**API da usare**:

- `POST /api/recaps` per creare nuovo
- `PUT /api/recaps/:id` per aggiornare esistente
- Vedere `apiService.js` per funzioni già disponibili

---

#### 2. **Layout System per Text Overlay** (CRITICO)

**File**: `client/src/components/PagePreview.jsx` (da creare)

**Problema**: I testi devono essere posizionati sopra le immagini in base al `layout_type`.

**Layout types da supportare** (vedere database per tutti i tipi):

- `CENTER`: Testo centrato verticalmente e orizzontalmente
- `TOP_DOWN`: Testi distribuiti dall'alto verso il basso
- `LEFT_RIGHT`: Testi a sinistra e destra
- `BOTTOM_UP`: Testi dal basso verso l'alto
- Aggiungere altri secondo necessità dal DB

**Implementazione consigliata**:

```css
/* Esempio per CENTER */
.text-overlay-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Esempio per TOP_DOWN */
.text-overlay-top {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
}
```

**Componente riutilizzabile**:

```jsx
function PagePreview({ page, background }) {
  const layoutClass = getLayoutClass(background.layout_type);
  return (
    <div className="page-preview">
      <img src={background.url} alt="Background" />
      <div className={layoutClass}>
        {page.text_1 && <p className="text-slot-1">{page.text_1}</p>}
        {page.text_2 && <p className="text-slot-2">{page.text_2}</p>}
        {page.text_3 && <p className="text-slot-3">{page.text_3}</p>}
      </div>
    </div>
  );
}
```

**Usare in**:

- RecapEditorPage (preview centrale)
- RecapViewPage (slideshow) - già parzialmente implementato, verificare

---

#### 3. **Thumbnails Sidebar Component**

**File**: `client/src/components/PageThumbnail.jsx` (da creare)

**Scopo**: Mostrare mini-preview di ogni pagina nella sidebar dell'editor

**Props**:

```javascript
{
  page: { background_image_id, text_1, text_2, text_3 },
  background: { url, layout_type },
  isActive: boolean,
  index: number,
  onSelect: () => void,
  onMoveUp: () => void,
  onMoveDown: () => void,
  onDelete: () => void,
  canMoveUp: boolean,
  canMoveDown: boolean
}
```

**Design**:

- Miniatura 120x160px circa
- Border evidenziato se `isActive`
- Icone piccole per azioni (frecce, cestino)
- Numero pagina visibile
- Tooltip con titoli dei testi (opzionale)

---

#### 4. **Background Selector Grid**

**File**: `client/src/components/BackgroundSelector.jsx` (da creare)

**Scopo**: Grid di immagini per selezionare background della pagina corrente

**Props**:

```javascript
{
  backgrounds: Array<{ id, url, slots_count, layout_type }>,
  selectedId: number,
  onSelect: (id) => void
}
```

**Design**:

- Grid responsive (3-4 colonne)
- Thumbnails cliccabili
- Border/shadow sul selezionato
- Badge con numero slots disponibili
- Hover effect

---

#### 5. **Validazione e Error Handling**

**Creare componente**: `client/src/components/EditorValidation.jsx`

**Mostrare errori per**:

- Pagine insufficienti (< 3)
- Background mancante
- Titolo vuoto
- Errori API (salvataggio fallito)

**Usare Alert già esistente** in `components/utils/Alert.jsx`

---

## 🎨 DESIGN SYSTEM - PALETTE E STILI

### Colori (USARE SEMPRE LE CSS VARIABLES)

```css
/* Definite in client/src/index.css */

/* Colori primari */
--primary-color: #0f766e; /* Teal scuro - brand principale */
--primary-hover: #115e59; /* Teal più scuro - hover */
--accent-light: #ccfbf1; /* Teal chiaro - accenti */

/* Testi */
--text-main: #1e293b; /* Testo principale scuro */
--text-muted: #64748b; /* Testo secondario grigio */

/* Backgrounds */
--bg-app: #f1f5f9; /* Background app grigio chiaro */
--card-bg: #fff; /* Background card bianco */
--card-border: #e2e8f0; /* Border card grigio chiaro */

/* Badge */
--badge-bg: #e9e6fa; /* Background badge viola chiaro */
--badge-color: #5a3ec8; /* Testo badge viola */

/* Pericolo */
--danger-color: #dc3545; /* Rosso errori/delete */
--danger-hover: #c82333; /* Rosso hover */

/* Ombre */
--shadow-light: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.25);

/* Border radius */
--border-radius-small: 8px;
--border-radius-medium: 10px;
--border-radius-large: 16px;

/* Transizioni */
--transition-fast: all 0.2s;
--transition-medium: all 0.3s;

/* Dimensioni */
--input-height: 52px;
--navbar-height: 72px;
```

### Bottoni Standard

**USARE SEMPRE LE CLASSI ESISTENTI**:

```css
/* Bottone primario pieno */
.btn-primary-custom {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  min-height: var(--input-height);
  padding: 0 2rem;
  transition: var(--transition-fast);
}

/* Bottone outline */
.btn-outline-nav {
  color: var(--text-muted);
  border: 1px solid #cbd5e1;
  background: transparent;
}

/* Form controls */
.form-control {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 1.2rem;
  min-height: var(--input-height);
  font-size: 1rem;
}
```

### Layout Pattern

**Header pagina**:

```css
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 0 2rem;
  min-height: 80px;
}

.page-title {
  color: var(--primary-color);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}
```

**Container principale**:

```css
.main-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
```

---

## 🏗️ ARCHITETTURA & BEST PRACTICES

### React Patterns da Seguire

1. **Functional Components + Hooks**

   - Usare sempre `useState`, `useEffect`, `useContext`
   - Custom hooks per logica complessa (es. `useRecapEditor`)

2. **Componenti Controllati**

   ```jsx
   <input value={title} onChange={(e) => setTitle(e.target.value)} />
   ```

3. **Prop Validation con PropTypes**

   ```jsx
   ComponentName.propTypes = {
     title: PropTypes.string.isRequired,
     onSave: PropTypes.func,
   };
   ```

4. **Gestione Errori**

   ```jsx
   const [error, setError] = useState(null);
   try {
     await apiCall();
   } catch (err) {
     setError(err.message);
   }
   ```

5. **Loading States**
   ```jsx
   const [loading, setLoading] = useState(false);
   if (loading) return <Spinner />;
   ```

### File Organization

```
src/
├── components/
│   ├── PagePreview.jsx          [DA CREARE]
│   ├── PageThumbnail.jsx        [DA CREARE]
│   ├── BackgroundSelector.jsx   [DA CREARE]
│   ├── EditorValidation.jsx     [DA CREARE]
│   └── ... (esistenti)
├── pages/
│   ├── RecapEditorPage.jsx      [DA COMPLETARE]
│   ├── RecapEditorPage.css      [DA CREARE]
│   └── ... (esistenti)
├── hooks/                        [DA CREARE]
│   └── useRecapEditor.js        [OPZIONALE - per logica complessa]
├── utils/
│   └── layoutHelpers.js         [DA CREARE - helper per layout types]
```

---

## 🔧 IMPLEMENTAZIONE STEP-BY-STEP

### FASE 1: Componenti Riutilizzabili Base

1. **PagePreview.jsx**

   - Implementa il rendering di una singola pagina con overlay testi
   - Gestisci tutti i layout_type possibili
   - CSS con positioning assoluto

2. **BackgroundSelector.jsx**

   - Grid responsive di immagini
   - Selezione attiva visibile
   - Filtraggio per tema già gestito dal parent

3. **PageThumbnail.jsx**
   - Mini versione di PagePreview
   - Pulsanti azione integrati
   - Stati attivo/inattivo

### FASE 2: RecapEditorPage - Struttura Base

1. **Layout a 3 colonne**:

   ```jsx
   <div className="editor-container">
     <aside className="editor-sidebar">{/* Lista thumbnails */}</aside>
     <main className="editor-main">{/* Preview centrale */}</main>
     <aside className="editor-controls">{/* Form e background selector */}</aside>
   </div>
   ```

2. **State iniziale**:
   - Carica dati da API secondo query params
   - Inizializza `recapData` e `currentPageIndex`
   - Fetch backgrounds del tema

### FASE 3: Logica Editing

1. **Gestione pagine**:

   ```jsx
   const addPage = () => {
     setRecapData((prev) => ({
       ...prev,
       pages: [...prev.pages, { background_image_id: null, text_1: "", text_2: "", text_3: "" }],
     }));
   };

   const deletePage = (index) => {
     if (recapData.pages.length <= 3) {
       alert("Minimo 3 pagine richieste");
       return;
     }
     setRecapData((prev) => ({
       ...prev,
       pages: prev.pages.filter((_, i) => i !== index),
     }));
   };

   const movePage = (fromIndex, toIndex) => {
     const newPages = [...recapData.pages];
     const [moved] = newPages.splice(fromIndex, 1);
     newPages.splice(toIndex, 0, moved);
     setRecapData((prev) => ({ ...prev, pages: newPages }));
   };
   ```

2. **Update testi pagina corrente**:

   ```jsx
   const updateCurrentPageText = (field, value) => {
     setRecapData((prev) => ({
       ...prev,
       pages: prev.pages.map((page, i) => (i === currentPageIndex ? { ...page, [field]: value } : page)),
     }));
   };
   ```

3. **Salvataggio**:
   ```jsx
   const handleSave = async () => {
     // Validazioni
     if (recapData.pages.length < 3) {
       setError("Minimo 3 pagine richieste");
       return;
     }
     if (!recapData.title.trim()) {
       setError("Titolo obbligatorio");
       return;
     }

     try {
       setLoading(true);
       const response = await createRecap(recapData);
       navigate("/profile");
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   ```

### FASE 4: Styling & Polish

1. **CSS Editor Layout**:

   ```css
   .editor-container {
     display: grid;
     grid-template-columns: 250px 1fr 350px;
     gap: 1rem;
     height: calc(100vh - var(--navbar-height));
     padding: 1rem;
   }

   .editor-sidebar {
     background: white;
     border-radius: var(--border-radius-medium);
     padding: 1rem;
     overflow-y: auto;
   }

   .editor-main {
     display: flex;
     align-items: center;
     justify-content: center;
     background: var(--bg-app);
   }

   .editor-controls {
     background: white;
     border-radius: var(--border-radius-medium);
     padding: 1.5rem;
     overflow-y: auto;
   }
   ```

2. **Responsive**: Su mobile, collassare a layout verticale con tab

3. **Animazioni**: Usare `--transition-fast` per hover/focus

---

## 📝 CHECKLIST QUALITÀ

Prima di considerare completo, verificare:

- [ ] **Funzionalità Core**

  - [ ] Editor permette di creare riepiloghi da zero
  - [ ] Clone da template funziona correttamente
  - [ ] Clone da recap pubblico funziona con tracciamento origine
  - [ ] Salvataggio chiama API corretta con dati validi
  - [ ] Riordino pagine funziona
  - [ ] Elimina pagine funziona (con minimo 3)
  - [ ] Selezione background aggiorna preview

- [ ] **UI/UX**

  - [ ] Layout responsivo e usabile
  - [ ] Feedback visivo per azioni (loading, errori)
  - [ ] Preview live aggiornata in tempo reale
  - [ ] Colori e stili coerenti con design system
  - [ ] Accessibilità: focus visibile, label corrette

- [ ] **Validazioni**

  - [ ] Minimo 3 pagine verificato
  - [ ] Titolo obbligatorio verificato
  - [ ] Background obbligatorio per ogni pagina
  - [ ] Errori API gestiti con messaggi chiari

- [ ] **Code Quality**
  - [ ] Nessun warning in console
  - [ ] PropTypes definiti
  - [ ] Componenti riutilizzabili e ben separati
  - [ ] CSS variables usate correttamente
  - [ ] Codice commentato dove necessario

---

## 🚀 PRIORITÀ IMPLEMENTAZIONE

### HIGH PRIORITY (Essenziali per funzionamento base)

1. ✅ RecapEditorPage - struttura base e stato
2. ✅ PagePreview - rendering pagine con overlay
3. ✅ Logica salvataggio e validazioni
4. ✅ BackgroundSelector - selezione immagini

### MEDIUM PRIORITY (Migliorano UX)

5. ⚠️ PageThumbnail - sidebar con riordino
6. ⚠️ EditorValidation - errori inline chiari
7. ⚠️ Loading states e feedback visivi

### LOW PRIORITY (Nice to have)

8. 💡 Undo/Redo editing
9. 💡 Anteprima slideshow modale
10. 💡 Autosave locale (localStorage)

---

## 💻 CODICE DI ESEMPIO - RecapEditorPage Skeleton

```jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTemplateById, getRecapById, getImagesByTheme, createRecap } from "../services/apiService";
import PagePreview from "../components/PagePreview";
import BackgroundSelector from "../components/BackgroundSelector";
import PageThumbnail from "../components/PageThumbnail";
import Alert from "../components/utils/Alert";
import Spinner from "../components/utils/Spinner";
import "./RecapEditorPage.css";

function RecapEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [recapData, setRecapData] = useState({
    title: "",
    visibility: "private",
    theme_id: null,
    original_summary_id: null,
    pages: [],
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inizializzazione
  useEffect(() => {
    const initEditor = async () => {
      const templateId = searchParams.get("template");
      const cloneId = searchParams.get("clone");

      try {
        setLoading(true);

        if (templateId) {
          // Carica template
          const template = await getTemplateById(templateId);
          const bgImages = await getImagesByTheme(template.theme_id);

          setRecapData({
            title: `Nuovo ${template.name}`,
            visibility: "private",
            theme_id: template.theme_id,
            original_summary_id: null,
            pages: template.pages.map((p) => ({
              background_image_id: p.background_image_id,
              text_1: "",
              text_2: "",
              text_3: "",
            })),
          });
          setBackgrounds(bgImages);
        } else if (cloneId) {
          // Carica recap da clonare
          const recap = await getRecapById(cloneId);
          const bgImages = await getImagesByTheme(recap.theme_id);

          setRecapData({
            title: `Copia di ${recap.title}`,
            visibility: "private",
            theme_id: recap.theme_id,
            original_summary_id: recap.id,
            pages: recap.pages.map((p) => ({
              background_image_id: p.background_image_id,
              text_1: p.text_1 || "",
              text_2: p.text_2 || "",
              text_3: p.text_3 || "",
            })),
          });
          setBackgrounds(bgImages);
        } else {
          setError("Parametri non validi");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initEditor();
  }, [searchParams]);

  // Handlers
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
      pages: [...prev.pages, { background_image_id: null, text_1: "", text_2: "", text_3: "" }],
    }));
  };

  const deletePage = (index) => {
    if (recapData.pages.length <= 3) {
      alert("Minimo 3 pagine richieste!");
      return;
    }
    const newPages = recapData.pages.filter((_, i) => i !== index);
    setRecapData((prev) => ({ ...prev, pages: newPages }));
    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(newPages.length - 1);
    }
  };

  const movePage = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= recapData.pages.length) return;

    const newPages = [...recapData.pages];
    [newPages[fromIndex], newPages[toIndex]] = [newPages[toIndex], newPages[fromIndex]];
    setRecapData((prev) => ({ ...prev, pages: newPages }));

    if (currentPageIndex === fromIndex) {
      setCurrentPageIndex(toIndex);
    } else if (currentPageIndex === toIndex) {
      setCurrentPageIndex(fromIndex);
    }
  };

  const handleSave = async () => {
    // Validazioni
    if (!recapData.title.trim()) {
      setError("Inserisci un titolo");
      return;
    }
    if (recapData.pages.length < 3) {
      setError("Servono almeno 3 pagine");
      return;
    }
    if (recapData.pages.some((p) => !p.background_image_id)) {
      setError("Ogni pagina deve avere un background");
      return;
    }

    try {
      setLoading(true);
      await createRecap(recapData);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error && !recapData.theme_id) return <Alert type="error">{error}</Alert>;

  const currentPage = recapData.pages[currentPageIndex];
  const currentBackground = backgrounds.find((bg) => bg.id === currentPage?.background_image_id);

  return (
    <div className="editor-container">
      {/* SIDEBAR SINISTRA - Thumbnails */}
      <aside className="editor-sidebar">
        <h3>Pagine ({recapData.pages.length})</h3>
        <div className="thumbnails-list">
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
        <button onClick={addPage} className="btn-add-page">
          + Aggiungi Pagina
        </button>
      </aside>

      {/* AREA CENTRALE - Preview */}
      <main className="editor-main">
        {currentBackground ? (
          <PagePreview page={currentPage} background={currentBackground} />
        ) : (
          <div className="no-background-placeholder">Seleziona un background →</div>
        )}
      </main>

      {/* PANNELLO DESTRO - Controlli */}
      <aside className="editor-controls">
        <h2>Modifica Riepilogo</h2>

        {error && <Alert type="error">{error}</Alert>}

        {/* Titolo */}
        <div className="form-group">
          <label>Titolo</label>
          <input
            type="text"
            className="form-control"
            value={recapData.title}
            onChange={(e) => updateTitle(e.target.value)}
          />
        </div>

        {/* Visibilità */}
        <div className="form-group">
          <label>Visibilità</label>
          <select
            className="form-control"
            value={recapData.visibility}
            onChange={(e) => updateVisibility(e.target.value)}
          >
            <option value="private">Privato</option>
            <option value="public">Pubblico</option>
          </select>
        </div>

        <hr />

        <h3>Pagina {currentPageIndex + 1}</h3>

        {/* Testi */}
        {currentBackground && (
          <>
            <div className="form-group">
              <label>Testo 1</label>
              <textarea
                className="form-control"
                value={currentPage.text_1}
                onChange={(e) => updatePageText("text_1", e.target.value)}
              />
            </div>

            {currentBackground.slots_count >= 2 && (
              <div className="form-group">
                <label>Testo 2</label>
                <textarea
                  className="form-control"
                  value={currentPage.text_2}
                  onChange={(e) => updatePageText("text_2", e.target.value)}
                />
              </div>
            )}

            {currentBackground.slots_count >= 3 && (
              <div className="form-group">
                <label>Testo 3</label>
                <textarea
                  className="form-control"
                  value={currentPage.text_3}
                  onChange={(e) => updatePageText("text_3", e.target.value)}
                />
              </div>
            )}
          </>
        )}

        <hr />

        {/* Background Selector */}
        <h3>Scegli Background</h3>
        <BackgroundSelector
          backgrounds={backgrounds}
          selectedId={currentPage?.background_image_id}
          onSelect={selectBackground}
        />

        <hr />

        {/* Azioni */}
        <div className="editor-actions">
          <button
            className="btn btn-primary-custom"
            onClick={handleSave}
            disabled={loading || recapData.pages.length < 3}
          >
            {loading ? "Salvataggio..." : "Salva Riepilogo"}
          </button>
          <button className="btn btn-outline-nav" onClick={() => navigate(-1)}>
            Annulla
          </button>
        </div>
      </aside>
    </div>
  );
}

export default RecapEditorPage;
```

---

## 🎯 CONCLUSIONE

Segui questa guida step-by-step mantenendo:

- **Coerenza stilistica** con design esistente
- **Best practices React**
- **User experience** intuitiva
- **Codice pulito** e manutenibile

Quando implementi, **testa continuamente** con il server locale e verifica che:

1. Le API ricevano i dati nel formato corretto
2. Il frontend gestisca correttamente errori e loading
3. Il design sia coerente con il resto dell'applicazione

**Ricorda**: Il backend è immutabile, adatta il frontend alle API esistenti, non viceversa.
