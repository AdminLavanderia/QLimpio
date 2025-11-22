import { actions, store } from './services/store.js';
import { OrderStatus, Role, ClientType } from './types.js';
import { KANBAN_COLUMNS, CHECKLISTS } from './constants.js';

// --- ESTADO LOCAL ---
let currentView = 'dashboard';
let activeModal = null; 
let currentModalTab = 'general';
let filters = { turnero: { status: null, date: null }, inventory: { status: null } };

// --- ICONOS ---
const ICONS = {
    dashboard: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>`,
    turnero: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>`,
    clients: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`,
    inventory: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`,
    finance: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    services: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>`,
    equipment: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
    employees: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`,
    logout: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>`,
    plus: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>`,
    edit: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`,
    x: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
    prev: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>`,
    next: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`,
    trash: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`
};

const formatCurrency = (val) => val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
const formatDate = (dateStr) => { if(!dateStr) return '-'; return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }); }

// --- RENDERIZADORES ---

function renderLogin() {
    return `
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
            <h1 class="text-3xl font-bold text-center text-blue-600">Q' Limpio</h1>
            <form id="loginForm" class="space-y-4">
                <input id="username" type="text" placeholder="Usuario" class="w-full p-3 border rounded" required>
                <input id="password" type="password" placeholder="Contraseña" class="w-full p-3 border rounded" required>
                <div id="loginError" class="hidden text-red-500 text-sm text-center">Credenciales incorrectas</div>
                <button type="submit" data-action="login" class="w-full p-3 text-white bg-blue-600 rounded font-bold hover:bg-blue-700">Ingresar</button>
            </form>
        </div>
    </div>`;
}

function renderSidebar(currentUser) {
    const menu = [
        { id: 'dashboard', label: 'Panel Principal', icon: ICONS.dashboard },
        { id: 'turnero', label: 'Turnero', icon: ICONS.turnero },
        { id: 'clients', label: 'Clientes', icon: ICONS.clients },
    ];
    if (currentUser.role === Role.Admin) {
        menu.push(
            { id: 'inventory', label: 'Inventario', icon: ICONS.inventory },
            { id: 'employees', label: 'Empleados', icon: ICONS.employees },
            { id: 'services', label: 'Servicios', icon: ICONS.services },
            { id: 'equipment', label: 'Equipos', icon: ICONS.equipment },
            { id: 'finance', label: 'Finanzas', icon: ICONS.finance }
        );
    }

    return `
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        <div class="h-20 flex items-center justify-center border-b"><h1 class="text-2xl font-bold text-blue-600">Q' Limpio</h1></div>
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            ${menu.map(item => `<button data-action="nav" data-view="${item.id}" class="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg ${currentView === item.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}">${item.icon}<span class="ml-4">${item.label}</span></button>`).join('')}
        </nav>
        <div class="p-4 border-t"><button data-action="logout" class="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">${ICONS.logout}<span class="ml-4">Salir</span></button></div>
    </aside>`;
}

function renderDashboard(state) {
    const { orders = [], inventory = [] } = state;
    const todayStr = new Date().toISOString().split('T')[0];
    const ordersToday = orders.filter(o => o.receptionDate === todayStr).length;
    const incomeToday = orders.filter(o => o.receptionDate === todayStr).reduce((sum, o) => sum + o.paidAmount, 0);
    const ready = orders.filter(o => o.status === OrderStatus.Ready).length;
    const alerts = inventory.filter(i => i.stock <= i.minStock).length;

    return `
    <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500"><p class="text-gray-500 text-sm">Pedidos Hoy</p><p class="text-3xl font-bold">${ordersToday}</p></div>
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-green-500"><p class="text-gray-500 text-sm">Ingresos Hoy</p><p class="text-3xl font-bold">${formatCurrency(incomeToday)}</p></div>
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500"><p class="text-gray-500 text-sm">Listos</p><p class="text-3xl font-bold">${ready}</p></div>
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-red-500"><p class="text-gray-500 text-sm">Alertas Stock</p><p class="text-3xl font-bold text-red-600">${alerts}</p></div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
             <h3 class="font-bold text-lg mb-4">Acciones Rápidas</h3>
             <div class="flex flex-wrap gap-4">
                <button data-action="open-modal" data-modal="order" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 inline-flex items-center gap-2">${ICONS.plus} Nuevo Pedido</button>
                <button data-action="nav-filter" data-view="turnero" data-filter="ready" class="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 inline-flex items-center gap-2">${ICONS.finance} Cobrar / Entregar</button>
             </div>
        </div>
    </div>`;
}

