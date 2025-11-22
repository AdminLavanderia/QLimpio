
import { actions, store } from './services/store.js';
import { OrderStatus, Role, ClientType } from './types.js';
import { KANBAN_COLUMNS, CHECKLISTS } from './constants.js';

// --- ESTADO LOCAL DE LA VISTA (UI STATE) ---
let currentView = 'dashboard';
let activeModal = null; // { type: 'client' | 'order' | 'camera' | 'payment', data: any }
let currentModalTab = 'tasks'; // Para el modal de detalles de orden
let filters = { turnero: { status: null, date: null }, inventory: { status: null } };
let cameraStream = null;

// --- ICONOS SVG (Strings) ---
const ICONS = {
    dashboard: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
    turnero: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
    clients: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    inventory: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    services: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    employees: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    equipment: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M6 7V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4"/><line x1="6" y1="14" x2="18" y2="14"/></svg>`,
    finance: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    logout: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    plus: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    x: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    edit: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
    camera: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    prev: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    next: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`
};

// --- HELPER FUNCTIONS ---
const formatCurrency = (val) => val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
const formatDate = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

// --- RENDERIZADORES DE VISTAS (View Components) ---

function renderLogin() {
    return `
    <div class="flex items-center justify-center min-h-screen bg-background-light">
        <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
            <div class="text-center">
                <h1 class="text-4xl font-display font-bold text-primary">Q' Limpio</h1>
                <p class="mt-2 text-text-secondary">Gestión de Lavandería</p>
            </div>
            <form id="loginForm" class="mt-8 space-y-6">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div><input id="username" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Usuario"></div>
                    <div><input id="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Contraseña"></div>
                </div>
                <div id="loginError" class="text-sm text-center text-status-red hidden">Usuario o contraseña incorrectos.</div>
                <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none">Ingresar</button>
            </form>
             <p class="mt-4 text-xs text-center text-gray-400">
                Prueba: juan.perez / password
            </p>
        </div>
    </div>`;
}

function renderSidebar(currentUser) {
    const isAdmin = currentUser.role === Role.Admin;
    const menu = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
        { id: 'turnero', label: 'Turnero Digital', icon: ICONS.turnero },
        { id: 'clients', label: 'Clientes', icon: ICONS.clients },
        { id: 'mytasks', label: 'Mis Tareas', icon: ICONS.dashboard }, // Reusing dashboard icon
    ];

    if (isAdmin) {
        menu.push(
            { id: 'inventory', label: 'Inventario', icon: ICONS.inventory },
            { id: 'services', label: 'Servicios', icon: ICONS.services },
            { id: 'employees', label: 'Empleados', icon: ICONS.employees },
            { id: 'equipment', label: 'Equipos', icon: ICONS.equipment },
            { id: 'finance', label: 'Finanzas', icon: ICONS.finance }
        );
    }

    return `
    <aside class="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
        <div class="h-20 flex items-center justify-center border-b border-gray-200">
            <h1 class="text-2xl font-display font-bold text-primary">Q' Limpio</h1>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            ${menu.map(item => `
                <button data-action="nav" data-view="${item.id}" class="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${currentView === item.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}">
                    ${item.icon}
                    <span class="ml-4">${item.label}</span>
                </button>
            `).join('')}
        </nav>
        <div class="px-4 py-6 border-t border-gray-200">
            <button data-action="logout" class="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">
                ${ICONS.logout}
                <span class="ml-4">Cerrar Sesión</span>
            </button>
        </div>
    </aside>`;
}

