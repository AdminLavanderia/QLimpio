import React from 'react';
import { AppView, Role } from '../types';
import { DashboardIcon, TurneroIcon, ClientsIcon, InventoryIcon, ServicesIcon, EmployeesIcon, SettingsIcon, LogoutIcon, ReportIcon, MarketingIcon, FinanceIcon, CalendarIcon, EquipmentIcon, TasksIcon, NotificationIcon } from './icons';
import { actions, useStore } from '../services/store';

interface SidebarProps {
    activeView: AppView;
    setActiveView: (view: AppView) => void;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {icon}
        <span className="ml-4">{label}</span>
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const { currentUser } = useStore();
    const isAdmin = currentUser?.role === Role.Admin;

    const allNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
        { id: 'mytasks', label: 'Mis Tareas', icon: <TasksIcon className="w-5 h-5" />, employeeOnly: true },
        { id: 'turnero', label: 'Turnero Digital', icon: <TurneroIcon className="w-5 h-5" /> },
        { id: 'calendar', label: 'Calendario', icon: <CalendarIcon className="w-5 h-5" /> },
        { id: 'clients', label: 'Clientes', icon: <ClientsIcon className="w-5 h-5" /> },
        { id: 'inventory', label: 'Inventario', icon: <InventoryIcon className="w-5 h-5" />, adminOnly: true },
        { id: 'services', label: 'Servicios', icon: <ServicesIcon className="w-5 h-5" />, adminOnly: true },
        { id: 'equipment', label: 'Equipos', icon: <EquipmentIcon className="w-5 h-5" />, adminOnly: true },
        { id: 'employees', label: 'Empleados', icon: <EmployeesIcon className="w-5 h-5" />, adminOnly: true },
        { id: 'notifications', label: 'Notificaciones', icon: <NotificationIcon className="w-5 h-5" />, adminOnly: true },
        { id: 'reports', label: 'Reportes', icon: <ReportIcon className="w-5 h-5" />, adminOnly: true },
        { id: 'marketing', label: 'Marketing', icon: <MarketingIcon className="w-5 h-5" />, adminOnly: true },
        { id: 'finance', label: 'Finanzas', icon: <FinanceIcon className="w-5 h-5" />, adminOnly: true },
        { id: 'settings', label: 'Configuración', icon: <SettingsIcon className="w-5 h-5" />, adminOnly: true },
    ];

    const navItems = allNavItems.filter((item: any) => {
        if (isAdmin) {
            return !item.employeeOnly;
        } else { // Is Employee
            return !item.adminOnly;
        }
    });


    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="h-20 flex items-center justify-center border-b border-gray-200">
                <h1 className="text-2xl font-display font-bold text-primary">Q' Limpio</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map(item => (
                    <NavItem
                        key={item.id}
                        label={item.label}
                        icon={item.icon}
                        isActive={activeView === item.id}
                        onClick={() => setActiveView(item.id as AppView)}
                    />
                ))}
            </nav>
            <div className="px-4 py-6 border-t border-gray-200">
                <NavItem
                    label="Cerrar Sesión"
                    icon={<LogoutIcon className="w-5 h-5" />}
                    isActive={false}
                    onClick={() => actions.logout()}
                />
            </div>
        </aside>
    );
};