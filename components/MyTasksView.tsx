
import React from 'react';
import { useStore } from '../services/store';
import { Order, OrderStatus, Client } from '../types';

export const MyTasksView = ({ openOrderDetails }: { openOrderDetails: (order: Order) => void }) => {
    const { orders, currentUser, clients } = useStore();

    if (!currentUser) return null;

    const myTasks = orders.filter(
        (order: Order) => order.assignedTo === currentUser.id && order.status !== OrderStatus.Delivered
    ).sort((a: Order, b: Order) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display text-text-main">
                Tus Tareas Pendientes ({myTasks.length})
            </h2>
            {myTasks.length === 0 ? (
                 <div className="text-center py-24 bg-white rounded-lg shadow-sm">
                    <p className="text-xl text-text-secondary">¡Felicidades!</p>
                    <p className="text-lg text-text-secondary mt-2">No tienes tareas pendientes.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {myTasks.map((order: Order) => {
                            const client = clients.find((c: Client) => c.id === order.clientId);
                            const isDueToday = order.deliveryDate === new Date().toISOString().split('T')[0];
                             return (
                                <li key={order.id} onClick={() => openOrderDetails(order)} className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors">
                                    <div>
                                        <p className={`font-bold text-lg ${isDueToday ? 'text-status-red' : 'text-primary'}`}>Pedido #{order.numericId}</p>
                                        <p className="text-sm text-text-main font-medium">{client?.name || 'Cliente desconocido'}</p>
                                        <p className="text-xs text-text-secondary mt-1">Estado actual: <span className="font-semibold">{order.status}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">Entrega</p>
                                        <p className={`font-bold text-lg ${isDueToday ? 'text-status-red' : 'text-text-main'}`}>{new Date(order.deliveryDate + 'T00:00:00').toLocaleDateString('es-AR', {day: '2-digit', month: 'short'})}</p>
                                    </div>
                                </li>
                             );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};