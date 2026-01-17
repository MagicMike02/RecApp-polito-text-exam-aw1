# RecApp - Documentazione Tecnica Completa

## Analisi Approfondita per Presentazione d'Esame

---

## 1. PROJECT OVERVIEW & ARCHITECTURE

### 1.1 Stack Tecnologico

| Componente         | Tecnologia        | Versione                |
| ------------------ | ----------------- | ----------------------- |
| **Frontend**       | React 18+         | + Vite (build tool)     |
| **Backend**        | Node.js + Express | v4.21.2                 |
| **Database**       | SQLite3           | v5.1.7                  |
| **Auth**           | Passport.js       | v0.7.0 (Local Strategy) |
| **Gestione Stato** | React Context API | Built-in                |
| **i18n**           | i18next           | + react-i18next         |
| **HTTP Client**    | Axios             | Con interceptors        |

### 1.2 Architettura Complessiva

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Components          Contexts          Services          │   │
│  │  ├─ RecapList       ├─ AuthContext    ├─ apiService.js  │   │
│  │  ├─ PagePreview     ├─ NotificationCtx└─ (Axios)        │   │
│  │  └─ EditorPage      │                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────────────┘
                 │ HTTP/REST (port 5173 → 3001)
                 │ Credentials: true (session cookies)
┌────────────────▼─────────────────────────────────────────────────┐
│              SERVER (Express + Node.js)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routes              Middleware         DAO              │   │
│  │  ├─ authRoutes      ├─ isAuthenticated ├─ recapDao      │   │
│  │  ├─ recapRoutes     ├─ isOwner         ├─ userDao       │   │
│  │  ├─ themeRoutes     ├─ validators      ├─ templateDao   │   │
│  │  └─ imageRoutes     └─ errorHandler    └─ themeDao      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────────────┘
                 │ SQL Queries (Promise-based)
                 │ Database: /server/database/database.sqlite
┌────────────────▼─────────────────────────────────────────────────┐
│              SQLite Database                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Tables:                                                  │   │
│  │  ├─ users          ├─ templates     ├─ recaps           │   │
│  │  ├─ themes         ├─ template_pages├─ recap_pages      │   │
│  │  └─ background_images               (Foto + Metadati)   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 1.3 Data Flow: Creazione di una Recap

```
Utente clicca "Create" in React
    ↓
RecapEditorPage.jsx carica
    ├─ useParams() verifica: template_id? clone_id? edit_id?
    └─ Carica template/recap/clone da API
    ↓
Frontend fetches:
    ├─ getTemplateById(id)      → template + pages
    └─ getImagesByTheme(theme)  → backgrounds list
    ↓
Utente modifica:
    ├─ Cambia titolo              (state: recapData.title)
    ├─ Aggiungi/elimina pagine    (state: recapData.pages[])
    ├─ Seleziona background       (state: pages[i].background_image_id)
    └─ Scrive testo              (state: pages[i].text_field_*)
    ↓
Clicca "Save"
    ├─ validateRecap() (client-side)
    │  ├─ ✓ Title not empty
    │  ├─ ✓ Min 3 pages
    │  ├─ ✓ Every page has background
    │  └─ ✓ Every page has at least 1 text field
    └─ createRecap(payload) / updateRecap(id, payload)
    ↓
API POST /api/recaps + body
    │
Server: recapRoutes.js POST handler
    ├─ isAuthenticated middleware (check session)
    ├─ validateCreateRecap middleware (express-validator)
    └─ recapDao.createRecap() + createRecapPage() × pages.length
    ↓
Database INSERT:
    ├─ INSERT INTO recaps (user_id, theme_id, title, visibility...)
    │  └─ Returns: recap.id (lastID)
    ├─ For each page:
    │  └─ INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_fields...)
    └─ PRAGMA foreign_keys = ON (assicura integrità referenziale)
    ↓
Response: { success: true, data: { id, title, pages[], ... } }
    ↓
Client Axios Interceptor estrae: data.data
    ↓
React Navigation → /profile (success toast)
```

---

## 2. CORE LOGIC & STATE MANAGEMENT

### 2.1 Authentication Flow

#### 2.1.1 AuthContext.jsx - Il Cuore dell'Autenticazione

**File**: [client/src/contexts/AuthContext.jsx](client/src/contexts/AuthContext.jsx)

