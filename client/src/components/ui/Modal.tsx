import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export default function Modal({ open, title, children, onClose, footer }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="cg-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="cg-modal-backdrop" onClick={onClose} />
      <div className="cg-modal-dialog">
        <div className="cg-modal-panel">
          <div className="cg-modal-header">
            <h5 className="cg-modal-title">{title}</h5>
            <button type="button" className="cg-modal-close" aria-label="Close" onClick={onClose}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className="cg-modal-body">{children}</div>
          {footer ? <div className="cg-modal-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