function renderDashboard(state) {
    const { orders, inventory, accountsPayable } = state;
    const todayStr = new Date().toISOString().split('T')[0];
    const ordersToday = orders.filter(o => o.receptionDate === todayStr).length;
    const incomeToday = orders.filter(o => o.receptionDate === todayStr).reduce((sum, o) => sum + o.paidAmount, 0);
    const readyToPickup = orders.filter(o => o.status === OrderStatus.Ready).length;
    const alerts = inventory.filter(i => i.stock <= i.minStock).length;

    return `
    <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col cursor-pointer hover:-translate-y-1 transition" data-action="nav-filter" data-view="turnero" data-filter="today">
                <div class="text-primary">${ICONS.dashboard}</div>
                <p class="text-sm text-text-secondary mt-4">Pedidos del Día</p>
                <p class="text-3xl font-bold font-display text-text-main">${ordersToday}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col">
                <div class="text-primary">${ICONS.finance}</div>
                <p class="text-sm text-text-secondary mt-4">Ingresos del Día</p>
                <p class="text-3xl font-bold font-display text-text-main">${formatCurrency(incomeToday)}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col cursor-pointer hover:-translate-y-1 transition" data-action="nav-filter" data-view="turnero" data-filter="ready">
                <div class="text-primary">${ICONS.turnero}</div>
                <p class="text-sm text-text-secondary mt-4">Listos para Retirar</p>
                <p class="text-3xl font-bold font-display text-text-main">${readyToPickup}</p>
            </div>
             <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col cursor-pointer hover:-translate-y-1 transition" data-action="nav" data-view="inventory">
                <div class="${alerts > 0 ? 'text-accent' : 'text-green-500'}">${ICONS.inventory}</div>
                <p class="text-sm text-text-secondary mt-4">Alertas Stock</p>
                <p class="text-3xl font-bold font-display text-text-main">${alerts}</p>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-sm">
             <h3 class="font-display font-bold text-lg text-text-main mb-4">Accesos Rápidos</h3>
             <div class="flex flex-wrap gap-4">
                <button data-action="open-modal" data-modal="order" class="bg-primary text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-600 flex items-center">
                    ${ICONS.plus} <span class="ml-2">Nuevo Pedido</span>
                </button>
                 <button data-action="nav-filter" data-view="turnero" data-filter="ready" class="bg-accent text-white px-4 py-3 rounded-lg font-bold hover:bg-orange-500 flex items-center">
                    ${ICONS.finance} <span class="ml-2">Cobrar / Entregar</span>
                </button>
             </div>
        </div>
    </div>`;
}

function renderKanbanCard(order, clients, employees) {
    const client = clients.find(c => c.id === order.clientId);
    const employee = employees.find(e => e.id === order.assignedTo);
    const isDueToday = order.deliveryDate === new Date().toISOString().split('T')[0];
    const borderClass = isDueToday ? 'border-red-500' : (order.isExpress ? 'border-orange-400' : 'border-gray-200');
    
    // Navigation buttons logic
    const statusIndex = KANBAN_COLUMNS.indexOf(order.status);
    const prevStatus = statusIndex > 0 ? KANBAN_COLUMNS[statusIndex - 1] : null;
    const nextStatus = statusIndex < KANBAN_COLUMNS.length - 1 ? KANBAN_COLUMNS[statusIndex + 1] : null;

    return `
    <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 ${borderClass} mb-3 cursor-pointer hover:shadow-md transition flex flex-col" 
         draggable="true" data-order-id="${order.id}" data-action="open-details" data-id="${order.id}">
        <div class="flex justify-between items-start">
            <h4 class="font-bold text-text-main">#${order.numericId}</h4>
            ${employee ? `<img src="${employee.avatarUrl}" class="w-6 h-6 rounded-full object-cover">` : ''}
        </div>
        <p class="text-sm text-text-secondary truncate">${client ? client.name : 'Desconocido'}</p>
        <p class="text-xs font-semibold mt-2 text-gray-600">Entrega: ${formatDate(order.deliveryDate)}</p>
        ${order.isExpress ? '<span class="mt-1 inline-block text-[10px] font-bold bg-orange-400 text-white px-1.5 py-0.5 rounded w-fit">EXPRESS</span>' : ''}
        
        <div class="flex justify-between items-center mt-3 pt-2 border-t border-gray-100" onclick="event.stopPropagation()">
            ${prevStatus ? `<button data-action="move-order" data-id="${order.id}" data-status="${prevStatus}" class="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full" title="Anterior">${ICONS.prev}</button>` : '<div></div>'}
            ${nextStatus ? `<button data-action="move-order" data-id="${order.id}" data-status="${nextStatus}" class="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full" title="Siguiente">${ICONS.next}</button>` : '<div></div>'}
        </div>
    </div>`;
}