```javascript
// Export un Context contenente:
export const AuthContext = createContext();

// Provider wrappa l'app (in main.jsx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth(); // On mount: controlla se user loggato
  }, []);

  const checkAuth = async () => {
    const user = await API.getCurrentUser();
    setUser(user); // null se non autenticato
  };

  const login = async (username, password) => {
    const user = await API.login(username, password);
    setUser(user);
    return { success: true };
  };

  const logout = async () => {
    await API.logout();
    setUser(null);
  };

  const value = {
    user, // { id, username, name }
    loading, // boolean
    login, // async function
    logout, // async function
    isAuthenticated: !!user, // Converti user a boolean
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
```

**Key Design Decisions:**

- ✅ **Centralized State**: `user` object è unica fonte di verità
- ✅ **Loading State**: `loading` flag previene render race conditions
- ✅ **Boolean Conversion**: `!!user` → `isAuthenticated` (true/false)
- ✅ **Error Handling**: Usa il sistema di notifiche per feedback
- ✅ **Session-Based**: Passport.js mantiene sessione lato server

#### 2.1.2 ProtectedRoute.jsx - Guarding Restricted Pages

**File**: [client/src/components/ProtectedRoute.jsx](client/src/components/ProtectedRoute.jsx)

```javascript
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Loading: mostra spinner
  if (loading) {
    return <Spinner animation="border" />;
  }

  // 2. Not authenticated: redirect a /login
  //    Salva location per post-login redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated: render children
  return children;
}
```

**Implementazione nelle Routes:**

```javascript
// App.jsx (routing)
<Route element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} path="/profile" />
<Route element={<ProtectedRoute><RecapEditorPage /></ProtectedRoute>} path="/recap/:id/edit" />
<Route element={<ProtectedRoute><CreateRecapPage /></ProtectedRoute>} path="/create" />
```

**Security Pattern:**

- Client-side: ProtectedRoute impedisce accesso UI non autenticato
- Server-side: isAuthenticated middleware blocca API call
- Session: Passport mantiene sessione HTTPOnly cookie

### 2.2 Internationalization (i18n) Implementation

#### 2.2.1 i18n Setup

**File**: [client/src/i18n.js](client/src/i18n.js)

```javascript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpApi) // Carica JSON da /public/locales
  .use(LanguageDetector) // Rileva lingua browser (en, it)
  .use(initReactI18next) // Integra con React
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "it"],
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
  });

export default i18n;
```

#### 2.2.2 Strategie di Localizzazione

**A) Static UI Strings** (tradotte in JSON)

```javascript
// client/public/locales/en/translation.json
{
  "ui": {
    "editor": {
      "title_label": "Recap Title",
      "add_page": "Add Page",
      "save_button": "Save Recap"
    },
    "validation": {
      "title_required": "Title is required"
    }
  },
  "api_errors": {
    "auth_required": "You must be logged in",
    "forbidden_not_owner": "You cannot modify this recap"
  }
}
```

**B) Dynamic DB Values** (usando chiavi standardizzate)

```javascript
// Database: themes.name, recaps.visibility memorizzati in INGLESE
// Esempio:
// INSERT INTO themes (name) VALUES ('Travel');
// INSERT INTO recaps (visibility) VALUES ('public');

// Nel componente React:
const visibility = recap.visibility;  // "public" (dal DB)
<span>{t(`ui.visibility.${visibility}`)}</span>
// Traduce "public" → "Pubblico" (IT) or "Public" (EN)

// locales/it/translation.json
{
  "ui": {
    "visibility": {
      "public": "Pubblico",
      "private": "Privato"
    }
  }
}
```

**Key Advantages:**

- ✅ **Decoupling**: DB contiene dati neutri (inglese)
- ✅ **Flexibility**: Cambio lingua senza toccare DB
- ✅ **Performance**: Non ri-fetch data al cambio lingua
- ✅ **Maintenance**: Gestione centralizzata traduzioni

---

## 3. DEEP DIVE: THE "SMART EDITOR" (RecapEditorPage)

RecapEditorPage è il **core complesso dell'applicazione**. Gestisce tre modalità diverse con uno stesso component logic.

### 3.1 Dual Mode Detection & Initialization

**File**: [client/src/pages/RecapEditorPage.jsx](client/src/pages/RecapEditorPage.jsx) (linee 1-120)

