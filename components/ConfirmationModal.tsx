
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  type?: 'danger' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Confirm Delete",
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-scaleUp">
        <div className="p-8 text-center">
          <div className={`w-20 h-20 ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'} rounded-full flex items-center justify-center mx-auto mb-6 text-3xl`}>
            <i className={`fa-solid ${type === 'danger' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}`}></i>
          </div>
          
          <h3 className="text-xl font-black text-gray-800 uppercase italic mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex border-t border-gray-100">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-4 text-xs font-black uppercase tracking-widest text-white transition-all ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
