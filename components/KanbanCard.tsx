



import React from 'react';
import { Order, ClientType, Client, Employee } from '../types';
import { useStore } from '../services/store';

interface KanbanCardProps {
    order: Order;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onClick: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ order, onDragStart, onClick }) => {
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
        'bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4',
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
    );
};