```javascript
function RecapEditorPage() {
  const { id: paramId } = useParams(); // /recap/:id/edit
  const [searchParams] = useSearchParams(); // ?template=5&clone=10
  const { user, isAuthenticated } = useAuth();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editRecapId, setEditRecapId] = useState(null);

  useEffect(() => {
    const initEditor = async () => {
      const templateId = searchParams.get("template");
      const cloneId = searchParams.get("clone");
      const editId = paramId;

      // PRIORITY: 1. Edit 2. Template 3. Clone
      if (editId) {
        // ======== EDIT MODE ========
        const recap = await getRecapById(editId);

        // SECURITY CHECK: Solo il proprietario può modificare
        if (!isAuthenticated || recap.user_id !== user.id) {
          const errorMsg = t("ui.editor.forbidden_edit");
          setError(errorMsg);
          showError(errorMsg);
          setTimeout(() => navigate("/profile"), 2000);
          return;
        }

        setIsEditMode(true);
        setEditRecapId(parseInt(editId));
        setRecapData({
          title: recap.title,
          visibility: recap.visibility,
          theme_id: recap.theme_id,
          pages: recap.pages.map((p) => ({
            id: p.id, // Importante: ID pagina per update
            page_number: p.page_number,
            background_image_id: p.background_image_id,
            text_field_1: p.text_field_1 || "",
            text_field_2: p.text_field_2 || "",
            text_field_3: p.text_field_3 || "",
          })),
        });
      } else if (templateId) {
        // ======== CREATE FROM TEMPLATE MODE ========
        const template = await getTemplateById(templateId);
        const bgImages = await getImagesByTheme(template.theme_id);

        setRecapData({
          title: t("ui.editor.new_title", { name: template.name }),
          // Titolo auto-generato: "New: [Template Name]"
          visibility: "private",
          theme_id: template.theme_id,
          pages: template.pages.map((p, index) => ({
            page_number: index + 1,
            background_image_id: p.background_image_id,
            text_field_1: "",
            text_field_2: "",
            text_field_3: "",
            // NO id: queste sono pagine NUOVE
          })),
        });
      } else if (cloneId) {
        // ======== CLONE MODE ========
        const recap = await getRecapById(cloneId);

        setRecapData({
          title: t("ui.editor.copy_title", { title: recap.title }),
          // Titolo auto-generato: "Copy of [Original Title]"
          visibility: "private",
          theme_id: recap.theme_id,
          derived_from_recap_id: recap.id, // Traccia l'originale
          pages: recap.pages.map((p, index) => ({
            page_number: index + 1,
            background_image_id: p.background_image_id,
            text_field_1: p.text_field_1 || "",
            // NO id: queste sono copie di pagine
          })),
        });
      }
    };

    initEditor();
  }, [searchParams, paramId]);
}
```

**Tabella Comparativa delle Tre Modalità:**

| Aspetto                   | Edit Mode                 | Template Mode        | Clone Mode                    |
| ------------------------- | ------------------------- | -------------------- | ----------------------------- |
| **URL**                   | `/recap/5/edit`           | `/create?template=3` | `/create?clone=7`             |
| **Pages ID**              | ✅ Ha ID (da DB)          | ❌ NO ID             | ❌ NO ID                      |
| **Theme**                 | Fisso (non cambiabile)    | Fisso da template    | Fisso da original             |
| **Visibilità**            | Mantenuta                 | Reset a private      | Reset a private               |
| **derived_from_recap_id** | ❌ null                   | ❌ null              | ✅ = original recap.id        |
| **Save Operation**        | PUT /api/recaps/:id       | POST /api/recaps     | POST /api/recaps              |
| **Security**              | recap.user_id === user.id | Public (nessuno)     | recap.visibility === 'public' |

### 3.2 Complex State Synchronization

#### 3.2.1 recapData Structure

```javascript
const [recapData, setRecapData] = useState({
  title: "",                    // Singolo valore
  visibility: "private",        // Enum: 'public' | 'private'
  theme_id: null,              // Immutabile dopo init
  derived_from_recap_id: null, // Opzionale
  pages: [
    {
      // Pagina 1
      id: null || 123,          // null se nuova, altrimenti ID dal DB
      page_number: 1,           // Mantiene ordine
      background_image_id: 5,   // FK background_images
      text_field_1: "...",      // Max 500 chars
      text_field_2: "...",
      text_field_3: "...",
    },
    {
      // Pagina 2
      id: null || 124,
      page_number: 2,
      background_image_id: 8,
      text_field_1: "...",
      ...
    },
    // Minimo 3 pagine sempre (validazione)
  ],
});
```

#### 3.2.2 State Update Patterns

**Pattern 1: Update Non-Page Fields**

```javascript
const updateTitle = (value) => {
  setRecapData((prev) => ({ ...prev, title: value }));
};

const updateVisibility = (value) => {
  setRecapData((prev) => ({ ...prev, visibility: value }));
};
```

