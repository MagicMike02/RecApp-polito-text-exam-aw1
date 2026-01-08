import { useNotification } from "../contexts/NotificationContext";
import Toast from "./Toast";
import ResultModal from "./ResultModal";

export const NotificationManager = () => {
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
        confirmText={modal.type === "confirm" ? "Conferma" : "Ok"}
        cancelText="Annulla"
        isLoading={isLoading}
      />
    </>
  );
};

export default NotificationManager;
