import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationManager from "./components/NotificationManager";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RecapViewPage from "./pages/RecapViewPage";
import CreateRecapPage from "./pages/CreateRecapPage";
import RecapEditorPage from "./pages/RecapEditorPage";

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Navbar />
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recaps/:id" element={<RecapViewPage />} />

        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateRecapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/new"
          element={
            <ProtectedRoute>
              <RecapEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <RecapEditorPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <NotificationManager />
    </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