**Pattern 2: Update Single Page Text**

```javascript
const updatePageText = (field, value) => {
  setRecapData((prev) => ({
    ...prev,
    pages: prev.pages.map((page, i) =>
      i === currentPageIndex
        ? { ...page, [field]: value } // Immutabile update
        : page
    ),
  }));
};

// Uso:
updatePageText("text_field_1", "Hello World");
```

**Pattern 3: Update Single Page Background**

```javascript
const selectBackground = (bgId) => {
  setRecapData((prev) => ({
    ...prev,
    pages: prev.pages.map((page, i) => (i === currentPageIndex ? { ...page, background_image_id: bgId } : page)),
  }));
};
```

### 3.3 Page Management Operations

#### 3.3.1 Add Page

```javascript
const addPage = () => {
  setRecapData((prev) => ({
    ...prev,
    pages: [
      ...prev.pages,
      {
        page_number: prev.pages.length + 1,
        background_image_id: null, // Obbligatorio sceglierlo
        text_field_1: "",
        text_field_2: "",
        text_field_3: "",
        // NO id: pagina nuova
      },
    ],
  }));
  setCurrentPageIndex(recapData.pages.length); // Auto-select nuova
};
```

#### 3.3.2 Delete Page

```javascript
const deletePage = (index) => {
  // Validazione: Min 3 pages
  if (recapData.pages.length <= 3) {
    showToast("error", t("ui.validation.min_pages"));
    return;
  }

  // Conferma modale
  showModal("confirm", "Delete page?", `Remove page ${index + 1}?`, async () => {
    // Elimina pagina
    const newPages = recapData.pages.filter((_, i) => i !== index);

    // IMPORTANTE: Aggiorna page_number dopo eliminazione
    // Perché page_number è unico per recap_id
    const pagesWithUpdatedNumbers = newPages.map((page, idx) => ({
      ...page,
      page_number: idx + 1, // 1, 2, 3, 4... (senza buchi)
    }));

    setRecapData((prev) => ({ ...prev, pages: pagesWithUpdatedNumbers }));

    // Aggiusta currentPageIndex se necessario
    if (currentPageIndex >= pagesWithUpdatedNumbers.length) {
      setCurrentPageIndex(pagesWithUpdatedNumbers.length - 1);
    } else if (currentPageIndex === index && index > 0) {
      setCurrentPageIndex(index - 1);
    }

    showToast("success", "Page deleted");
  });
};
```

#### 3.3.3 Move Page (Reorder)

```javascript
const movePage = (fromIndex, direction) => {
  const toIndex = fromIndex + direction;

  // Boundary check
  if (toIndex < 0 || toIndex >= recapData.pages.length) return;

  // Array swap
  const newPages = [...recapData.pages];
  [newPages[fromIndex], newPages[toIndex]] = [newPages[toIndex], newPages[fromIndex]];

  setRecapData((prev) => ({ ...prev, pages: newPages }));

  // Se la pagina selezionata fu mossa, aggiorna currentPageIndex
  if (currentPageIndex === fromIndex) {
    setCurrentPageIndex(toIndex);
  } else if (currentPageIndex === toIndex) {
    setCurrentPageIndex(fromIndex);
  }
};
```

### 3.4 Client-Side Validation

```javascript
const validateRecap = () => {
  // 1. Title non vuoto
  if (!recapData.title.trim()) {
    return t("ui.validation.title_required");
  }

  // 2. Minimo 3 pagine
  if (recapData.pages.length < 3) {
    return t("ui.validation.min_pages");
  }

  // 3. Per ogni pagina
  for (let i = 0; i < recapData.pages.length; i++) {
    const page = recapData.pages[i];

    // 3a. Background image obbligatorio
    if (!page.background_image_id) {
      return t("ui.validation.select_background", { page: i + 1 });
    }

    // 3b. Almeno un campo testo compilato
    const hasText = page.text_field_1?.trim() || page.text_field_2?.trim() || page.text_field_3?.trim();

    if (!hasText) {
      return t("ui.validation.text_required", { page: i + 1 });
    }
  }

  return null; // Validation passed
};
```

### 3.5 Save Operations & Backend Interaction

#### 3.5.1 CREATE (New Recap)