function renderTurnero(state) {
    const { orders, clients, employees } = state;
    const todayStr = new Date().toISOString().split('T')[0];
    
    let visibleOrders = orders;
    if (filters.turnero.status) visibleOrders = visibleOrders.filter(o => o.status === filters.turnero.status);
    if (filters.turnero.date === 'today') visibleOrders = visibleOrders.filter(o => o.receptionDate === todayStr);

    return `
    <div class="h-full flex flex-col">
        <div class="p-4 bg-white border-b rounded-t-lg flex justify-between items-center">
            <h2 class="text-xl font-bold">Turnero Digital</h2>
             ${(filters.turnero.status || filters.turnero.date) ? 
                `<button data-action="clear-filters" class="text-sm text-blue-600 hover:underline flex items-center">${ICONS.x} Limpiar Filtros</button>` : ''}
        </div>
        <div class="flex-1 overflow-x-auto p-4 bg-gray-100">
            <div class="flex space-x-4 h-full">
                ${KANBAN_COLUMNS.map(status => {
                    const colOrders = visibleOrders.filter(o => o.status === status);
                    if (colOrders.length === 0 && (filters.turnero.status || filters.turnero.date)) return '';
                    return `
                    <div class="flex-shrink-0 w-72 flex flex-col h-full" data-column-status="${status}" ondragover="event.preventDefault()">
                        <div class="p-3 bg-white rounded-t-lg border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
                            ${status} <span class="bg-gray-200 text-xs px-2 py-0.5 rounded-full">${colOrders.length}</span>
                        </div>
                        <div class="flex-1 bg-gray-50 p-2 overflow-y-auto rounded-b-lg space-y-2 min-h-[100px]">
                            ${colOrders.map(o => renderKanbanCard(o, clients, employees)).join('')}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>
    </div>`;
}

function renderGenericTable(headers, rowsHTML, onAddAction) {
    return `
    <div class="space-y-6">
        <div class="flex justify-end">
            <button data-action="${onAddAction}" class="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-bold">
                ${ICONS.plus} <span class="ml-2">Nuevo</span>
            </button>
        </div>
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <table class="w-full text-sm text-left text-gray-500">
                <thead class="text-xs text-text-secondary uppercase bg-gray-50">
                    <tr>${headers.map(h => `<th class="px-6 py-3">${h}</th>`).join('')}<th class="px-6 py-3 text-right">Acciones</th></tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </div>
    </div>`;
}

// --- RENDERIZADORES DE MODULOS ---

function renderClients(state) {
    const rows = state.clients.map(c => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-text-main">${c.name}</td>
            <td class="px-6 py-4">${c.phone}</td>
            <td class="px-6 py-4">${c.type}</td>
            <td class="px-6 py-4">${c.participa_fidelizacion ? c.puntos_actuales : '-'}</td>
            <td class="px-6 py-4 text-right">
                <button data-action="open-modal" data-modal="client" data-id="${c.id}" class="text-primary hover:underline">${ICONS.edit}</button>
            </td>
        </tr>
    `).join('');
    return renderGenericTable(['Nombre', 'Teléfono', 'Tipo', 'Puntos'], rows, 'open-modal" data-modal="client');
}

