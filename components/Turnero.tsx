
import React, { useState, useMemo } from 'react';
import { KANBAN_COLUMNS } from '../constants';
import { actions, useStore } from '../services/store';
import { Order, OrderStatus } from '../types';
import { KanbanCard } from './KanbanCard';
import { XIcon } from './icons';

export const Turnero = ({ openOrderDetails }: { openOrderDetails: (order: Order) => void }) => {
    const { orders, filters } = useStore();

    const activeFilter = filters.turnero;
    const todayStr = new Date().toISOString().split('T')[0];

    const filteredOrders = useMemo(() => {
        if (!activeFilter.status && !activeFilter.date) {
            return orders;
        }
        return orders.filter((order: Order) => {
            const statusMatch = activeFilter.status ? order.status === activeFilter.status : true;
            const dateMatch = activeFilter.date === 'today' ? order.receptionDate === todayStr : true;
            return statusMatch && dateMatch;
        });
    }, [orders, activeFilter, todayStr]);

    const provideDragStartHandler = (orderId: string) => (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("orderId", orderId);
    };

    const provideDropHandler = (status: OrderStatus) => (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData("orderId");
        if(orderId) {
            actions.moveOrder(orderId, status);
        }
    };
    
    const handleManualMove = (orderId: string, targetStatus: OrderStatus) => {
        actions.moveOrder(orderId, targetStatus);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 p-4 bg-white border-b rounded-t-lg space-y-4">
                <input
                    type="text"
                    placeholder="Buscar por Nº o Cliente..."
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                {(activeFilter.status || activeFilter.date) && (
                    <div className="flex items-center justify-between p-2 bg-blue-100 text-primary rounded-lg">
                        <p className="text-sm font-semibold">
                            Filtro activo: {activeFilter.status && `Estado: "${activeFilter.status}"`} {activeFilter.status && activeFilter.date && ' y '} {activeFilter.date === 'today' && 'Pedidos de Hoy'}. Mostrando {filteredOrders.length} resultados.
                        </p>
                        <button onClick={actions.clearTurneroFilter} className="flex items-center font-bold hover:text-blue-700">
                            <XIcon className="w-4 h-4 mr-1" />
                            Limpiar
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-x-auto p-4">
                <div className="flex space-x-4 h-full">
                    {KANBAN_COLUMNS.map((status: OrderStatus, index: number) => {
                        const ordersInColumn = filteredOrders.filter((o: Order) => o.status === status);
                        if (ordersInColumn.length === 0 && (activeFilter.status || activeFilter.date)) {
                            return null;
                        }

                        const prevStatus = index > 0 ? KANBAN_COLUMNS[index - 1] : undefined;
                        const nextStatus = index < KANBAN_COLUMNS.length - 1 ? KANBAN_COLUMNS[index + 1] : undefined;

                        return (
                            <div
                                key={status}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={provideDropHandler(status)}
                                className="flex-shrink-0 w-80 bg-kanban-col rounded-lg h-full flex flex-col"
                            >
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-display font-bold text-text-main flex items-center">
                                        {status}
                                        <span className="ml-2 text-sm font-sans font-semibold bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center">
                                            {ordersInColumn.length}
                                        </span>
                                    </h3>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                                    {ordersInColumn.map((order: Order) => (
                                        <KanbanCard 
                                            key={order.id} 
                                            order={order} 
                                            onDragStart={provideDragStartHandler(order.id)}
                                            onClick={() => openOrderDetails(order)}
                                            onMovePrev={prevStatus ? () => handleManualMove(order.id, prevStatus) : undefined}
                                            onMoveNext={nextStatus ? () => handleManualMove(order.id, nextStatus) : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};