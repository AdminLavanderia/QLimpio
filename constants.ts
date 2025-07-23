import { OrderStatus, Role, Order, Service } from './types';

export const KANBAN_COLUMNS: OrderStatus[] = [
    OrderStatus.Assigned,
    OrderStatus.Reception,
    OrderStatus.Classification,
    OrderStatus.Washing,
    OrderStatus.Drying,
    OrderStatus.Folding,
    OrderStatus.FinalControl,
    OrderStatus.Ready,
    OrderStatus.Delivered,
];

export const ROLES: Record<string, Role> = {
    ADMIN: Role.Admin,
    EMPLOYEE: Role.Employee,
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
    [OrderStatus.Assigned]: 'bg-gray-400',
    [OrderStatus.Reception]: 'bg-purple-500',
    [OrderStatus.Classification]: 'bg-indigo-500',
    [OrderStatus.Washing]: 'bg-blue-500',
    [OrderStatus.Drying]: 'bg-cyan-500',
    [OrderStatus.Folding]: 'bg-teal-500',
    [OrderStatus.FinalControl]: 'bg-emerald-500',
    [OrderStatus.Ready]: 'bg-status-green',
    [OrderStatus.Delivered]: 'bg-gray-700',
};

export const ANOTADOR_EDITABLE_STATUSES: OrderStatus[] = [
    OrderStatus.Assigned,
    OrderStatus.Reception,
    OrderStatus.Classification,
];

export interface ChecklistItem {
    id: string;
    label: string;
    isKeyTask: boolean;
    description?: string;
    condition?: (order: Order, services: Service[]) => boolean; 
}

export const CHECKLISTS: Record<OrderStatus, ChecklistItem[]> = {
    [OrderStatus.Assigned]: [],
    [OrderStatus.Reception]: [
        { id: 'register_garments', label: 'Registro de prendas', isKeyTask: true, description: 'Ir a la pestaña "Anotador", añadir todas las prendas y fotos. Al guardar, la tarea se marcará y avanzará.' },
    ],
    [OrderStatus.Classification]: [
        { id: 'classify_garments', label: 'Clasificar por tipo y color', isKeyTask: false },
        { id: 'spot_treat', label: 'Aplicar desmanchador', isKeyTask: false, description: 'Ajustar la cantidad en la pestaña "Insumos" si es necesario.' },
        { id: 'pre_wash', label: 'Prelavado completado', isKeyTask: true },
    ],
    [OrderStatus.Washing]: [
        { id: 'load_machine', label: 'Colocar jabón y suavizante', isKeyTask: false, description: 'Seleccionar máquina en la pestaña "Asignación".' },
        { id: 'centrifuge', label: 'Centrifugado finalizado', isKeyTask: true },
    ],
    [OrderStatus.Drying]: [
        { id: 'hang_dry', label: 'Colgar en sogas / calefactor', isKeyTask: false },
        { id: 'collect_dry', label: 'Descolgar y llevar a doblado', isKeyTask: true },
    ],
    [OrderStatus.Folding]: [
        { 
            id: 'fold_garments', 
            label: 'Doblar prendas', 
            isKeyTask: true,
            condition: (order: Order, allServices: Service[]) => {
                const serviceIdsInOrder = order.services.map(s => s.serviceId);
                const servicesInOrder = allServices.filter(s => serviceIdsInOrder.includes(s.id));
                return !servicesInOrder.some(s => s.name.toLowerCase().includes('planchado'));
            }
        },
        { 
            id: 'iron_garments', 
            label: 'Planchar prendas', 
            isKeyTask: true,
             condition: (order: Order, allServices: Service[]) => {
                const serviceIdsInOrder = order.services.map(s => s.serviceId);
                const servicesInOrder = allServices.filter(s => serviceIdsInOrder.includes(s.id));
                return servicesInOrder.some(s => s.name.toLowerCase().includes('planchado'));
            }
        },
    ],
    [OrderStatus.FinalControl]: [
        { id: 'final_control', label: 'Controlar prendas con Anotador', isKeyTask: false, description: 'Marcar cada prenda como controlada en la pestaña "Anotador".' },
        { id: 'package_garments', label: 'Embolsar, etiquetar y registrar empaque', isKeyTask: true, description: 'Completar N° de paquetes y ubicación en la pestaña "Anotador".' },
    ],
    [OrderStatus.Ready]: [],
    [OrderStatus.Delivered]: [],
};