function renderInventory(state) {
    const rows = state.inventory.map(i => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-text-main">${i.name}</td>
            <td class="px-6 py-4">${i.stock} ${i.unit}</td>
            <td class="px-6 py-4">${i.minStock}</td>
            <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full text-white ${i.stock <= i.minStock ? 'bg-red-500' : 'bg-green-500'}">${i.stock <= i.minStock ? 'Bajo' : 'OK'}</span></td>
            <td class="px-6 py-4 text-right">
                <button data-action="open-modal" data-modal="inventory" data-id="${i.id}" class="text-primary hover:underline">${ICONS.edit}</button>
            </td>
        </tr>
    `).join('');
    return renderGenericTable(['Insumo', 'Stock', 'Mínimo', 'Estado'], rows, 'open-modal" data-modal="inventory');
}

function renderServices(state) {
    const rows = state.services.map(s => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-text-main">${s.name}</td>
            <td class="px-6 py-4">${formatCurrency(s.price)}</td>
            <td class="px-6 py-4">${s.activo ? 'Activo' : 'Inactivo'}</td>
            <td class="px-6 py-4 text-right">
                <button data-action="open-modal" data-modal="service" data-id="${s.id}" class="text-primary hover:underline">${ICONS.edit}</button>
            </td>
        </tr>
    `).join('');
    return renderGenericTable(['Servicio', 'Precio', 'Estado'], rows, 'open-modal" data-modal="service');
}

function renderEmployees(state) {
    const rows = state.employees.map(e => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-text-main flex items-center"><img src="${e.avatarUrl}" class="w-8 h-8 rounded-full mr-2"> ${e.name}</td>
            <td class="px-6 py-4">@${e.username}</td>
            <td class="px-6 py-4">${e.role}</td>
            <td class="px-6 py-4 text-right">
                <button data-action="open-modal" data-modal="employee" data-id="${e.id}" class="text-primary hover:underline">${ICONS.edit}</button>
            </td>
        </tr>
    `).join('');
    return renderGenericTable(['Empleado', 'Usuario', 'Rol'], rows, 'open-modal" data-modal="employee');
}

function renderEquipment(state) {
     const rows = state.equipment.map(e => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-text-main">${e.name}</td>
            <td class="px-6 py-4">${e.type}</td>
            <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-full text-white ${e.status === 'Operativa' ? 'bg-green-500' : 'bg-red-500'}">${e.status}</span></td>
            <td class="px-6 py-4 text-right">
                <button data-action="open-modal" data-modal="equipment" data-id="${e.id}" class="text-primary hover:underline">${ICONS.edit}</button>
            </td>
        </tr>
    `).join('');
    return renderGenericTable(['Equipo', 'Tipo', 'Estado'], rows, 'open-modal" data-modal="equipment');
}

function renderFinance(state) {
    const expensesHTML = state.expenses.map(e => `
        <tr class="bg-white border-b">
            <td class="px-6 py-4">${formatDate(e.date)}</td>
            <td class="px-6 py-4 font-bold">${e.concept}</td>
            <td class="px-6 py-4">${e.category}</td>
            <td class="px-6 py-4 text-right text-red-600 font-bold">${formatCurrency(e.amount)}</td>
        </tr>
    `).join('');

    return `
    <div class="space-y-6">
        <div class="flex justify-end">
            <button data-action="open-modal" data-modal="expense" class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 flex items-center">${ICONS.plus} Nuevo Gasto</button>
        </div>
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
             <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr><th class="px-6 py-3">Fecha</th><th class="px-6 py-3">Concepto</th><th class="px-6 py-3">Categoría</th><th class="px-6 py-3 text-right">Monto</th></tr>
                </thead>
                <tbody>
                    ${expensesHTML.length ? expensesHTML : '<tr><td colspan="4" class="p-4 text-center text-gray-500">No hay gastos registrados</td></tr>'}
                </tbody>
             </table>
        </div>
    </div>`;
}

// --- MODALES (Renderizado) ---

