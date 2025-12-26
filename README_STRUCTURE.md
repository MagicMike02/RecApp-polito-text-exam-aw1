# Struttura Estesa del Progetto

Questo file descrive in dettaglio la struttura del progetto, includendo tutte le directory e i file principali.

## Struttura del Progetto

```
project/
├── README.md                # Documentazione principale del progetto
├── README_STRUCTURE.md      # Struttura estesa del progetto
├── client/                  # Frontend React
│   ├── eslint.config.js     # Configurazione ESLint
│   ├── index.html           # File HTML principale
│   ├── package.json         # Dipendenze e script del frontend
│   ├── README.md            # Documentazione del frontend
│   ├── vite.config.js       # Configurazione di Vite
│   ├── public/              # Risorse statiche
│   │   ├── images/          # Immagini organizzate per tema
│   │   │   ├── libri/       # Immagini per il tema "libri"
│   │   │   ├── musica/      # Immagini per il tema "musica"
│   │   │   ├── viaggi/      # Immagini per il tema "viaggi"
│   ├── src/                 # Codice sorgente React
│   │   ├── App.css          # Stile principale dell'applicazione
│   │   ├── App.jsx          # Componente principale React
│   │   ├── index.css        # Stile globale
│   │   ├── main.jsx         # Entry point del frontend
│   │   ├── assets/          # Risorse aggiuntive
│   │   ├── components/      # Componenti React riutilizzabili
│   │   │   ├── Navbar.jsx           # Barra di navigazione
│   │   │   ├── ProtectedRoute.jsx   # Rotte protette
│   │   │   ├── RecapCard.jsx        # Componente per visualizzare un riepilogo
│   │   │   ├── RecapSlideshow.jsx   # Componente per lo slideshow
│   │   ├── contexts/        # Context API per lo stato globale
│   │   │   ├── AuthContext.jsx      # Contesto per l'autenticazione
│   │   ├── pages/           # Pagine principali
│   │   │   ├── CreateRecapPage.jsx  # Pagina per creare un riepilogo
│   │   │   ├── HomePage.jsx         # Pagina iniziale
│   │   │   ├── LoginPage.jsx        # Pagina di login
│   │   │   ├── ProfilePage.jsx      # Pagina del profilo utente
│   │   │   ├── RecapEditorPage.jsx  # Pagina per modificare un riepilogo
│   │   │   ├── RecapViewPage.jsx    # Pagina per visualizzare un riepilogo
│   │   ├── services/        # Chiamate API
│   │   │   ├── API.js              # Funzioni per interagire con il backend
│   │   ├── utils/           # Funzioni di utilità
│   │   ├── theme.css        # Variabili CSS globali
├── server/                  # Backend Express
│   ├── config.js            # Configurazione del server
│   ├── index.mjs            # Entry point del backend
│   ├── jest.config.js       # Configurazione Jest per i test
│   ├── package.json         # Dipendenze e script del backend
│   ├── PROJECT_STRUCTURE.md # Documentazione interna
│   ├── test-api.ps1         # Script per testare le API
│   ├── dao/                 # Data Access Objects
│   │   ├── imageDao.js      # DAO per le immagini
│   │   ├── recapDao.js      # DAO per i riepiloghi
│   │   ├── templateDao.js   # DAO per i template
│   │   ├── themeDao.js      # DAO per i temi
│   │   ├── userDao.js       # DAO per gli utenti
│   ├── database/            # Configurazione e script del database
│   │   ├── db.js            # Configurazione SQLite
│   │   ├── scripts/         # Script per il database
│   │   │   ├── create_tables.mjs  # Creazione delle tabelle
│   │   │   ├── seed_db.mjs        # Popolamento del database
│   │   │   ├── test_db_path.mjs   # Percorso di test del database
│   ├── log/                 # Log del server
│   │   ├── 2025-12-23.txt   # Log del 23 dicembre 2025
│   ├── middlewares/         # Middleware per Express
│   │   ├── auth.js          # Middleware per l'autenticazione
│   │   ├── errorHandler.js  # Middleware per la gestione degli errori
│   │   ├── validators/      # Validatori per le richieste
│   │   │   ├── authValidators.js  # Validatori per l'autenticazione
│   │   │   ├── recapValidators.js # Validatori per i riepiloghi
│   │   │   ├── templateValidators.js # Validatori per i template
│   │   │   ├── themeValidators.js   # Validatori per i temi
│   ├── routes/              # Rotte API
│   │   ├── authRoutes.js    # Rotte per l'autenticazione
│   │   ├── imageRoutes.js   # Rotte per le immagini
│   │   ├── recapRoutes.js   # Rotte per i riepiloghi
│   │   ├── themeRoutes.js   # Rotte per i temi
│   ├── tests/               # Test del backend
│   │   ├── auth.test.js     # Test per l'autenticazione
│   │   ├── images.test.js   # Test per le immagini
│   │   ├── recaps.test.js   # Test per i riepiloghi
│   │   ├── themes.test.js   # Test per i temi
│   ├── utils/               # Funzioni di utilità
│   │   ├── crypto.js        # Funzioni per l'hashing
│   │   ├── logger.js        # Logger
│   │   ├── testLogger.js    # Logger per i test
```

---

## Note

- Questa struttura riflette lo stato attuale del progetto e può essere aggiornata in futuro.
- Per ulteriori dettagli, consultare i file di documentazione specifici nelle rispettive directory.
