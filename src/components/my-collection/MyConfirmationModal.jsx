/**
 * ============================================================
 * MY CONFIRMATION MODAL
 * ============================================================
 *
 * Modal genérico utilizado pelas funcionalidades da
 * Minha Coleção.
 *
 * Casos de uso:
 *
 * - Logout
 * - Remoção de volumes
 * - Remoção de coleções
 * - Alteração de avatar
 * - Alteração de banner
 * - Ações destrutivas futuras
 *
 * ============================================================
 */

import { useLockBodyScroll } from "../../hooks/my-collection-hooks/useLockBodyScroll";
import "../../styles/my-collection/my-confirmation-modal.css";

export default function MyConfirmationModal({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
}) {
  useLockBodyScroll(open);

  if (!open) {
    return null;
  }

  return (
    <div
      className="confirmationModalOverlay"
      onClick={onClose}
    >
      <div
        className="confirmationModal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>

        <p>{message}</p>

        <div className="confirmationModalActions">
          <button
            className="confirmationCancelBtn"
            onClick={onClose}
          >
            {cancelText}
          </button>

          <button
            className="confirmationConfirmBtn"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}