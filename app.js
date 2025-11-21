
import { actions, store } from './services/store.js';
import { OrderStatus, Role, ClientType } from './types.js';
import { KANBAN_COLUMNS, STATUS_COLORS } from './constants.js';

// --- STATE LOCAL DE LA VISTA ---
let currentView = 'dashboard';
let turneroFilter = { status: null, date: null };

// --- ICONOS SVG ---
const ICONS = {
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
    turnero: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>`,
    clients: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    inventory: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    money: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    basket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path d="M12 10v6"/><path d="M12 16a2 2 0 002-2V8a2 2 0 00-4 0v6a2 2 0 002 2z"/><path d="M18.33 5.67a14.22 14.22 0 00-12.66 0"/><path d="M5.67 18.33a14.22 14.22 0 0012.66 0"/><path d="M12 22a10 10 0 100-20 10 10 0 000 20z"/></svg>`,
    package: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>`,
    bell: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    prev: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    next: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><polyline points="9 18 15 12 9 6"></polyline></svg>`
};

// --- HELPERS ---
const formatCurrency = (value) => value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
const formatDate = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

// --- COMPONENTES DE UI (Funciones que retornan HTML String) ---

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
                    <div>
                        <input id="username" name="username" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Usuario">
                    </div>
                    <div>
                        <input id="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Contraseña">
                    </div>
                </div>
                <div id="loginError" class="text-sm text-center text-status-red hidden">Usuario o contraseña incorrectos.</div>
                <div>
                    <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        Ingresar
                    </button>
                </div>
            </form>
            <p class="mt-4 text-xs text-center text-gray-400">
                Prueba: juan.perez / password
            </p>
        </div>
    </div>`;
}

function renderSidebar(currentUser) {
    const isAdmin = currentUser.role === Role.Admin;
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
        { id: 'turnero', label: 'Turnero Digital', icon: ICONS.turnero },
        { id: 'clients', label: 'Clientes', icon: ICONS.clients },
    ];
    
    if (isAdmin) {
        menuItems.push({ id: 'inventory', label: 'Inventario', icon: ICONS.inventory });
        // Se pueden agregar más items aquí siguiendo el patrón
    }

    return `
    <aside class="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
        <div class="h-20 flex items-center justify-center border-b border-gray-200">
            <h1 class="text-2xl font-display font-bold text-primary">Q' Limpio</h1>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2">
            ${menuItems.map(item => `
                <button 
                    data-action="navigate" 
                    data-view="${item.id}"
                    class="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${currentView === item.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}">
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

function renderDashboardCard(icon, title, value, colorClass = "text-primary", onClickAction = "") {
    return `
    <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col transition-transform transform hover:-translate-y-1 cursor-pointer"
         ${onClickAction ? `data-action="${onClickAction}"` : ''}>
        <div class="w-10 h-10 ${colorClass}">${icon}</div>
        <p class="text-sm text-text-secondary mt-4">${title}</p>
        <p class="text-3xl font-bold font-display text-text-main mt-1">${value}</p>
    </div>`;
}

function renderDashboard(state) {
    const { orders, inventory, accountsPayable } = state;
    const todayStr = new Date().toISOString().split('T')[0];

    const ordersToday = orders.filter(o => o.receptionDate === todayStr).length;
    const incomeToday = orders
        .filter(o => o.receptionDate === todayStr)
        .reduce((sum, o) => sum + o.paidAmount, 0);
    const readyToPickup = orders.filter(o => o.status === OrderStatus.Ready).length;
    
    // Alertas simples
    const inventoryAlerts = inventory.filter(i => i.stock <= i.minStock).length;
    const totalAlerts = inventoryAlerts; // Simplificado para el ejemplo

    return `
    <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${renderDashboardCard(ICONS.basket, "Pedidos del Día", ordersToday, "text-primary", "filter-today")}
            ${renderDashboardCard(ICONS.money, "Ingresos del Día", formatCurrency(incomeToday))}
            ${renderDashboardCard(ICONS.package, "Listos para Retirar", readyToPickup, "text-primary", "filter-ready")}
            ${renderDashboardCard(ICONS.bell, "Alertas", totalAlerts, totalAlerts > 0 ? "text-accent" : "text-status-green")}
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-sm">
             <h3 className="font-display font-bold text-lg text-text-main mb-4">Accesos Rápidos</h3>
             <div class="flex flex-wrap gap-4 mt-4">
                <button data-action="filter-ready" class="bg-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 flex items-center">
                    ${ICONS.money} <span class="ml-2">Cobrar / Entregar (Ver Listos)</span>
                </button>
             </div>
        </div>
    </div>`;
}

function renderKanbanCard(order, clients, employees) {
    const client = clients.find(c => c.id === order.clientId);
    const employee = employees.find(e => e.id === order.assignedTo);
    const isDueToday = order.deliveryDate === new Date().toISOString().split('T')[0];
    
    const borderClass = isDueToday ? 'border-status-red' : (order.isExpress ? 'border-accent' : 'border-gray-200');
    
    // Botones de navegación manual
    const statusIndex = KANBAN_COLUMNS.indexOf(order.status);
    const prevStatus = statusIndex > 0 ? KANBAN_COLUMNS[statusIndex - 1] : null;
    const nextStatus = statusIndex < KANBAN_COLUMNS.length - 1 ? KANBAN_COLUMNS[statusIndex + 1] : null;

    return `
    <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 ${borderClass} mb-4 flex flex-col gap-2" draggable="true" data-order-id="${order.id}">
        <div class="flex justify-between items-start">
            <h4 class="font-display font-bold text-text-main">#${order.numericId}</h4>
            ${employee ? `<img src="${employee.avatarUrl}" class="w-8 h-8 rounded-full object-cover" title="${employee.name}">` : ''}
        </div>
        <p class="text-sm text-text-secondary">${client ? client.name : 'Desconocido'}</p>
        <p class="text-sm font-semibold text-text-main">Entrega: ${formatDate(order.deliveryDate)}</p>
        <div class="flex flex-wrap gap-1 mt-1">
             ${order.isExpress ? '<span class="text-xs font-bold bg-accent text-white px-2 py-1 rounded">EXPRESS</span>' : ''}
        </div>
        
        <!-- Botones de Navegación Manual (Móvil) -->
        <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
            ${prevStatus ? `
                <button data-action="move-order" data-id="${order.id}" data-status="${prevStatus}" class="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full" title="Anterior">
                    ${ICONS.prev}
                </button>` : '<div></div>'}
            
            ${nextStatus ? `
                <button data-action="move-order" data-id="${order.id}" data-status="${nextStatus}" class="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full" title="Siguiente">
                    ${ICONS.next}
                </button>` : '<div></div>'}
        </div>
    </div>`;
}

function renderTurnero(state) {
    const { orders, clients, employees } = state;
    const todayStr = new Date().toISOString().split('T')[0];

    // Filtros
    let filteredOrders = orders;
    if (turneroFilter.status) {
        filteredOrders = filteredOrders.filter(o => o.status === turneroFilter.status);
    }
    if (turneroFilter.date === 'today') {
        filteredOrders = filteredOrders.filter(o => o.receptionDate === todayStr);
    }

    return `
    <div class="h-full flex flex-col">
        <div class="p-4 bg-white border-b rounded-t-lg flex justify-between items-center">
            <h2 class="font-bold text-xl">Turnero Digital</h2>
            ${(turneroFilter.status || turneroFilter.date) ? 
                `<button data-action="clear-filters" class="text-sm text-blue-600 hover:underline">Limpiar Filtros</button>` : ''}
        </div>
        <div class="flex-1 overflow-x-auto p-4">
            <div class="flex space-x-4 h-full">
                ${KANBAN_COLUMNS.map(status => {
                    const colOrders = filteredOrders.filter(o => o.status === status);
                    if (colOrders.length === 0 && (turneroFilter.status || turneroFilter.date)) return '';
                    
                    return `
                    <div class="flex-shrink-0 w-80 bg-kanban-col rounded-lg h-full flex flex-col"
                         ondragover="event.preventDefault()"
                         data-column-status="${status}">
                        <div class="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                            <h3 class="font-display font-bold text-text-main flex items-center justify-between">
                                ${status}
                                <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">${colOrders.length}</span>
                            </h3>
                        </div>
                        <div class="p-4 flex-1 overflow-y-auto">
                            ${colOrders.map(o => renderKanbanCard(o, clients, employees)).join('')}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>
    </div>`;
}

function renderPlaceholder(title) {
    return `
    <div class="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold font-display text-primary mb-2">${title}</h2>
        <p class="text-gray-500">Esta funcionalidad está simplificada en esta versión Demo.</p>
    </div>`;
}

function renderLayout(content) {
    const { currentUser } = store.getState();
    return `
    <div class="flex h-screen bg-background-light font-sans text-text-main overflow-hidden">
        ${renderSidebar(currentUser)}
        <div class="flex-1 flex flex-col overflow-hidden">
            <header class="h-20 flex-shrink-0 bg-white flex items-center justify-between px-8 border-b border-gray-200">
                <h2 class="text-2xl font-bold font-display text-text-main capitalize">${currentView}</h2>
                <div class="flex items-center space-x-4">
                    <div class="text-right">
                        <p class="font-semibold text-text-main">${currentUser.name}</p>
                        <p class="text-sm text-text-secondary">${currentUser.role}</p>
                    </div>
                    <img src="${currentUser.avatarUrl}" class="w-12 h-12 rounded-full object-cover">
                </div>
            </header>
            <main class="flex-1 overflow-x-hidden overflow-y-auto p-8">
                ${content}
            </main>
        </div>
    </div>`;
}

// --- RENDER PRINCIPAL ---
function renderApp() {
    const state = store.getState();
    const root = document.getElementById('root');

    if (state.isLoading) {
        root.innerHTML = `
        <div class="flex items-center justify-center min-h-screen bg-background-light flex-col">
            <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 class="text-xl font-bold text-primary">Cargando...</h2>
        </div>`;
        return;
    }

    if (!state.currentUser) {
        root.innerHTML = renderLogin();
        // Attach login event listener manually after render
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = e.target.username.value;
                const pass = e.target.password.value;
                const success = actions.login(user, pass);
                if (!success) {
                    document.getElementById('loginError').classList.remove('hidden');
                }
            });
        }
        return;
    }

    let content = '';
    switch (currentView) {
        case 'dashboard':
            content = renderDashboard(state);
            break;
        case 'turnero':
            content = renderTurnero(state);
            break;
        case 'clients':
        case 'inventory':
            content = renderPlaceholder("Gestión (Demo)");
            break;
        default:
            content = renderDashboard(state);
    }

    root.innerHTML = renderLayout(content);
    attachDragAndDropEvents();
}

// --- EVENT HANDLING (Delegation) ---
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    if (action === 'navigate') {
        currentView = target.dataset.view;
        renderApp();
    } else if (action === 'logout') {
        actions.logout();
    } else if (action === 'filter-today') {
        currentView = 'turnero';
        turneroFilter = { date: 'today', status: null };
        renderApp();
    } else if (action === 'filter-ready') {
        currentView = 'turnero';
        turneroFilter = { date: null, status: OrderStatus.Ready };
        renderApp();
    } else if (action === 'clear-filters') {
        turneroFilter = { date: null, status: null };
        renderApp();
    } else if (action === 'move-order') {
        // Movimiento manual con botones (Mobile friendly)
        const orderId = target.dataset.id;
        const newStatus = target.dataset.status;
        if(orderId && newStatus) {
            actions.moveOrder(orderId, newStatus);
        }
    }
});

// --- DRAG AND DROP LOGIC ---
function attachDragAndDropEvents() {
    const cards = document.querySelectorAll('[draggable="true"]');
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData("orderId", card.dataset.orderId);
        });
    });

    const columns = document.querySelectorAll('[data-column-status]');
    columns.forEach(col => {
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            const orderId = e.dataTransfer.getData("orderId");
            const newStatus = col.dataset.columnStatus;
            if (orderId && newStatus) {
                actions.moveOrder(orderId, newStatus);
            }
        });
    });
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    actions.init();
    store.subscribe(renderApp);
    renderApp(); // Initial render
});
