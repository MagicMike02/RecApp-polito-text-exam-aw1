import { Modal, Button } from "react-bootstrap";
import "./ResultModal.css";

function ResultModal({
  show,
  type = "success",
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Conferma",
  cancelText = "Annulla",
  isLoading = false,
}) {
  const isConfirmMode = type === "confirm";

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" className="result-modal">
      <Modal.Body className={`result-modal-body ${!isConfirmMode ? `result-modal-${type}` : "result-modal-confirm"}`}>
        <div className="result-modal-content">
          {!isConfirmMode && (
            <div className={`result-modal-icon result-modal-icon-${type}`}>
              {type === "success" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              )}
            </div>
          )}
          {isConfirmMode && (
            <div className="result-modal-icon result-modal-icon-confirm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          )}
          <h5 className={`result-modal-title ${isConfirmMode ? "result-modal-title-confirm" : ""}`}>{title}</h5>
          <p className="result-modal-message">{message}</p>
        </div>
      </Modal.Body>
      <Modal.Footer className={`result-modal-footer ${type === "error" ? "result-modal-footer-error" : ""}`}>
        {isConfirmMode ? (
          <>
            <Button className="result-modal-btn result-modal-btn-cancel" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button className="result-modal-btn result-modal-btn-danger" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? "Eliminazione..." : confirmText}
            </Button>
          </>
        ) : (
          <Button className={`result-modal-btn result-modal-btn-${type}`} onClick={onClose}>
            {type === "success" ? "Ok" : "Chiudi"}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ResultModal;
