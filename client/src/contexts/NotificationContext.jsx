import { createContext, useContext, useState, useCallback, useMemo } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState({
    show: false,
    type: null,
    title: null,
    message: null,
  });

  const [modal, setModal] = useState({
    show: false,
    type: null,
    title: null,
    message: null,
    onConfirm: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Toast methods
  const showToast = useCallback((type, title, message) => {
    setToast({ show: true, type, title, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, type: null, title: null, message: null });
  }, []);

  // Modal methods
  const showModal = useCallback((type, title, message, onConfirm = null) => {
    setModal({ show: true, type, title, message, onConfirm });
  }, []);

  const hideModal = useCallback(() => {
    setModal({ show: false, type: null, title: null, message: null, onConfirm: null });
  }, []);

  const showError = useCallback((title, message) => {
    setToast({ show: true, type: "error", title, message });
  }, []);

  const showSuccess = useCallback((title, message) => {
    setToast({ show: true, type: "success", title, message });
  }, []);

  const showWarning = useCallback((title, message) => {
    setToast({ show: true, type: "warning", title, message });
  }, []);

  const showInfo = useCallback((title, message) => {
    setToast({ show: true, type: "info", title, message });
  }, []);

  const confirmAction = useCallback((title, message, onConfirm) => {
    setModal({ show: true, type: "confirm", title, message, onConfirm });
  }, []);

  const value = useMemo(
    () => ({
      // Toast
      toast,
      showToast,
      hideToast,
      showError,
      showSuccess,
      showWarning,
      showInfo,

      // Modal
      modal,
      showModal,
      hideModal,
      confirmAction,

      // Loading state
      isLoading,
      setIsLoading,
    }),
    [
      toast,
      showToast,
      hideToast,
      showError,
      showSuccess,
      showWarning,
      showInfo,
      modal,
      showModal,
      hideModal,
      confirmAction,
      isLoading,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
