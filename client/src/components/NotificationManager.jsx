import { useNotification } from "../contexts/NotificationContext";
import Toast from "./Toast";
import ResultModal from "./ResultModal";
import { useTranslation } from "react-i18next";

export const NotificationManager = () => {
  const { t } = useTranslation();
  const { toast, hideToast, modal, hideModal, isLoading, startLoading, stopLoading } = useNotification();

  const handleModalConfirm = async () => {
    if (modal.onConfirm) {
      startLoading();
      try {
        await modal.onConfirm();
      } catch (error) {
        console.error("Errore nella conferma:", error);
      } finally {
        stopLoading();
        hideModal();
      }
    }
  };

  return (
    <>
      <Toast show={toast.show} type={toast.type} title={toast.title} message={toast.message} onClose={hideToast} />

      <ResultModal
        show={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={hideModal}
        onConfirm={handleModalConfirm}
        confirmText={modal.type === "confirm" ? t("ui.actions.confirm") : t("ui.actions.ok")}
        cancelText={t("ui.actions.cancel")}
        isLoading={isLoading}
      />
    </>
  );
};

export default NotificationManager;
