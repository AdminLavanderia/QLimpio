import React from 'react';
import { useStore } from '../services/store';
import { AppView } from '../types';

interface HeaderProps {
    activeView: AppView;
}

const viewTitles: Record<AppView, string> = {
    dashboard: 'Panel de Control',
    turnero: 'Turnero Digital',
    clients: 'Gestión de Clientes',
    inventory: 'Gestión de Inventario',
    services: 'Servicios y Precios',
    employees: 'Gestión de Empleados',
    equipment: 'Gestión de Equipos',
    settings: 'Configuración',
    reports: 'Reportes y Estadísticas',
    marketing: 'Marketing y Fidelización',
    finance: 'Finanzas y Contabilidad',
    calendar: 'Calendario de Entregas',
    mytasks: 'Mis Tareas del Día',
    notifications: 'Gestión de Notificaciones',
};


export const Header: React.FC<HeaderProps> = ({ activeView }) => {
    const { currentUser } = useStore();

    if (!currentUser) {
        // Esto no debería ocurrir en el flujo normal de la app, pero es una buena salvaguarda.
        return null;
    }

    return (
        <header className="h-20 flex-shrink-0 bg-white flex items-center justify-between px-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold font-display text-text-main">{viewTitles[activeView]}</h2>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="font-semibold text-text-main">{currentUser.name}</p>
                    <p className="text-sm text-text-secondary">{currentUser.role}</p>
                </div>
                <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
            </div>
        </header>
    );
};