function renderTurnero(state) {
    const { orders = [], clients = [] } = state;
    let visible = orders;
    if (filters.turnero.date === 'today') visible = visible.filter(o => o.receptionDate === new Date().toISOString().split('T')[0]);
    if (filters.turnero.status) visible = visible.filter(o => o.status === filters.turnero.status);

    return `
    <div class="h-full flex flex-col">
        <div class="p-4 bg-white border-b flex justify-between items-center"><h2 class="text-xl font-bold">Turnero</h2>${(filters.turnero.status || filters.turnero.date) ? `<button data-action="clear-filters" class="text-blue-600 text-sm">Ver Todos</button>` : ''}</div>
        <div class="flex-1 overflow-x-auto p-4 bg-gray-100"><div class="flex space-x-4 h-full">
            ${KANBAN_COLUMNS.map(status => {
                const colOrders = visible.filter(o => o.status === status);
                const prev = KANBAN_COLUMNS[KANBAN_COLUMNS.indexOf(status) - 1];
                const next = KANBAN_COLUMNS[KANBAN_COLUMNS.indexOf(status) + 1];
                return `
                <div class="w-72 flex-shrink-0 flex flex-col h-full bg-gray-50 rounded-lg border" ondragover="event.preventDefault()" data-column-status="${status}">
                    <div class="p-3 border-b bg-white font-bold flex justify-between rounded-t-lg">${status} <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">${colOrders.length}</span></div>
                    <div class="p-2 flex-1 overflow-y-auto space-y-2">
                        ${colOrders.map(o => {
                            const client = clients.find(c => c.id === o.clientId);
                            return `
                            <div draggable="true" data-order-id="${o.id}" data-action="open-details" data-id="${o.id}" class="bg-white p-3 rounded shadow cursor-pointer border-l-4 ${o.isExpress ? 'border-orange-400' : 'border-blue-400'} hover:shadow-md">
                                <div class="flex justify-between font-bold"><span>#${o.numericId}</span> ${o.isExpress ? '<span class="text-orange-500 text-xs">EXP</span>' : ''}</div>
                                <div class="text-sm text-gray-600 truncate">${client ? client.name : 'Cliente?'}</div>
                                <div class="text-xs text-gray-400 mt-1">${formatDate(o.deliveryDate)}</div>
                                <div class="flex justify-between mt-2 pt-2 border-t" onclick="event.stopPropagation()">
                                    ${prev ? `<button data-action="move-order" data-id="${o.id}" data-status="${prev}" class="text-gray-400 hover:text-blue-600">${ICONS.prev}</button>` : '<div></div>'}
                                    ${next ? `<button data-action="move-order" data-id="${o.id}" data-status="${next}" class="text-gray-400 hover:text-blue-600">${ICONS.next}</button>` : '<div></div>'}
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
            }).join('')}
        </div></div>
    </div>`;
}

function renderTable(title, headers, rows, addAction) {
    return `
    <div class="space-y-4">
        <div class="flex justify-between items-center"><h2 class="text-xl font-bold">${title}</h2><button data-action="${addAction}" class="bg-blue-600 text-white px-4 py-2 rounded font-bold flex gap-2 items-center">${ICONS.plus} Nuevo</button></div>
        <div class="bg-white rounded shadow overflow-hidden"><table class="w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-500 uppercase text-xs"><tr>${headers.map(h => `<th class="px-6 py-3">${h}</th>`).join('')}<th class="px-6 py-3 text-right"></th></tr></thead>
            <tbody class="divide-y">${rows}</tbody>
        </table></div>
    </div>`;
}

function renderClientsView(state) {
    const rows = (state.clients || []).map(c => `<tr class="hover:bg-gray-50"><td class="px-6 py-4 font-medium">${c.name}</td><td class="px-6 py-4">${c.phone}</td><td class="px-6 py-4">${c.type}</td><td class="px-6 py-4 text-right"><button data-action="open-modal" data-modal="client" data-id="${c.id}" class="text-blue-600 hover:underline">Editar</button></td></tr>`).join('');
    return renderTable('Clientes', ['Nombre', 'Teléfono', 'Tipo'], rows, 'open-modal" data-modal="client');
}

function renderInventoryView(state) {
    const rows = (state.inventory || []).map(i => `<tr class="hover:bg-gray-50"><td class="px-6 py-4 font-medium">${i.name}</td><td class="px-6 py-4">${i.stock} ${i.unit}</td><td class="px-6 py-4">${i.minStock}</td><td class="px-6 py-4 text-right"><button data-action="open-modal" data-modal="inventory" data-id="${i.id}" class="text-blue-600 hover:underline">Editar</button></td></tr>`).join('');
    return renderTable('Inventario', ['Item', 'Stock', 'Mínimo'], rows, 'open-modal" data-modal="inventory');
}

function renderEmployeesView(state) {
    const rows = (state.employees || []).map(e => `<tr class="hover:bg-gray-50"><td class="px-6 py-4 font-medium">${e.name}</td><td class="px-6 py-4">${e.username}</td><td class="px-6 py-4">${e.role}</td><td class="px-6 py-4 text-right"><button data-action="open-modal" data-modal="employee" data-id="${e.id}" class="text-blue-600 hover:underline">Editar</button></td></tr>`).join('');
    return renderTable('Empleados', ['Nombre', 'Usuario', 'Rol'], rows, 'open-modal" data-modal="employee');
}

function renderServicesView(state) {
    const rows = (state.services || []).map(s => `<tr class="hover:bg-gray-50"><td class="px-6 py-4 font-medium">${s.name}</td><td class="px-6 py-4">${formatCurrency(s.price)}</td><td class="px-6 py-4">${s.activo?'Sí':'No'}</td><td class="px-6 py-4 text-right"><button data-action="open-modal" data-modal="service" data-id="${s.id}" class="text-blue-600 hover:underline">Editar</button></td></tr>`).join('');
    return renderTable('Servicios', ['Nombre', 'Precio', 'Activo'], rows, 'open-modal" data-modal="service');
}

function renderEquipmentView(state) {
    const rows = (state.equipment || []).map(e => `<tr class="hover:bg-gray-50"><td class="px-6 py-4 font-medium">${e.name}</td><td class="px-6 py-4">${e.type}</td><td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs text-white ${e.status==='Operativa'?'bg-green-500':'bg-red-500'}">${e.status}</span></td><td class="px-6 py-4 text-right"><button data-action="open-modal" data-modal="equipment" data-id="${e.id}" class="text-blue-600 hover:underline">Editar</button></td></tr>`).join('');
    return renderTable('Equipos', ['Nombre', 'Tipo', 'Estado'], rows, 'open-modal" data-modal="equipment');
}

function renderFinanceView(state) {
    const rows = (state.expenses || []).map(e => `<tr class="hover:bg-gray-50"><td class="px-6 py-4">${formatDate(e.date)}</td><td class="px-6 py-4 font-medium">${e.concept}</td><td class="px-6 py-4">${e.category}</td><td class="px-6 py-4 text-right text-red-600 font-bold">${formatCurrency(e.amount)}</td><td class="px-6 py-4 text-right"></td></tr>`).join('');
    return renderTable('Gastos', ['Fecha', 'Concepto', 'Categoría', 'Monto'], rows, 'open-modal" data-modal="expense');
}

// --- MODALES ---

function renderOrderModal(order, state) {
    const isNew = !order || !order.id;
    const data = order || { numericId: 'Nuevo', clientId: '', status: OrderStatus.Reception, garments: [], services: [], deliveryDate: new Date().toISOString().split('T')[0] };
    if (isNew && currentModalTab !== 'general') currentModalTab = 'general';

    let content = '';
    if (currentModalTab === 'general') {
        content = `
        <div class="space-y-4">
            <div><label class="block text-sm font-bold mb-1">Cliente</label><select class="w-full p-2 border rounded" onchange="window.updateOrderField('clientId', this.value)"><option value="">Seleccionar...</option>${(state.clients || []).map(c => `<option value="${c.id}" ${c.id === data.clientId ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
            <div><label class="block text-sm font-bold mb-1">Fecha Entrega</label><input type="date" class="w-full p-2 border rounded" value="${data.deliveryDate}" onchange="window.updateOrderField('deliveryDate', this.value)"></div>
            <div><label class="block text-sm font-bold mb-1">Servicios</label><div class="border p-2 rounded max-h-32 overflow-y-auto space-y-1">${(state.services || []).filter(s=>s.activo).map(s => `<label class="flex items-center space-x-2"><input type="checkbox" ${data.services?.some(x=>x.serviceId===s.id)?'checked':''} onchange="window.toggleService('${s.id}', this.checked)"><span>${s.name}</span></label>`).join('')}</div></div>
            <div class="flex items-center gap-2 mt-2"><input type="checkbox" id="isExp" ${data.isExpress?'checked':''} onchange="window.updateOrderField('isExpress', this.checked)"><label for="isExp" class="font-bold text-sm text-orange-500">Servicio Express</label></div>
        </div>`;
    } else if (currentModalTab === 'tasks') {
        const list = CHECKLISTS[data.status] || [];
        content = `<ul class="space-y-2">${list.map(t => `<li class="flex items-center p-2 bg-gray-50 rounded"><input type="checkbox" ${(data.completedTasks||[]).includes(t.id)?'checked disabled':''} data-action="task" data-id="${t.id}" class="mr-2"><span>${t.label}</span></li>`).join('')}</ul>${!list.length?'<p class="text-gray-400">Sin tareas.</p>':''}`;
    } else if (currentModalTab === 'anotador') {
        content = `<div class="flex justify-between mb-2"><h3 class="font-bold">Prendas</h3><button data-action="add-garment" class="text-blue-600 font-bold text-sm">+ Añadir</button></div><div class="space-y-2 max-h-48 overflow-y-auto">${(data.garments||[]).map((g, i) => `<div class="flex gap-2"><input type="number" value="${g.quantity}" class="w-16 border p-1 text-center rounded" onchange="window.updateGarment(${i}, 'quantity', this.value)"><input type="text" value="${g.name}" class="flex-1 border p-1 rounded" placeholder="Descripción" onchange="window.updateGarment(${i}, 'name', this.value)"><button data-action="del-garment" data-idx="${i}" class="text-red-500">${ICONS.trash}</button></div>`).join('')}</div>`;
    } else if (currentModalTab === 'asignacion') {
        content = `<div><label class="font-bold text-sm">Asignado a:</label><select class="w-full p-2 border rounded mt-1" onchange="window.updateOrderField('assignedTo', this.value)"><option value="">Nadie</option>${(state.employees || []).map(e => `<option value="${e.id}" ${e.id === data.assignedTo ? 'selected' : ''}>${e.name}</option>`).join('')}</select></div>`;
    }

    return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-overlay">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-[80vh]">
            <div class="flex justify-between p-4 border-b bg-gray-50 rounded-t-lg"><h2 class="font-bold text-xl">${isNew ? 'Nuevo Pedido' : `Pedido #${data.numericId}`}</h2><button data-action="close-modal" class="text-gray-500 hover:text-red-500">${ICONS.x}</button></div>
            <div class="flex border-b bg-white">
                ${['General', 'Tareas', 'Prendas', 'Asignación'].map((lbl, idx) => `<button data-action="tab" data-tab="${['general', 'tasks', 'anotador', 'asignacion'][idx]}" class="flex-1 py-3 text-sm font-bold ${currentModalTab === ['general', 'tasks', 'anotador', 'asignacion'][idx] ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}">${lbl}</button>`).join('')}
            </div>
            <div class="p-6 flex-1 overflow-y-auto">${content}</div>
            <div class="p-4 border-t flex justify-end gap-2 rounded-b-lg"><button data-action="close-modal" class="px-4 py-2 border rounded bg-white text-gray-700 hover:bg-gray-100">Cancelar</button><button data-action="save-order" class="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Guardar</button></div>
        </div>
    </div>`;
}

function renderGenericModal(title, fieldsHTML, saveAction) {
    return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-overlay">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div class="p-4 border-b flex justify-between font-bold text-lg"><span>${title}</span><button data-action="close-modal" class="text-gray-500">${ICONS.x}</button></div>
            <form id="genericForm" class="p-6 space-y-4">${fieldsHTML}</form>
            <div class="p-4 border-t flex justify-end gap-2"><button data-action="close-modal" class="px-4 py-2 border rounded text-gray-700">Cancelar</button><button data-action="${saveAction}" class="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Guardar</button></div>
        </div>
    </div>`;
}

// --- RENDER APP ---
function renderApp() {
    try {
        const state = store.getState();
        const root = document.getElementById('root');
        if (state.isLoading) { root.innerHTML = '<div class="flex h-screen items-center justify-center font-bold text-blue-600 font-xl">Cargando Sistema...</div>'; return; }
        if (!state.currentUser) { root.innerHTML = renderLogin(); return; }

        let viewHTML = '';
        if (currentView === 'dashboard') viewHTML = renderDashboard(state);
        else if (currentView === 'turnero') viewHTML = renderTurnero(state);
        else if (currentView === 'clients') viewHTML = renderClientsView(state);
        else if (currentView === 'inventory') viewHTML = renderInventoryView(state);
        else if (currentView === 'employees') viewHTML = renderEmployeesView(state);
        else if (currentView === 'services') viewHTML = renderServicesView(state);
        else if (currentView === 'equipment') viewHTML = renderEquipmentView(state);
        else if (currentView === 'finance') viewHTML = renderFinanceView(state);

        let modalHTML = '';
        if (activeModal) {
            if (activeModal.type === 'order') modalHTML = renderOrderModal(activeModal.data, state);
            else {
                const d = activeModal.data;
                let fields = '';
                if (activeModal.type === 'client') fields = `<div><label class="text-sm font-bold">Nombre</label><input name="name" value="${d.name}" class="w-full border p-2 rounded"></div><div><label class="text-sm font-bold">Teléfono</label><input name="phone" value="${d.phone}" class="w-full border p-2 rounded"></div>`;
                else if (activeModal.type === 'inventory') fields = `<div><label class="text-sm font-bold">Nombre</label><input name="name" value="${d.name}" class="w-full border p-2 rounded"></div><div><label class="text-sm font-bold">Stock</label><input type="number" name="stock" value="${d.stock}" class="w-full border p-2 rounded"></div><div><label class="text-sm font-bold">Mínimo</label><input type="number" name="minStock" value="${d.minStock}" class="w-full border p-2 rounded"></div>`;
                else if (activeModal.type === 'employee') fields = `<div><label class="text-sm font-bold">Nombre</label><input name="name" value="${d.name}" class="w-full border p-2 rounded"></div><div><label class="text-sm font-bold">Usuario</label><input name="username" value="${d.username}" class="w-full border p-2 rounded"></div>`;
                else if (activeModal.type === 'service') fields = `<div><label class="text-sm font-bold">Nombre</label><input name="name" value="${d.name}" class="w-full border p-2 rounded"></div><div><label class="text-sm font-bold">Precio</label><input type="number" name="price" value="${d.price}" class="w-full border p-2 rounded"></div>`;
                else if (activeModal.type === 'equipment') fields = `<div><label class="text-sm font-bold">Nombre</label><input name="name" value="${d.name}" class="w-full border p-2 rounded"></div><div><label class="text-sm font-bold">Tipo</label><input name="type" value="${d.type}" class="w-full border p-2 rounded"></div>`;
                else if (activeModal.type === 'expense') fields = `<div><label class="text-sm font-bold">Concepto</label><input name="concept" value="${d.concept||''}" class="w-full border p-2 rounded"></div><div><label class="text-sm font-bold">Monto</label><input type="number" name="amount" value="${d.amount||0}" class="w-full border p-2 rounded"></div><div><label class="text-sm font-bold">Categoría</label><input name="category" value="${d.category||'Otros'}" class="w-full border p-2 rounded"></div>`;
                
                modalHTML = renderGenericModal(activeModal.type.toUpperCase(), fields, 'save-generic');
            }
        }

        root.innerHTML = `<div class="flex h-screen font-sans text-gray-800 overflow-hidden">${renderSidebar(state.currentUser)}<div class="flex-1 flex flex-col"><header class="h-16 border-b bg-white flex items-center justify-between px-6 flex-shrink-0"><h2 class="text-2xl font-bold capitalize">${currentView}</h2><div class="font-bold text-blue-600">${state.currentUser.name}</div></header><main class="flex-1 bg-gray-50 p-6 overflow-auto">${viewHTML}</main></div></div>${modalHTML}`;
        
        // Re-attach drag events
        document.querySelectorAll('[draggable="true"]').forEach(d => d.addEventListener('dragstart', e => e.dataTransfer.setData('text', d.dataset.id)));
        document.querySelectorAll('[data-column-status]').forEach(c => {
            c.addEventListener('dragover', e => e.preventDefault());
            c.addEventListener('drop', e => { e.preventDefault(); const id = e.dataTransfer.getData('text'); if(id) actions.moveOrder(id, c.dataset.columnStatus); });
        });
    } catch (err) {
        console.error(err);
        document.getElementById('root').innerHTML = `<div class="p-10 text-red-600 font-bold">Error crítico de renderizado: ${err.message}. Revisa la consola.</div>`;
    }
}

// --- EVENTOS (GLOBALES) ---
window.updateOrderField = (f, v) => { if(activeModal) activeModal.data[f] = v; };
window.updateGarment = (i, f, v) => { if(activeModal) activeModal.data.garments[i][f] = v; };
window.toggleService = (id, c) => {
    if(!activeModal) return;
    let s = activeModal.data.services || [];
    if(c) s.push({serviceId: id, quantity: 1}); else s = s.filter(x => x.serviceId !== id);
    activeModal.data.services = s;
};

document.addEventListener('click', async (e) => {
    // 1. Cerrar modal al hacer clic en el fondo
    if (e.target.classList.contains('modal-overlay')) {
        activeModal = null;
        renderApp();
        return;
    }

    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    e.preventDefault();
    
    const act = btn.dataset.action;
    const state = store.getState();

    if (act === 'login') { if(!actions.login(document.getElementById('username').value, document.getElementById('password').value)) document.getElementById('loginError').classList.remove('hidden'); }
    if (act === 'logout') actions.logout();
    if (act === 'nav') { currentView = btn.dataset.view; renderApp(); }
    if (act === 'nav-filter') { currentView = btn.dataset.view; filters.turnero = btn.dataset.filter === 'ready' ? {status:OrderStatus.Ready, date:null} : {date:'today', status:null}; renderApp(); }
    if (act === 'clear-filters') { filters.turnero = {status:null, date:null}; renderApp(); }
    
    if (act === 'open-modal') {
        const type = btn.dataset.modal;
        const id = btn.dataset.id;
        let data = {};
        if(type === 'order') { activeModal = {type: 'order', data: null}; currentModalTab = 'general'; }
        else {
            if(id) {
                if(type === 'client') data = state.clients.find(x=>x.id===id);
                if(type === 'inventory') data = state.inventory.find(x=>x.id===id);
                if(type === 'employee') data = state.employees.find(x=>x.id===id);
                if(type === 'service') data = state.services.find(x=>x.id===id);
                if(type === 'equipment') data = state.equipment.find(x=>x.id===id);
            } else data = {name: ''};
            activeModal = {type, data: {...data}};
        }
        renderApp();
    }
    if (act === 'close-modal') { activeModal = null; renderApp(); }
    
    if (act === 'open-details') {
        const o = state.orders.find(x => x.id === btn.dataset.id);
        if(o) { activeModal = {type:'order', data: JSON.parse(JSON.stringify(o))}; currentModalTab = 'tasks'; renderApp(); }
    }
    if (act === 'tab') { currentModalTab = btn.dataset.tab; renderApp(); }
    if (act === 'add-garment') { if(!activeModal.data.garments) activeModal.data.garments=[]; activeModal.data.garments.push({quantity:1, name:''}); renderApp(); }
    if (act === 'del-garment') { activeModal.data.garments.splice(btn.dataset.idx, 1); renderApp(); }
    if (act === 'task') { actions.completeTask(activeModal.data.id, btn.dataset.id); activeModal.data.completedTasks.push(btn.dataset.id); renderApp(); }
    if (act === 'save-order') {
        const d = activeModal.data;
        if(!d.clientId) { alert('Elige cliente'); return; }
        if(d.numericId==='Nuevo') actions.addOrder(d); else actions.updateOrder(d);
        activeModal = null; renderApp();
    }
    if (act === 'move-order') actions.moveOrder(btn.dataset.id, btn.dataset.status);

    if (act === 'save-generic') {
        const fd = new FormData(document.getElementById('genericForm'));
        const obj = Object.fromEntries(fd.entries());
        const final = { ...activeModal.data, ...obj };
        
        if(activeModal.type === 'client') actions.addOrUpdateClient(final);
        if(activeModal.type === 'inventory') actions.addOrUpdateInventoryItem({...final, stock: Number(final.stock), minStock: Number(final.minStock)});
        if(activeModal.type === 'employee') actions.addOrUpdateEmployee(final);
        if(activeModal.type === 'service') actions.addOrUpdateService({...final, price: Number(final.price)});
        if(activeModal.type === 'equipment') actions.addOrUpdateEquipment(final);
        if(activeModal.type === 'expense') actions.addExpense({...final, amount: Number(final.amount), date: new Date().toISOString()});
        
        activeModal = null; renderApp();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    actions.init();
    store.subscribe(renderApp);
    renderApp();
});
