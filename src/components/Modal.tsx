// src/components/Modal.tsx
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="modal-backdrop"
      // Overlay para escurecer a tela
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      onClick={onClose} // Fecha o modal ao clicar fora
    >
      <div
        id="modal-content"
        // Impede que o clique dentro do modal o feche
        onClick={(e) => e.stopPropagation()}
        // Container do pop-up
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-end p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}