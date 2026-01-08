import { createContext, useContext, useState } from "react";

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
  const showToast = (type, title, message) => {
    setToast({ show: true, type, title, message });
  };

  const hideToast = () => {
    setToast({ show: false, type: null, title: null, message: null });
  };

  // Modal methods
  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ show: true, type, title, message, onConfirm });
  };

  const hideModal = () => {
    setModal({ show: false, type: null, title: null, message: null, onConfirm: null });
  };

  const showError = (title, message) => {
    showToast("error", title, message);
  };

  const showSuccess = (title, message) => {
    showToast("success", title, message);
  };

  const showWarning = (title, message) => {
    showToast("warning", title, message);
  };

  const showInfo = (title, message) => {
    showToast("info", title, message);
  };

  const confirmAction = (title, message, onConfirm) => {
    showModal("confirm", title, message, onConfirm);
  };

  const value = {
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
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
