
import React from 'react';
import { Order, ClientType, Client, Employee } from '../types';
import { useStore } from '../services/store';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface KanbanCardProps {
    order: Order;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onClick: () => void;
    onMovePrev?: () => void;
    onMoveNext?: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ order, onDragStart, onClick, onMovePrev, onMoveNext }) => {
    const { clients, employees } = useStore();
    const client = clients.find((c: Client) => c.id === order.clientId);
    const assignedEmployee = employees.find((e: Employee) => e.id === order.assignedTo);

    const isDueToday = order.deliveryDate === new Date().toISOString().split('T')[0];
    
    const cardBorderClass = isDueToday
      ? 'border-status-red'
      : order.isExpress
      ? 'border-accent'
      : client?.type === ClientType.Corporate
      ? 'border-primary'
      : 'border-gray-200';

    const cardClasses = [
        'bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 flex flex-col justify-between min-h-[180px]',
        cardBorderClass,
        order.isOverdue && 'bg-yellow-50',
    ].filter(Boolean).join(' ');

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onClick={onClick}
            className={cardClasses}
        >
            <div>
                <div className="flex justify-between items-start">
                    <h4 className="font-display font-bold text-text-main">#{order.numericId}</h4>
                    {assignedEmployee && (
                        <img 
                            src={assignedEmployee.avatarUrl} 
                            alt={assignedEmployee.name} 
                            title={assignedEmployee.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    )}
                </div>
                <p className="text-sm text-text-secondary mt-1">{client?.name || 'Cliente desconocido'}</p>
                <p className="text-sm font-semibold text-text-main mt-3">Entrega: {order.deliveryDate}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                    {order.isExpress && (
                        <span className="text-xs font-bold bg-accent text-white px-2 py-1 rounded">EXPRESS</span>
                    )}
                     {client?.type === ClientType.Corporate && (
                        <span className="text-xs font-bold bg-primary text-white px-2 py-1 rounded">CTA. CTE.</span>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                {onMovePrev ? (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onMovePrev(); }}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors flex items-center"
                        title="Mover a etapa anterior"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                        <span className="text-xs ml-1 md:hidden">Anterior</span>
                    </button>
                ) : <div className="w-5 h-5"></div>}
                
                {onMoveNext ? (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onMoveNext(); }}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors flex items-center"
                        title="Mover a siguiente etapa"
                    >
                        <span className="text-xs mr-1 md:hidden">Siguiente</span>
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                ) : <div className="w-5 h-5"></div>}
            </div>
        </div>
    );
};