# FRONTEND IMPLEMENTATION INSTRUCTIONS: "Il mio anno in..."

You are an expert React Developer.
**CONTEXT:** The Backend (Node.js/Express + SQLite) is ALREADY IMPLEMENTED and functioning.
**GOAL:** Build the React Frontend to consume the existing APIs and fulfill the exam requirements.

## 1. CONSTRAINTS & RULES

- **DO NOT modify the `/server` directory.** Treat the API as an immutable contract.
- **Strict Mode:** React is in Strict Mode. Handle `useEffect` double-invocations correctly.
- **HTTP Requests:**
  - Use `fetch` or `axios`.
  - **CRITICAL:** Always set `credentials: 'include'` (or `withCredentials: true`) to handle session cookies.
  - Handle 401 (Unauthorized) by redirecting to Login.
- **Styling:** Use CSS Modules or React-Bootstrap. The layout must be desktop-friendly.

## 2. DATA MODELS (Read-Only Context)

The backend provides data in JSON format matching these structures. Use this to design your Frontend Interfaces/PropTypes:

1.  **`Summary`**: `{ id, title, visibility, original_summary_id, theme_id, author_name, pages: [...] }`
2.  **`Page`**: `{ id, background_url, text_1, text_2, text_3, layout_type }`
    - _Note:_ `layout_type` determines where the text slots are positioned (e.g., 'CENTER', 'TOP_DOWN').
3.  **`Theme`**: `{ id, name, backgrounds: [...] }`
4.  **`Background`**: `{ id, url, slots_count, layout_type }`

## 3. FRONTEND ARCHITECTURE

### A. Routing (React Router)

- `/` (Home): List of public summaries.
- `/login`: Login form.
- `/profile`: List of user's own summaries (private & public).
- `/view/:id`: Slideshow viewer (Read-only).
- `/create`: Setup screen (choose Theme OR choose existing summary to clone).
- `/editor/:id` (or `/create/edit`): The main workspace to edit pages.

### B. State Management

- **Auth Context:** Global state for `user` (loggedIn, name, id).
- **Editor State:** This is complex. When editing a summary, use a local reducer or specific hook to manage:
  - Current list of pages.
  - Selected background for the current page.
  - Text inputs.
  - _Constraint:_ Minimum 3 pages required to save.

## 4. KEY COMPONENT LOGIC

### The Viewer (Slideshow)

- Must display one page at a time.
- Navigation buttons: "Next" / "Previous".
- **Overlay Logic:** You must implement CSS logic to position text on top of the image based on the `layout_type` received from the API.
  - _Example:_ If `layout_type === 'CENTER'`, the text div should have `top: 50%; left: 50%; translate: -50% -50%`.

### The Editor

- **Separation of concerns:**
  - **Sidebar:** Show thumbnails of all pages. Allow reordering (up/down) and deleting.
  - **Main Area:** Live preview of the current page.
  - **Controls:** Inputs to edit text `text_1`, `text_2` (based on how many slots the background allows) and a grid to pick a different background (filtered by the current Theme).
- **Derivation:** If the user starts from an existing summary, pre-fill the state with that summary's data but clear the `id` (so it saves as new).

## 5. API CONSUMPTION STRATEGY

Since you cannot see the server code, assume standard REST patterns. If a request fails, assume the body format is wrong and ask to correct it.

- `GET /api/sessions/current` -> Check auth.
- `POST /api/sessions` -> Login.
- `GET /api/summaries` -> Public list.
- `GET /api/summaries/:id` -> Single summary details.
- `POST /api/summaries` -> Create new. Body usually expects: `{ title, themeId, pages: [...] }`.

## 6. QUALITY CHECKLIST

- [ ] No `console.errors` (except network errors).
- [ ] "Derived from X" is visible if `original_summary_id` is present.
- [ ] User cannot save if pages < 3.
- [ ] Images are loaded correctly from the server public URL.
