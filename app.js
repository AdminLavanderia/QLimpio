import { actions, store } from './services/store.js';
import { OrderStatus, Role, ClientType } from './types.js';
import { KANBAN_COLUMNS, CHECKLISTS } from './constants.js';

// --- ESTADO LOCAL ---
let currentView = 'dashboard';
let activeModal = null; 
let currentModalTab = 'tasks';
let filters = { turnero: { status: null, date: null } };

// --- ICONOS (Simplificados para ahorrar espacio) ---
const ICONS = {
    dashboard: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
    turnero: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
    clients: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    inventory: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
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

const formatCurrency = (val) => val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
const formatDate = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

// --- RENDERIZADORES ---

function renderLogin() {
    return `
    <div class="flex items-center justify-center min-h-screen bg-background-light">
        <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
            <div class="text-center"><h1 class="text-4xl font-bold text-primary">Q' Limpio</h1><p class="mt-2 text-gray-500">Gestión de Lavandería</p></div>
            <form id="loginForm" class="mt-8 space-y-6">
                <div><input id="username" type="text" required class="w-full px-3 py-3 border border-gray-300 rounded" placeholder="Usuario"></div>
                <div><input id="password" type="password" required class="w-full px-3 py-3 border border-gray-300 rounded" placeholder="Contraseña"></div>
                <div id="loginError" class="text-sm text-center text-red-500 hidden">Usuario o contraseña incorrectos.</div>
                <button type="submit" data-action="login" class="w-full py-3 px-4 bg-primary text-white font-bold rounded hover:bg-blue-600">Ingresar</button>
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
            { id: 'finance', label: 'Finanzas', icon: ICONS.finance }
        );
    }

    return `
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        <div class="h-20 flex items-center justify-center border-b"><h1 class="text-2xl font-bold text-primary">Q' Limpio</h1></div>
        <nav class="flex-1 px-4 py-6 space-y-2">
            ${menu.map(item => `<button data-action="nav" data-view="${item.id}" class="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg ${currentView === item.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}">${item.icon}<span class="ml-4">${item.label}</span></button>`).join('')}
        </nav>
        <div class="p-4 border-t"><button data-action="logout" class="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">${ICONS.logout}<span class="ml-4">Salir</span></button></div>
    </aside>`;
}

function renderDashboard(state) {
    const { orders, inventory } = state;
    const todayStr = new Date().toISOString().split('T')[0];
    const ordersToday = orders.filter(o => o.receptionDate === todayStr).length;
    const incomeToday = orders.filter(o => o.receptionDate === todayStr).reduce((sum, o) => sum + o.paidAmount, 0);
    const ready = orders.filter(o => o.status === OrderStatus.Ready).length;
    const alerts = inventory.filter(i => i.stock <= i.minStock).length;

    return `
    <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500"><p class="text-sm text-gray-500">Pedidos Hoy</p><p class="text-3xl font-bold">${ordersToday}</p></div>
            <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500"><p class="text-sm text-gray-500">Ingresos Hoy</p><p class="text-3xl font-bold">${formatCurrency(incomeToday)}</p></div>
            <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500"><p class="text-sm text-gray-500">Listos</p><p class="text-3xl font-bold">${ready}</p></div>
            <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500"><p class="text-sm text-gray-500">Alertas Stock</p><p class="text-3xl font-bold">${alerts}</p></div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm">
             <h3 class="font-bold text-lg mb-4">Acciones</h3>
             <button data-action="open-modal" data-modal="order" class="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 inline-flex items-center gap-2">${ICONS.plus} Nuevo Pedido</button>
        </div>
    </div>`;
}

function renderTurnero(state) {
    const { orders, clients, employees } = state;
    let visible = orders;
    if (filters.turnero.date === 'today') visible = visible.filter(o => o.receptionDate === new Date().toISOString().split('T')[0]);
    if (filters.turnero.status) visible = visible.filter(o => o.status === filters.turnero.status);

    return `
    <div class="h-full flex flex-col">
        <div class="p-4 bg-white border-b flex justify-between items-center"><h2 class="text-xl font-bold">Turnero</h2>${(filters.turnero.status || filters.turnero.date) ? `<button data-action="clear-filters" class="text-blue-600 text-sm">Limpiar Filtros</button>` : ''}</div>
        <div class="flex-1 overflow-x-auto p-4 bg-gray-100"><div class="flex space-x-4 h-full">
            ${KANBAN_COLUMNS.map(status => {
                const colOrders = visible.filter(o => o.status === status);
                const prev = KANBAN_COLUMNS[KANBAN_COLUMNS.indexOf(status) - 1];
                const next = KANBAN_COLUMNS[KANBAN_COLUMNS.indexOf(status) + 1];
                return `
                <div class="w-72 flex-shrink-0 flex flex-col h-full bg-gray-50 rounded-lg" ondragover="event.preventDefault()" data-column-status="${status}">
                    <div class="p-3 border-b font-bold flex justify-between bg-white rounded-t-lg">${status} <span class="text-xs bg-gray-200 px-2 rounded-full">${colOrders.length}</span></div>
                    <div class="p-2 flex-1 overflow-y-auto space-y-2">
                        ${colOrders.map(o => {
                            const client = clients.find(c => c.id === o.clientId);
                            return `
                            <div draggable="true" data-order-id="${o.id}" data-action="open-details" data-id="${o.id}" class="bg-white p-3 rounded shadow cursor-pointer border-l-4 ${o.isExpress ? 'border-orange-400' : 'border-blue-400'} hover:shadow-md">
                                <div class="flex justify-between font-bold"><span>#${o.numericId}</span></div>
                                <div class="text-sm text-gray-600 truncate">${client ? client.name : 'Cliente?'}</div>
                                <div class="text-xs text-gray-400 mt-1">${formatDate(o.deliveryDate)}</div>
                                <div class="flex justify-between mt-2 pt-2 border-t" onclick="event.stopPropagation()">
                                    ${prev ? `<button data-action="move-order" data-id="${o.id}" data-status="${prev}" class="text-gray-400 hover:text-primary">${ICONS.prev}</button>` : '<div></div>'}
                                    ${next ? `<button data-action="move-order" data-id="${o.id}" data-status="${next}" class="text-gray-400 hover:text-primary">${ICONS.next}</button>` : '<div></div>'}
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
            }).join('')}
        </div></div>
    </div>`;
}

function renderClients(state) {
    return `
    <div class="space-y-6">
        <div class="flex justify-end"><button data-action="open-modal" data-modal="client" class="bg-primary text-white px-4 py-2 rounded font-bold flex items-center gap-2">${ICONS.plus} Añadir Cliente</button></div>
        <div class="bg-white rounded shadow overflow-hidden"><table class="w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th class="px-6 py-3">Nombre</th><th class="px-6 py-3">Teléfono</th><th class="px-6 py-3">Tipo</th><th class="px-6 py-3 text-right"></th></tr></thead>
            <tbody class="divide-y">${state.clients.map(c => `
                <tr class="hover:bg-gray-50"><td class="px-6 py-4 font-medium">${c.name}</td><td class="px-6 py-4">${c.phone}</td><td class="px-6 py-4">${c.type}</td><td class="px-6 py-4 text-right"><button data-action="open-modal" data-modal="client" data-id="${c.id}" class="text-primary hover:underline">Editar</button></td></tr>
            `).join('')}</tbody>
        </table></div>
    </div>`;
}

function renderOrderDetailsModal(order, state) {
    const { services, employees } = state;
    const isNew = !order || !order.id;
    const data = order || { numericId: 'Nuevo', clientId: '', status: OrderStatus.Reception, garments: [], services: [], deliveryDate: new Date().toISOString().split('T')[0] };
    const client = isNew ? null : state.clients.find(c => c.id === data.clientId);

    // Forzamos pestaña General si es nuevo
    if (isNew && currentModalTab !== 'general') currentModalTab = 'general';

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'tasks', label: 'Tareas' },
        { id: 'anotador', label: 'Prendas' },
        { id: 'asignacion', label: 'Asignación' }
    ];

    let content = '';
    if (currentModalTab === 'general') {
        content = `
            <div class="space-y-4">
                <div><label class="block text-sm font-bold mb-1">Cliente</label>
                <select class="w-full p-2 border rounded" onchange="window.updateOrderField('clientId', this.value)">
                    <option value="">Seleccionar...</option>
                    ${state.clients.map(c => `<option value="${c.id}" ${c.id === data.clientId ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select></div>
                <div><label class="block text-sm font-bold mb-1">Fecha Entrega</label><input type="date" class="w-full p-2 border rounded" value="${data.deliveryDate}" onchange="window.updateOrderField('deliveryDate', this.value)"></div>
                <div><label class="block text-sm font-bold mb-1">Servicios</label><div class="border p-2 rounded max-h-40 overflow-y-auto space-y-2">
                    ${services.filter(s => s.activo).map(s => {
                        const isSel = (data.services || []).some(ser => ser.serviceId === s.id);
                        return `<label class="flex items-center space-x-2"><input type="checkbox" ${isSel ? 'checked' : ''} onchange="window.toggleOrderService('${s.id}', this.checked)"><span>${s.name} (${formatCurrency(s.price)})</span></label>`;
                    }).join('')}
                </div></div>
                <div class="flex items-center mt-4"><input type="checkbox" id="isExp" ${data.isExpress ? 'checked' : ''} onchange="window.updateOrderField('isExpress', this.checked)"><label for="isExp" class="ml-2 text-sm font-bold text-orange-500">Servicio Express</label></div>
            </div>`;
    } else if (currentModalTab === 'tasks') {
        const list = CHECKLISTS[data.status] || [];
        content = `<ul class="space-y-2">${list.map(t => {
            const done = (data.completedTasks || []).includes(t.id);
            return `<li class="flex items-center p-2 rounded bg-gray-50"><input type="checkbox" ${done ? 'checked disabled' : ''} data-action="complete-task" data-task-id="${t.id}" class="mr-3"><span class="${done ? 'line-through text-gray-400' : ''}">${t.label}</span></li>`;
        }).join('')}</ul>${list.length===0?'<p class="text-gray-400">Sin tareas.</p>':''}`;
    } else if (currentModalTab === 'anotador') {
        content = `<div class="flex justify-between mb-2"><h3 class="font-bold">Prendas</h3><button type="button" data-action="add-garment" class="text-blue-600 font-bold">+ Añadir</button></div>
        <div class="space-y-2 max-h-60 overflow-y-auto">${(data.garments || []).map((g, idx) => `
            <div class="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded border">
                <input type="number" value="${g.quantity}" class="col-span-2 p-1 border text-center" data-idx="${idx}" data-field="quantity" onchange="window.updateGarment(this)">
                <input type="text" value="${g.name}" class="col-span-8 p-1 border" placeholder="Prenda..." data-idx="${idx}" data-field="name" onchange="window.updateGarment(this)">
                <button type="button" class="col-span-2 text-red-500" data-action="remove-garment" data-idx="${idx}">${ICONS.trash}</button>
            </div>`).join('')}</div>`;
    } else if (currentModalTab === 'asignacion') {
        content = `<div><label class="font-bold text-sm">Asignado a:</label><select class="w-full p-2 border rounded mt-1" onchange="window.updateOrderField('assignedTo', this.value)"><option value="">Nadie</option>${employees.map(e => `<option value="${e.id}" ${e.id === data.assignedTo ? 'selected' : ''}>${e.name}</option>`).join('')}</select></div>`;
    }

    return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-action="close-modal">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-[80vh]" onclick="event.stopPropagation()">
            <header class="flex justify-between p-4 border-b bg-gray-50"><h2 class="text-xl font-bold">${isNew ? 'Nuevo Pedido' : `Pedido #${data.numericId}`}</h2><button data-action="close-modal">${ICONS.x}</button></header>
            <div class="flex border-b">${tabs.map(t => `<button data-action="switch-tab" data-tab="${t.id}" class="flex-1 py-3 font-bold text-sm ${currentModalTab === t.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}">${t.label}</button>`).join('')}</div>
            <main class="p-6 overflow-y-auto flex-1">${content}</main>
            <footer class="p-4 border-t bg-gray-50 flex justify-end gap-2"><button data-action="close-modal" class="px-4 py-2 border rounded bg-white">Cancelar</button><button data-action="save-order-details" class="px-6 py-2 bg-primary text-white rounded font-bold">Guardar</button></footer>
        </div>
    </div>`;
}

function renderGenericModal(title, fields, saveAction) {
    return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-action="close-modal">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" onclick="event.stopPropagation()">
            <header class="p-4 border-b flex justify-between"><h2 class="font-bold text-xl">${title}</h2><button data-action="close-modal">${ICONS.x}</button></header>
            <main class="p-6 space-y-4"><form id="modal-form">${fields}</form></main>
            <footer class="p-4 border-t flex justify-end gap-2"><button data-action="close-modal" class="px-4 py-2 border rounded">Cancelar</button><button data-action="${saveAction}" class="px-4 py-2 bg-primary text-white rounded font-bold">Guardar</button></footer>
        </div>
    </div>`;
}

// --- APP RENDER ---

function renderApp() {
    const state = store.getState();
    const root = document.getElementById('root');

    if (state.isLoading) { root.innerHTML = '<div class="flex h-screen items-center justify-center text-primary font-bold">Cargando...</div>'; return; }
    if (!state.currentUser) { root.innerHTML = renderLogin(); return; }

    let content = '';
    if (currentView === 'dashboard') content = renderDashboard(state);
    else if (currentView === 'turnero') content = renderTurnero(state);
    else if (currentView === 'clients') content = renderClients(state);
    else content = `<div class="p-8 text-center text-gray-500">Vista ${currentView} en construcción</div>`;

    let modalHTML = '';
    if (activeModal) {
        if (activeModal.type === 'order') {
            modalHTML = renderOrderDetailsModal(activeModal.data, state);
        } else if (activeModal.type === 'client') {
            const d = activeModal.data;
            const fields = `
                <div><label class="block text-sm font-bold">Nombre</label><input name="name" value="${d.name}" class="w-full p-2 border rounded"></div>
                <div><label class="block text-sm font-bold">Teléfono</label><input name="phone" value="${d.phone}" class="w-full p-2 border rounded"></div>
            `;
            modalHTML = renderGenericModal('Cliente', fields, 'save-client');
        }
    }

    root.innerHTML = `
    <div class="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
        ${renderSidebar(state.currentUser)}
        <div class="flex-1 flex flex-col overflow-hidden">
            <header class="h-16 bg-white border-b flex items-center justify-between px-8"><h2 class="text-2xl font-bold capitalize">${currentView}</h2><div class="font-bold text-primary">${state.currentUser.name}</div></header>
            <main class="flex-1 overflow-auto p-8">${content}</main>
        </div>
    </div>
    ${modalHTML}`;

    // Re-attach drag events
    document.querySelectorAll('[draggable="true"]').forEach(d => d.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', d.dataset.orderId)));
    document.querySelectorAll('[data-column-status]').forEach(c => {
        c.addEventListener('dragover', e => e.preventDefault());
        c.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const status = c.dataset.columnStatus;
            if(id && status) actions.moveOrder(id, status);
        });
    });
}

// --- EVENTOS ---

// Helpers globales
window.updateOrderField = (f, v) => { if (activeModal) activeModal.data[f] = v; };
window.toggleOrderService = (id, chk) => {
    if (activeModal) {
        let s = activeModal.data.services || [];
        if (chk) s.push({ serviceId: id, quantity: 1 });
        else s = s.filter(x => x.serviceId !== id);
        activeModal.data.services = s;
    }
};
window.updateGarment = (el) => { if (activeModal) activeModal.data.garments[el.dataset.idx][el.dataset.field] = el.value; };

document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    e.preventDefault();
    const act = btn.dataset.action;
    const state = store.getState();

    if (act === 'login') {
        if (!actions.login(document.getElementById('username').value, document.getElementById('password').value)) document.getElementById('loginError').classList.remove('hidden');
    }
    if (act === 'logout') actions.logout();
    if (act === 'nav') { currentView = btn.dataset.view; renderApp(); }
    if (act === 'clear-filters') { filters.turnero = {status:null, date:null}; renderApp(); }

    if (act === 'open-modal') {
        const type = btn.dataset.modal;
        const id = btn.dataset.id;
        if (type === 'order') {
            currentModalTab = 'general';
            activeModal = { type: 'order', data: null };
        } else if (type === 'client') {
            const data = id ? state.clients.find(c => c.id === id) : { id: '', name: '', phone: '', type: 'Regular' };
            activeModal = { type: 'client', data: { ...data } };
        }
        renderApp();
    }
    if (act === 'close-modal') { activeModal = null; renderApp(); }
    
    if (act === 'open-details') {
        const o = state.orders.find(x => x.id === btn.dataset.id);
        if(o) { activeModal = { type: 'order', data: JSON.parse(JSON.stringify(o)) }; currentModalTab = 'tasks'; renderApp(); }
    }
    if (act === 'switch-tab') { currentModalTab = btn.dataset.tab; renderApp(); }
    
    if (act === 'add-garment') {
        if (!activeModal.data.garments) activeModal.data.garments = [];
        activeModal.data.garments.push({ quantity: 1, name: '' });
        renderApp();
    }
    if (act === 'remove-garment') { activeModal.data.garments.splice(btn.dataset.idx, 1); renderApp(); }
    
    if (act === 'save-order-details') {
        const d = activeModal.data;
        if (!d.clientId) { alert('Selecciona cliente'); return; }
        if (d.numericId === 'Nuevo') actions.addOrder(d);
        else actions.updateOrder(d);
        activeModal = null;
        renderApp();
    }

    if (act === 'save-client') {
        const fd = new FormData(document.getElementById('modal-form'));
        actions.addOrUpdateClient({ ...activeModal.data, ...Object.fromEntries(fd.entries()) });
        activeModal = null;
        renderApp();
    }

    if (act === 'complete-task') {
        actions.completeTask(activeModal.data.id, btn.dataset.taskId);
        // Hack visual rápido
        if(!activeModal.data.completedTasks) activeModal.data.completedTasks = [];
        activeModal.data.completedTasks.push(btn.dataset.taskId);
        renderApp();
    }
    
    if (act === 'move-order') {
        actions.moveOrder(btn.dataset.id, btn.dataset.status);
    }
});

// --- INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    actions.init();
    store.subscribe(renderApp);
    renderApp();
});