```javascript
const handleSave = async () => {
  // 1. Validazione client-side
  const validationError = validateRecap();
  if (validationError) {
    showToast("error", validationError);
    return;
  }

  try {
    setSaving(true);

    // 2. Prepara payload
    const pagesWithCorrectNumbers = recapData.pages.map((page, idx) => ({
      ...page,
      page_number: idx + 1, // Assicura page_number === index
    }));

    const payload = {
      ...recapData,
      pages: pagesWithCorrectNumbers,
      derived_from_recap_id: recapData.derived_from_recap_id || undefined,
    };

    // 3. Route basata su modalità
    if (isEditMode) {
      // ======== PUT /api/recaps/:id ========
      await updateRecap(editRecapId, payload);
      showSuccess(t("notifications.recap_updated_success"));
    } else {
      // ======== POST /api/recaps ========
      await createRecap(payload);
      showSuccess(t("notifications.recap_created_success"));
    }

    // 4. Redirect (success toast first)
    setTimeout(() => navigate("/profile"), 2000);
  } catch (err) {
    // Estrai messaggio errore
    let errorMsg = t("ui.editor.error_saving");

    if (err.response?.data?.errors) {
      // Validation errors dal backend
      errorMsg = err.response.data.errors.map((e) => e.msg).join(", ");
    } else if (err.response?.data?.error) {
      // API error key
      errorMsg = t(`api_errors.${err.response.data.error}`);
    } else if (err.message) {
      errorMsg = err.message;
    }

    showError(errorMsg);
  } finally {
    setSaving(false);
  }
};
```

---

## 4. BACKEND & SECURITY ANALYSIS

### 4.1 API Response Design

**Standard Response Format**:

```javascript
// Successo
{
  success: true,
  data: { /* payload */ }
}

// Errore
{
  success: false,
  error: 'error_key',
  message: 'Human readable message'
}
```

**Implementazione in ogni rotta** (server/routes/\*.js):

```javascript
// Esempio: GET /api/recaps/public
router.get("/public", async (req, res) => {
  try {
    const recaps = await recapDao.getPublicRecaps();
    res.json({ success: true, data: recaps }); // ✅ Successo
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "fetch_public_recaps_error",
      message: "Error fetching public recaps",
    });
  }
});
```

**Axios Interceptor Unwrapping** (client/src/services/apiService.js):

```javascript
apiClient.interceptors.response.use((response) => {
  const data = response.data;

  // SUCCESS: return data.data direttamente
  if (data.success === true) {
    return data.data;
  }

  // ERROR: create Error object con context
  if (data.success === false && data.error) {
    const err = new Error("API Error");
    err.key = data.error;
    err.i18nKey = `api_errors.${data.error}`;
    return Promise.reject(err);
  }

  return Promise.reject(new Error("Unknown API response format"));
});
```

### 4.2 Database Logic: Recap & RecapPage Relationship

#### 4.2.1 Schema

```sql
-- Main recap record
CREATE TABLE recaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  theme_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
  derived_from_recap_id INTEGER,      -- Self-referencing FK
  derived_from_author TEXT,           -- Denormalized for perf
  derived_from_title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE RESTRICT,
  FOREIGN KEY (derived_from_recap_id) REFERENCES recaps(id) ON DELETE SET NULL
);

-- Pages belong to recap
CREATE TABLE recap_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recap_id INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  background_image_id INTEGER NOT NULL,
  text_field_1 TEXT,
  text_field_2 TEXT,
  text_field_3 TEXT,
  FOREIGN KEY (recap_id) REFERENCES recaps(id) ON DELETE CASCADE,
  FOREIGN KEY (background_image_id) REFERENCES background_images(id) ON DELETE RESTRICT,
  UNIQUE (recap_id, page_number)  -- Immediatamente impone ordine unico
);
```

**Key Design Decisions:**

- ✅ **Cascading Delete**: Se recap deleted → tutte le pagine deleted
- ✅ **UNIQUE(recap_id, page_number)**: Evita pagine duplicate/out of order
- ✅ **Denormalization**: derived_from_author/title per evitare join
- ✅ **Foreign Keys Enabled**: PRAGMA foreign_keys = ON; (in db.js)

#### 4.2.2 Complex Read Query

**File**: [server/dao/recapDao.js](server/dao/recapDao.js) - getPublicRecaps()

