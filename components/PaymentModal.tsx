import React, { useState, useMemo } from 'react';
import { actions, useStore } from '../services/store';
import { Order, PaymentMethod, PAYMENT_METHODS } from '../types';
import { XIcon, StarIcon } from './icons';

export const PaymentModal = ({ order, onClose }: { order: Order; onClose: () => void; }) => {
    const { clients, loyaltyConfig } = useStore();
    const client = clients.find(c => c.id === order.clientId);
    
    const amountDueAfterDiscounts = order.totalAmount - (order.discount || 0);
    const totalAmountDue = amountDueAfterDiscounts - order.paidAmount;

    const [paymentDetails, setPaymentDetails] = useState({
        amountPaid: totalAmountDue,
        method: 'Efectivo' as PaymentMethod,
        isAdvance: false,
        pointsToRedeem: 0,
    });
    
    const redeemableValue = useMemo(() => {
        return Math.floor(paymentDetails.pointsToRedeem * loyaltyConfig.pesoValuePerPoint);
    }, [paymentDetails.pointsToRedeem, loyaltyConfig.pesoValuePerPoint]);
    
    const finalAmountToPay = totalAmountDue - redeemableValue;

    const handleDetailChange = (field: keyof typeof paymentDetails, value: any) => {
        setPaymentDetails(prev => ({...prev, [field]: value}));
    };
    
    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value, 10) || 0;
        if (value < 0) value = 0;
        if (client && value > client.puntos_actuales) {
            value = client.puntos_actuales;
        }
        const valueInPesos = value * loyaltyConfig.pesoValuePerPoint;
        if (valueInPesos > totalAmountDue) {
             value = Math.floor(totalAmountDue / loyaltyConfig.pesoValuePerPoint);
        }
        handleDetailChange('pointsToRedeem', value);
    };

    const handlePayment = () => {
        const paymentData = {
            orderId: order.id,
            amountPaid: finalAmountToPay, // User always pays the final calculated amount
            method: paymentDetails.method,
            isAdvance: paymentDetails.isAdvance,
            pointsToRedeem: paymentDetails.pointsToRedeem,
        };

        if (paymentData.amountPaid <= 0 && paymentData.pointsToRedeem > 0) {
            // Pure points payment
        } else if (paymentData.amountPaid < finalAmountToPay && !paymentData.isAdvance) {
             alert("El monto pagado es menor al total. Marque como 'Adelanto' o complete el pago.");
             return;
        }

        const success = actions.processPayment(paymentData);
        if (success) {
            alert('Pago registrado!');
            onClose();
        }
        // Error alerts are handled inside processPayment
    };
    
    if (!client) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold font-display text-text-main">Registrar Pago - Pedido #{order.numericId}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XIcon /></button>
                </header>
                <main className="p-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between"><span>Subtotal:</span><span>{order.totalAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>
                        {order.discount && order.discount > 0 && <div className="flex justify-between text-green-600"><span>Descuento Promo:</span><span>-{order.discount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>}
                        <div className="flex justify-between font-bold border-t pt-2"><span>Total Pedido:</span><span>{amountDueAfterDiscounts.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>
                         {order.paidAmount > 0 && <div className="flex justify-between text-blue-600"><span>Pagos Anteriores:</span><span>-{order.paidAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>}
                        <div className="flex justify-between font-bold text-lg text-red-600 border-t pt-2"><span>Saldo a Pagar:</span><span>{totalAmountDue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="method" className="block text-sm font-medium text-gray-700">Método de Pago</label>
                            <select id="method" name="method" value={paymentDetails.method} onChange={e => handleDetailChange('method', e.target.value as PaymentMethod)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 focus:ring-primary focus:border-primary">
                                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center pt-5">
                             <input id="isAdvance" name="isAdvance" type="checkbox" checked={paymentDetails.isAdvance} onChange={e => handleDetailChange('isAdvance', e.target.checked)} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"/>
                             <label htmlFor="isAdvance" className="font-medium text-gray-700 ml-2">Es un adelanto</label>
                        </div>
                    </div>
                   

                    {client.participa_fidelizacion && client.puntos_actuales > 0 && (
                        <div className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="points" className="font-semibold flex items-center"><StarIcon className="w-5 h-5 mr-2 text-yellow-400"/> Canjear Puntos</label>
                                <span className="text-sm text-text-secondary">Disponibles: {client.puntos_actuales}</span>
                            </div>
                            <input
                                type="range"
                                id="points"
                                min="0"
                                max={client.puntos_actuales}
                                value={paymentDetails.pointsToRedeem}
                                onChange={handlePointsChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between items-center">
                                <input 
                                    type="number" 
                                    value={paymentDetails.pointsToRedeem} 
                                    onChange={handlePointsChange}
                                    className="w-24 p-1 border rounded"
                                />
                                <span className="font-semibold text-red-600">-{redeemableValue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="p-4 bg-blue-50 rounded-lg text-right border-t-4 border-primary">
                        <p className="text-sm text-text-secondary">TOTAL A PAGAR HOY</p>
                        <p className="text-3xl font-bold text-primary">{finalAmountToPay.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
                    </div>
                </main>
                <footer className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-white border mr-2 hover:bg-gray-100">Cancelar</button>
                    <button type="button" onClick={handlePayment} className="px-6 py-2 rounded-lg text-white bg-status-green hover:bg-green-700 font-bold">Confirmar Pago</button>
                </footer>
            </div>
        </div>
    );
};