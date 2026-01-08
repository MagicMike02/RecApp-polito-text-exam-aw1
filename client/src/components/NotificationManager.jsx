import { useNotification } from "../contexts/NotificationContext";
import Toast from "./Toast";
import ResultModal from "./ResultModal";

export const NotificationManager = () => {
  const { toast, hideToast, modal, hideModal, isLoading, setIsLoading } = useNotification();

  const handleModalConfirm = async () => {
    if (modal.onConfirm) {
      setIsLoading(true);
      try {
        await modal.onConfirm();
      } catch (error) {
        console.error("Errore nella conferma:", error);
      } finally {
        setIsLoading(false);
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
