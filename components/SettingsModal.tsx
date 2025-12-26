import React from 'react';
import { CloseIcon, DangerIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetLanguage: () => void;
  onResetAll: () => void;
  currentLanguage: string | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onResetLanguage, onResetAll, currentLanguage }) => {
  if (!isOpen) return null;

  const handleResetLang = () => {
    if (window.confirm(`Bist du sicher, dass du deinen gesamten Fortschritt für ${currentLanguage} zurücksetzen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      onResetLanguage();
      onClose();
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Bist du absolut sicher, dass du deinen gesamten Fortschritt für ALLE Sprachen zurücksetzen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      onResetAll();
      onClose();
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-200">Einstellungen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">Hier kannst du deinen Lernfortschritt verwalten. Sei vorsichtig, diese Aktionen können nicht rückgängig gemacht werden.</p>
          
          <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg space-y-3">
             <div className="flex items-start gap-3">
                <DangerIcon />
                <h3 className="text-lg font-semibold text-red-400">Gefahrenzone</h3>
             </div>
             <button
                onClick={handleResetLang}
                disabled={!currentLanguage}
                className="w-full p-2 bg-red-600/50 text-white font-semibold rounded-md border border-red-500 hover:bg-red-600/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fortschritt für {currentLanguage || '...'} zurücksetzen
              </button>
              <button
                onClick={handleResetAll}
                className="w-full p-2 bg-red-800/60 text-white font-semibold rounded-md border border-red-700 hover:bg-red-800/80 transition-colors"
              >
                Gesamten Fortschritt zurücksetzen
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