```javascript
export async function getPublicRecaps() {
  const db = await openDatabase();
  try {
    const recaps = await db.all(`
      SELECT 
        r.*,
        u.username as author_username, 
        u.name as author_name,
        th.name as theme_name,
        
        -- SQL JSON aggregation: costruisce array di pagine in SQL
        json_group_array(
          json_object(
            'id', rp.id,
            'page_number', rp.page_number,
            'background_image_id', rp.background_image_id,
            'text_field_1', rp.text_field_1,
            'text_field_2', rp.text_field_2,
            'text_field_3', rp.text_field_3,
            'background_url', bi.url,
            'text_fields_count', bi.text_fields_count,
            'text_positions', json(bi.text_positions)
          )
        ) as pages
      FROM recaps r
      JOIN users u ON r.user_id = u.id
      JOIN themes th ON r.theme_id = th.id
      LEFT JOIN recap_pages rp ON r.id = rp.recap_id
      LEFT JOIN background_images bi ON rp.background_image_id = bi.id
      WHERE r.visibility = 'public'
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);

    // Post-processing in JS (JSON parsing + filtering)
    return recaps.map((recap) => ({
      ...recap,
      pages: JSON.parse(recap.pages)
        .filter((p) => p.id !== null) // LEFT JOIN NULL filtering
        .sort((a, b) => a.page_number - b.page_number),
    }));
  } finally {
    await db.close();
  }
}
```

**Optimizations:**

- ✅ **SQL-side Aggregation**: json_group_array crea JSON in DB
- ✅ **Single Query**: Evita N+1 problem (recap + pagine separate)
- ✅ **Denormalized Fields**: author_name, theme_name, image URL direttamente
- ✅ **Post-processing**: JSON parsing + filtering del NULL

### 4.3 Security & Ownership Verification

#### 4.3.1 Middleware Checks

**File**: [server/middlewares/auth.js](server/middlewares/auth.js)

```javascript
// 1. Authentication middleware
export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // Vai alla rotta
  }
  res.status(401).json({
    success: false,
    error: "auth_required",
    message: "Authentication required",
  });
}

// 2. Ownership middleware
export function isOwner(req, res, next) {
  const resourceUserId = req.params.userId || req.body.user_id;
  const currentUserId = req.user?.id;

  if (!currentUserId) {
    return res.status(401).json({
      success: false,
      error: "auth_required",
      message: "Authentication required",
    });
  }

  if (parseInt(resourceUserId) !== currentUserId) {
    return res.status(403).json({
      success: false,
      error: "forbidden_not_owner",
      message: "You do not own this resource",
    });
  }

  next();
}
```

#### 4.3.2 Route Protection Examples

**File**: [server/routes/recapRoutes.js](server/routes/recapRoutes.js)

```javascript
// 1. PUBLIC: Chiunque può leggere recap pubbliche
router.get("/public", async (req, res) => {
  const recaps = await recapDao.getPublicRecaps();
  res.json({ success: true, data: recaps });
});

// 2. AUTHENTICATED: Solo utenti loggati vedono le loro
router.get("/my", isAuthenticated, async (req, res) => {
  const recaps = await recapDao.getRecapsByUser(req.user.id);
  res.json({ success: true, data: recaps });
});

// 3. MIXED: Public/private, ma solo proprietario se privata
router.get("/:id", validateRecapId, async (req, res) => {
  const recap = await recapDao.getRecapById(parseInt(id), req.user?.id);

  if (!recap) {
    return res.status(404).json({ error: "recap_not_found" });
  }

  // Check: se privata, deve essere proprietario
  if (recap.visibility === "private" && recap.user_id !== userId) {
    return res.status(404).json({ error: "recap_not_found" });
  }

  res.json({ success: true, data: recap });
});

