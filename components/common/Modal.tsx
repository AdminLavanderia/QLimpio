
import React from 'react';
import { XIcon } from '../icons';

interface ModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold font-display text-text-main">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <XIcon />
                    </button>
                </header>
                {children}
            </div>
        </div>
    );
};

interface ModalFormProps {
    onSave: () => void;
    onCancel: () => void;
    children: React.ReactNode;
}

export const ModalForm: React.FC<ModalFormProps> = ({ onSave, onCancel, children }) => {
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="flex flex-col flex-1 min-h-0">
            <main className="p-6 overflow-y-auto flex-1 space-y-4">
                {children}
            </main>
            <footer className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-700 bg-white border mr-2 hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-blue-600">Guardar</button>
            </footer>
        </form>
    );
};

export const FormInput = ({ label, id, ...props }: { label: string, id: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-text-secondary">{label}</label>
        <input id={id} {...props} className="bg-gray-50 border border-gray-300 text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
    </div>
);

export const FormSelect = ({ label, id, children, ...props }: { label: string, id: string, children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div>
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-text-secondary">{label}</label>
        <select id={id} {...props} className="bg-gray-50 border border-gray-300 text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
            {children}
        </select>
    </div>
);

export const FormTextarea = ({ label, id, ...props }: { label: string, id: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <div>
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-text-secondary">{label}</label>
        <textarea id={id} {...props} rows={4} className="bg-gray-50 border border-gray-300 text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"></textarea>
    </div>
);