'use client';

import { useEffect } from 'react';

interface ModalProps {
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({
  text,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ModalProps) {
  // Блокируем скролл фона, пока открыта модалка.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <p className="modal-text">{text}</p>
        <div className="modal-actions">
          <button type="button" className="cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