// 4. PROTECTED: Solo proprietario può modificare
router.put("/:id", isAuthenticated, validateUpdateRecap, async (req, res) => {
  const recap = await recapDao.getRecapById(parseInt(id), req.user.id);

  // CHECK 1: Recap exists?
  if (!recap) {
    return res.status(404).json({ error: "recap_not_found" });
  }

  // CHECK 2: È il proprietario?
  if (recap.user_id !== req.user.id) {
    return res.status(403).json({
      error: "forbidden_update_recap",
      message: "Forbidden: You do not have permission",
    });
  }

  // Procedi con update
  const { title, visibility, pages } = req.body;
  if (title || visibility) {
    await recapDao.updateRecap(parseInt(id), req.user.id, { title, visibility });
  }
  if (pages) {
    await recapDao.updateRecapPages(parseInt(id), pages);
  }

  res.json({ success: true, data: updatedRecap });
});
```

**Security Matrix:**

| Operazione            | Autenticato? | Proprietario? | Visibilità? | Risultato          |
| --------------------- | ------------ | ------------- | ----------- | ------------------ |
| GET /public           | ❌           | -             | public      | ✅ 200             |
| GET /public (private) | ❌           | -             | private     | ❌ 404             |
| GET /my               | ✅           | ANY           | ANY         | ✅ 200 (solo suoi) |
| POST / (create)       | ✅           | -             | -           | ✅ 201             |
| PUT /:id              | ✅           | ✅            | ANY         | ✅ 200             |
| PUT /:id              | ✅           | ❌            | ANY         | ❌ 403             |
| DELETE /:id           | ✅           | ✅            | ANY         | ✅ 200             |
| DELETE /:id           | ✅           | ❌            | ANY         | ❌ 403             |

### 4.4 Data Integrity: Complex Updates with updateRecapPages

**File**: [server/dao/recapDao.js](server/dao/recapDao.js) - updateRecapPages()

Questo è il **cuore della robustezza** in edit mode:

```javascript
export async function updateRecapPages(recapId, pages) {
  const db = await openDatabase();
  try {
    // 1. Carica pagine esistenti
    const existingPages = await db.all(`SELECT id FROM recap_pages WHERE recap_id = ? ORDER BY page_number`, [recapId]);

    const existingIds = existingPages.map((p) => p.id);
    const incomingIds = pages.filter((p) => p.id).map((p) => p.id);

    // ===== PHASE 1: Update existing pages =====
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (page.id && existingIds.includes(page.id)) {
        // Usa temporary negative page_number per evitare UNIQUE constraint violation
        await db.run(
          `UPDATE recap_pages 
          SET background_image_id = ?, text_field_1 = ?, text_field_2 = ?, text_field_3 = ?, page_number = ?
          WHERE id = ? AND recap_id = ?`,
          [
            page.background_image_id,
            page.text_field_1 || null,
            page.text_field_2 || null,
            page.text_field_3 || null,
            -(i + 1),
            page.id,
            recapId,
          ]
        );
      }
    }

    // ===== PHASE 2: Finalize page numbers =====
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (page.id && existingIds.includes(page.id)) {
        await db.run(`UPDATE recap_pages SET page_number = ? WHERE id = ? AND recap_id = ?`, [i + 1, page.id, recapId]);
      } else if (!page.id) {
        // ===== INSERT new pages =====
        await db.run(
          `INSERT INTO recap_pages (recap_id, page_number, background_image_id, text_field_1, text_field_2, text_field_3)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            recapId,
            i + 1,
            page.background_image_id,
            page.text_field_1 || null,
            page.text_field_2 || null,
            page.text_field_3 || null,
          ]
        );
      }
    }

    // ===== PHASE 3: Delete removed pages =====
    const pagesToDelete = existingIds.filter((id) => !incomingIds.includes(id));
    for (const pageId of pagesToDelete) {
      await db.run(`DELETE FROM recap_pages WHERE id = ? AND recap_id = ?`, [pageId, recapId]);
    }

    return true;
  } finally {
    await db.close();
  }
}
```

**Brilliance of This Algorithm:**

1. **Temporary Negative Numbers**: Evita UNIQUE constraint violation durante reorder
2. **Three Phases**: Update → Finalize numbers → Delete
3. **Selective Updates**: Solo le pagine modificate sono toccate
4. **Preserve IDs**: Le pagine esistenti mantengono ID (importante per relazioni future)

**Scenario Example:**

```
BEFORE: Pages 1, 2, 3, 4, 5
USER ACTIONS:
  - Delete page 2
  - Add page 6
  - Reorder: 1, 3, 5, 4, 6

PHASE 1 (Update Existing):
  ID=1 → page_number = -1 (temp)
  ID=3 → page_number = -2 (temp)
  ID=5 → page_number = -3 (temp)
  ID=4 → page_number = -4 (temp)

PHASE 2 (Finalize):
  ID=1 → page_number = 1 (final)
  ID=3 → page_number = 2 (final)
  ID=5 → page_number = 3 (final)
  ID=4 → page_number = 4 (final)
  INSERT page 6 → page_number = 5

PHASE 3 (Delete):
  DELETE ID=2

RESULT: Pages 1(old), 3(old), 5(old), 4(old), 6(new)
```

---

## 5. PERFORMANCE & UX OPTIMIZATIONS

### 5.1 Smart Data Caching: Don't Re-Fetch on Language Change

**Problem**: Se l'utente cambia lingua, dovremmo ricaricare tutti i dati per "tradurre" i campi?

**Solution**: NO! Perché i dati dinamici del DB sono già in inglese (standardizzato).

```javascript
// App.jsx - Nessun re-fetch necessario
const [language, setLanguage] = useState("en");

const handleLanguageSwitch = (lang) => {
  setLanguage(lang);
  i18n.changeLanguage(lang); // Solo cambio le stringhe UI
  // NON facciamo API call qui
};

// RecapList.jsx - I dati rimangono gli stessi
const [recaps, setRecaps] = useState([]);

useEffect(() => {
  // Fetch una volta sola
  const loadRecaps = async () => {
    const data = await getPublicRecaps(); // theme.name = "Travel" (EN)
    setRecaps(data);
  };
  loadRecaps();
}, []); // NO language dependency!

// Render: traduzione on-the-fly
return (
  <div>
    {recaps.map((recap) => (
      <div>
        <span>{t(`ui.visibility.${recap.visibility}`)}</span>
        // "public" → "Pubblico" (it) or "Public" (en) // Recap.theme_name rimane "Travel" (DB value)
      </div>
    ))}
  </div>
);
```

**Benefits:**

- ✅ **Zero Latency**: Cambio lingua istantaneo (no network delay)
- ✅ **Reduced API Calls**: Unica fetch, molteplici render
- ✅ **Bandwidth Saving**: Non ri-mandiamo stessi dati
- ✅ **User Experience**: Cambio lingua istantaneo come atteso

### 5.2 Error Handling via i18n Keys

**Problem**: Backend ritorna error_key (es: "auth_required"), come lo traduciamo?

**Solution**: Axios Interceptor aggiunge i18nKey

```javascript
// apiService.js interceptor
if (data.success === false && data.error) {
  const err = new Error("API Error");
  err.key = data.error; // "auth_required"
  err.i18nKey = `api_errors.${data.error}`; // "api_errors.auth_required"
  return Promise.reject(err);
}

// Componente
const handleLogin = async () => {
  try {
    await login(username, password);
  } catch (err) {
    // err.i18nKey = "api_errors.invalid_credentials"
    const localizedMsg = t(err.i18nKey);
    showError(localizedMsg);
  }
};
```

**Translation Files**:

```json
// locales/en/translation.json
{
  "api_errors": {
    "invalid_credentials": "Username or password incorrect",
    "auth_required": "You must be logged in",
    "forbidden_not_owner": "You cannot modify this recap",
    "forbidden_update_recap": "Forbidden: You do not have permission",
    "recap_not_found": "Recap not found"
  }
}

// locales/it/translation.json
{
  "api_errors": {
    "invalid_credentials": "Nome utente o password errata",
    "auth_required": "Devi essere loggato",
    "forbidden_not_owner": "Non puoi modificare questa recap",
    "forbidden_update_recap": "Accesso vietato: non hai permessi",
    "recap_not_found": "Recap non trovata"
  }
}
```

### 5.3 Responsive UI Loading States

RecapEditorPage gestisce 4 stati di loading diversi:

```javascript
const [loading, setLoading] = useState(true); // Initial load
const [saving, setSaving] = useState(false); // Save operation
const [error, setError] = useState(null); // Error display
const [currentPageIndex, setCurrentPageIndex] = useState(0);

// STATO 1: Initial Loading
if (loading) {
  return <Spinner />;
}

// STATO 2: Error (non recuperabile)
if (error && !recapData.theme_id) {
  return <ErrorDisplay error={error} />;
}

// STATO 3: Fully Loaded - Normal UX
<button disabled={saving || recapData.pages.length < 3}>
  {saving ? t("ui.editor.saving") : t("ui.editor.save_button")}
</button>;

// STATO 4: Saving - UX Feedback
{
  saving && <ProgressBar />;
}
```

---

## CONCLUSIONE

RecApp dimostra **architettura moderna full-stack**:

1. **Frontend**: React Context per state, i18next per i18n, Axios interceptors per API
2. **Backend**: Express con middleware pattern, Passport per auth, SQLite per persistence
3. **Security**: Ownership checks, session-based auth, UNIQUE constraints
4. **Performance**: SQL aggregation, smart caching, lazy validation
5. **UX**: Multi-language, error translation, responsive loading states

La complessità risiede nel **RecapEditorPage**: gestire 3 modalità diverse (edit/template/clone), sincronizzare state complesso (pagine array), e garantire data integrity durante complex updates via updateRecapPages.

---

**Document Generated**: 2025-01-11  
**For**: University Exam Presentation  
**Version**: 1.0 - Complete Technical Analysis