function renderModalOverlay(title, contentHTML, saveAction = 'save-modal') {
    return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-action="close-modal">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
            <header class="flex items-center justify-between p-4 border-b">
                <h2 class="text-xl font-bold font-display text-text-main">${title}</h2>
                <button data-action="close-modal" class="text-gray-500 hover:text-gray-800">${ICONS.x}</button>
            </header>
            <main class="p-6 overflow-y-auto flex-1">
                <form id="modal-form" class="space-y-4">
                    ${contentHTML}
                </form>
            </main>
            <footer class="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
                <button data-action="close-modal" class="px-4 py-2 rounded-lg text-gray-700 bg-white border mr-2 hover:bg-gray-100">Cancelar</button>
                <button data-action="${saveAction}" class="px-4 py-2 rounded-lg text-white bg-primary hover:bg-blue-600 font-bold">Guardar</button>
            </footer>
        </div>
    </div>`;
}

function renderOrderDetailsModal(order, state) {
    const { services, inventory, employees, equipment } = state;
    const client = state.clients.find(c => c.id === order.clientId);
    const isReady = order.status === OrderStatus.Ready;

    // Tabs logic
    const tabs = [
        { id: 'tasks', label: 'Tareas' },
        { id: 'anotador', label: 'Anotador' },
        { id: 'insumos', label: 'Insumos' },
        { id: 'asignacion', label: 'Asignación' }
    ];

    let content = '';
    if (currentModalTab === 'tasks') {
        const checklist = CHECKLISTS[order.status] || [];
        content = `
            <h3 class="font-bold mb-4">Tareas para: ${order.status}</h3>
            <ul class="space-y-2">
                ${checklist.map(task => {
                    const isDone = (order.completedTasks || []).includes(task.id);
                    return `
                    <li class="flex items-center p-2 rounded ${isDone ? 'bg-green-50' : 'bg-gray-50'}">
                        <input type="checkbox" ${isDone ? 'checked disabled' : ''} data-action="complete-task" data-task-id="${task.id}" class="mr-3 h-5 w-5 text-primary">
                        <span class="${isDone ? 'line-through text-gray-500' : ''}">${task.label}</span>
                    </li>`;
                }).join('')}
                ${checklist.length === 0 ? '<p class="text-gray-500">No hay tareas específicas.</p>' : ''}
            </ul>`;
    } else if (currentModalTab === 'anotador') {
        content = `
            <div class="flex justify-between mb-2">
                <h3 class="font-bold">Prendas</h3>
                <button type="button" data-action="add-garment" class="text-sm text-primary font-bold">+ Añadir</button>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto">
                ${(order.garments || []).map((g, idx) => `
                    <div class="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded">
                        <input type="number" value="${g.quantity}" class="col-span-2 p-1 border rounded text-center" data-idx="${idx}" data-field="quantity" onchange="updateGarment(this)">
                        <input type="text" value="${g.name}" class="col-span-7 p-1 border rounded" placeholder="Descripción..." data-idx="${idx}" data-field="name" onchange="updateGarment(this)">
                        <button type="button" class="col-span-2 text-blue-500 text-xs" data-action="open-camera" data-idx="${idx}">${ICONS.camera} ${g.photos ? g.photos.length : 0}</button>
                        <button type="button" class="col-span-1 text-red-500" data-action="remove-garment" data-idx="${idx}">${ICONS.trash}</button>
                    </div>
                `).join('')}
            </div>`;
    } else if (currentModalTab === 'insumos') {
        content = `
            <h3 class="font-bold mb-2">Insumos Usados</h3>
            ${(order.usedSupplies || []).map((s, idx) => {
                const item = inventory.find(i => i.id === s.inventoryItemId);
                return `<div class="flex justify-between p-2 bg-gray-50 mb-1 rounded"><span>${item?.name}</span> <span class="font-bold">${s.quantity} ${item?.unit}</span></div>`;
            }).join('')}
            <div class="mt-4">
                <select id="addSupplySelect" class="w-full p-2 border rounded mb-2">
                    <option value="">Añadir insumo...</option>
                    ${inventory.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
                </select>
                <button type="button" data-action="add-supply" class="w-full bg-gray-200 py-1 rounded text-sm">Añadir (1 unidad)</button>
            </div>`;
    } else if (currentModalTab === 'asignacion') {
        content = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold mb-1">Asignado a:</label>
                    <select id="assignedToSelect" class="w-full p-2 border rounded" onchange="updateOrderField('assignedTo', this.value)">
                        <option value="">Nadie</option>
                        ${employees.map(e => `<option value="${e.id}" ${e.id === order.assignedTo ? 'selected' : ''}>${e.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">Notas Internas:</label>
                    <textarea class="w-full p-2 border rounded" rows="3" onchange="updateOrderField('internalNotes', this.value)">${order.internalNotes || ''}</textarea>
                </div>
            </div>`;
    }

    return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-action="close-modal">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col" onclick="event.stopPropagation()">
            <header class="flex items-center justify-between p-4 border-b">
                <h2 class="text-xl font-bold">Pedido #${order.numericId} - <span class="text-primary">${client?.name}</span></h2>
                <button data-action="close-modal">${ICONS.x}</button>
            </header>
            <div class="flex border-b bg-gray-50">
                ${tabs.map(t => `
                    <button data-action="switch-tab" data-tab="${t.id}" class="flex-1 py-3 text-sm font-bold ${currentModalTab === t.id ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500'}">
                        ${t.label}
                    </button>
                `).join('')}
            </div>
            <main class="p-6 overflow-y-auto flex-1">
                ${content}
            </main>
            <footer class="p-4 border-t bg-gray-50 flex justify-between">
                ${isReady ? `<button data-action="open-payment" class="bg-green-500 text-white px-4 py-2 rounded font-bold">Registrar Pago</button>` : '<div></div>'}
                <button data-action="save-order-details" class="bg-primary text-white px-4 py-2 rounded font-bold">Guardar Cambios</button>
            </footer>
        </div>
    </div>`;
}

function renderCameraModal() {
    return `
    <div class="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center text-white">
        <div class="relative w-full max-w-md aspect-[3/4] bg-black">
            <video id="camera-video" autoplay playsinline class="w-full h-full object-cover"></video>
            <canvas id="camera-canvas" class="hidden"></canvas>
        </div>
        <div class="mt-4 flex gap-4">
            <button data-action="capture-photo" class="bg-white text-black rounded-full w-16 h-16 border-4 border-gray-300"></button>
            <button data-action="close-camera" class="bg-red-500 px-4 py-2 rounded">Cancelar</button>
        </div>
    </div>`;
}

// --- MAIN RENDERER ---
function renderApp() {
    const state = store.getState();
    const root = document.getElementById('root');

    if (state.isLoading) {
        root.innerHTML = '<div class="flex h-screen items-center justify-center font-bold text-xl text-primary">Cargando Sistema...</div>';
        return;
    }

    if (!state.currentUser) {
        root.innerHTML = renderLogin();
        // Form logic handled by delegation
        return;
    }

    let content = '';
    switch (currentView) {
        case 'dashboard': content = renderDashboard(state); break;
        case 'turnero': content = renderTurnero(state); break;
        case 'clients': content = renderClients(state); break;
        case 'inventory': content = renderInventory(state); break;
        case 'services': content = renderServices(state); break;
        case 'employees': content = renderEmployees(state); break;
        case 'equipment': content = renderEquipment(state); break;
        case 'finance': content = renderFinance(state); break;
        case 'mytasks': content = `<div class="p-4 bg-white rounded shadow"><h3>Mis Tareas</h3><p>Sección en construcción</p></div>`; break;
        default: content = renderDashboard(state);
    }

    const layoutHTML = `
    <div class="flex h-screen bg-background-light font-sans text-text-main overflow-hidden">
        ${renderSidebar(state.currentUser)}
        <div class="flex-1 flex flex-col overflow-hidden">
            <header class="h-20 flex-shrink-0 bg-white flex items-center justify-between px-8 border-b border-gray-200">
                <h2 class="text-2xl font-bold font-display text-text-main capitalize">${currentView}</h2>
                <div class="flex items-center space-x-4">
                    <div class="text-right">
                        <p class="font-semibold text-text-main">${state.currentUser.name}</p>
                        <p class="text-sm text-text-secondary">${state.currentUser.role}</p>
                    </div>
                    <img src="${state.currentUser.avatarUrl}" class="w-12 h-12 rounded-full object-cover bg-gray-200">
                </div>
            </header>
            <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
                ${content}
            </main>
        </div>
    </div>`;

    // Handle Modals Overlay
    let modalHTML = '';
    if (activeModal) {
        if (activeModal.type === 'order') {
            modalHTML = renderOrderDetailsModal(activeModal.data, state);
        } else if (activeModal.type === 'camera') {
            modalHTML = renderCameraModal();
            // Camera logic needs to be attached after render
            setTimeout(startCamera, 100);
        } else {
            // Generic Form Modals (Clients, etc.) - simplified for demo
            const title = activeModal.type.toUpperCase();
            const fields = Object.keys(activeModal.data).map(key => {
                if (key === 'id') return '';
                return `<div><label class="block text-sm font-bold mb-1 capitalize">${key}</label><input name="${key}" value="${activeModal.data[key]}" class="w-full p-2 border rounded"></div>`;
            }).join('');
            modalHTML = renderModalOverlay(title, fields, `save-${activeModal.type}`);
        }
    }

    root.innerHTML = layoutHTML + modalHTML;
    
    // Re-attach drag events manually because innerHTML wipes them
    attachDragEvents();
}

// --- LOGIC & EVENTS ---

// Camera Logic
async function startCamera() {
    try {
        const video = document.getElementById('camera-video');
        if (video) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = stream;
            cameraStream = stream;
        }
    } catch (e) {
        alert("Error cámara: " + e.message);
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
}

// Helper for updating local modal state
window.updateGarment = (input) => {
    if (activeModal && activeModal.type === 'order') {
        const idx = input.dataset.idx;
        const field = input.dataset.field;
        activeModal.data.garments[idx][field] = input.value;
    }
};

window.updateOrderField = (field, value) => {
    if (activeModal && activeModal.type === 'order') {
        activeModal.data[field] = value;
    }
};

// Drag & Drop
function attachDragEvents() {
    const draggables = document.querySelectorAll('[draggable="true"]');
    draggables.forEach(d => {
        d.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', d.dataset.orderId);
        });
    });

    const columns = document.querySelectorAll('[data-column-status]');
    columns.forEach(c => {
        c.addEventListener('dragover', e => e.preventDefault());
        c.addEventListener('drop', e => {
            e.preventDefault();
            const orderId = e.dataTransfer.getData('text/plain');
            const status = c.dataset.columnStatus;
            if (orderId && status) {
                actions.moveOrder(orderId, status);
            }
        });
    });
}

