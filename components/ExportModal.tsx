import React, { useState } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        if (name.trim()) {
            onConfirm(name);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-800 border border-cyan-700 rounded-lg p-8 shadow-2xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-cyan-300 mb-4">Exportar para PDF</h2>
                <p className="text-slate-400 mb-6">Por favor, digite seu nome para incluí-lo no arquivo PDF exportado.</p>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu Nome"
                    className="w-full bg-slate-900/50 border border-cyan-700 text-cyan-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-slate-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-slate-600 text-slate-300 font-bold rounded-md hover:bg-slate-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!name.trim()}
                        className="px-6 py-2 bg-cyan-600 text-slate-900 font-bold rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Confirmar e Exportar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;