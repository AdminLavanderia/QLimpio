import React from 'react';
import { Order } from '../types';

interface PostOrderCreationModalProps {
    order: Order;
    onClose: () => void;
    onGoToAnotador: () => void;
    onGoToPayment: () => void;
}

export const PostOrderCreationModal: React.FC<PostOrderCreationModalProps> = ({ order, onClose, onGoToAnotador, onGoToPayment }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md text-center p-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="mt-5 text-xl font-bold font-display text-text-main">¡Pedido Creado!</h3>
                <p className="mt-2 text-text-secondary">
                    El pedido <span className="font-semibold text-primary">#{order.numericId}</span> ha sido creado exitosamente.
                </p>
                <p className="mt-4 text-text-secondary">¿Qué desea hacer ahora?</p>
                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={onGoToAnotador}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Ir al Anotador
                    </button>
                     <button
                        onClick={onGoToPayment}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-status-green text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Registrar un Pago
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Volver al Panel
                    </button>
                </div>
            </div>
        </div>
    );
};