// Global Event Listener
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    e.preventDefault();
    const action = btn.dataset.action;
    const state = store.getState();

    // AUTH
    if (btn.type === 'submit' && btn.closest('#loginForm')) {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        if (!actions.login(u, p)) {
            document.getElementById('loginError').classList.remove('hidden');
        }
        return;
    }
    if (action === 'logout') actions.logout();

    // NAVIGATION
    if (action === 'nav') {
        currentView = btn.dataset.view;
        renderApp();
    }
    if (action === 'nav-filter') {
        currentView = btn.dataset.view;
        const filterType = btn.dataset.filter;
        filters.turnero = filterType === 'today' ? { date: 'today', status: null } : { date: null, status: OrderStatus.Ready };
        renderApp();
    }
    if (action === 'clear-filters') {
        filters.turnero = { date: null, status: null };
        renderApp();
    }

    // MODALS
    if (action === 'open-modal') {
        const type = btn.dataset.modal;
        const id = btn.dataset.id;
        let data = {};
        // Find data based on ID if editing
        if (id) {
            if (type === 'client') data = state.clients.find(c => c.id === id);
            if (type === 'inventory') data = state.inventory.find(i => i.id === id);
            if (type === 'service') data = state.services.find(s => s.id === id);
            if (type === 'employee') data = state.employees.find(e => e.id === id);
            if (type === 'equipment') data = state.equipment.find(e => e.id === id);
        } else {
            // Default empty data structure based on type (simplified)
            data = { id: '', name: '' }; 
        }
        activeModal = { type, data: { ...data } }; // clone
        renderApp();
    }
    if (action === 'close-modal') {
        activeModal = null;
        renderApp();
    }
    
    // ORDER MODAL SPECIFICS
    if (action === 'open-details') {
        const orderId = btn.dataset.id;
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            activeModal = { type: 'order', data: JSON.parse(JSON.stringify(order)) }; // Deep clone
            currentModalTab = 'tasks';
            renderApp();
        }
    }
    if (action === 'switch-tab') {
        currentModalTab = btn.dataset.tab;
        renderApp();
    }
    if (action === 'complete-task') {
        const taskId = btn.dataset.taskId;
        // Optimistic UI update on modal
        if (!activeModal.data.completedTasks) activeModal.data.completedTasks = [];
        activeModal.data.completedTasks.push(taskId);
        // Real update
        actions.completeTask(activeModal.data.id, taskId);
        renderApp();
    }
    if (action === 'save-order-details') {
        actions.updateOrder(activeModal.data);
        activeModal = null;
        renderApp();
    }
    if (action === 'add-garment') {
        if (!activeModal.data.garments) activeModal.data.garments = [];
        activeModal.data.garments.push({ quantity: 1, name: '', photos: [] });
        renderApp();
    }
    if (action === 'remove-garment') {
        const idx = btn.dataset.idx;
        activeModal.data.garments.splice(idx, 1);
        renderApp();
    }
    if (action === 'add-supply') {
        const select = document.getElementById('addSupplySelect');
        const id = select.value;
        if (id) {
            if (!activeModal.data.usedSupplies) activeModal.data.usedSupplies = [];
            activeModal.data.usedSupplies.push({ inventoryItemId: id, quantity: 1 });
            renderApp();
        }
    }

    // CAMERA
    if (action === 'open-camera') {
        // We need to know which garment index we are editing
        activeModal = { type: 'camera', data: { parentModal: activeModal, garmentIdx: btn.dataset.idx } };
        renderApp();
    }
    if (action === 'close-camera') {
        stopCamera();
        activeModal = activeModal.data.parentModal; // Go back to order
        renderApp();
    }
    if (action === 'capture-photo') {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const imgData = canvas.toDataURL('image/jpeg');
            
            // Save to order
            const { parentModal, garmentIdx } = activeModal.data;
            if (!parentModal.data.garments[garmentIdx].photos) parentModal.data.garments[garmentIdx].photos = [];
            parentModal.data.garments[garmentIdx].photos.push(imgData);
            
            stopCamera();
            activeModal = parentModal;
            renderApp();
        }
    }

    // SAVE GENERIC MODALS
    if (action.startsWith('save-')) {
        const type = action.replace('save-', '');
        const form = document.getElementById('modal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        // Merge ID if existing
        const finalData = { ...activeModal.data, ...data };
        
        if (type === 'client') actions.addOrUpdateClient(finalData);
        if (type === 'inventory') actions.addOrUpdateInventoryItem(finalData);
        if (type === 'service') actions.addOrUpdateService({ ...finalData, price: parseFloat(finalData.price), active: true });
        if (type === 'employee') actions.addOrUpdateEmployee(finalData);
        if (type === 'equipment') actions.addOrUpdateEquipment(finalData);
        if (type === 'expense') actions.addExpense({ ...finalData, amount: parseFloat(finalData.amount) });

        activeModal = null;
        renderApp();
    }
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    actions.init();
    store.subscribe(renderApp);
    // Initial render (loading state)
    renderApp();
});
