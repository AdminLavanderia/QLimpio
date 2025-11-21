
import { useState, useEffect } from 'react';
import { CHECKLISTS, KANBAN_COLUMNS } from '../constants.js';
import { db } from './firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { OrderStatus, ClientType, Role } from '../types.js';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const formatDate = (date) => date.toISOString().split('T')[0];

// --- INITIAL / FALLBACK DATA ---
const initialClients = [
    { id: 'c1', name: 'Hotel Central', phone: '555-1234', type: ClientType.Corporate, preferences: 'Doblar camisas en lugar de colgar.', participa_fidelizacion: true, puntos_actuales: 1250, fecha_ultimo_pedido: formatDate(yesterday) },
    { id: 'c2', name: 'Ana S.', phone: '555-5678', type: ClientType.Regular, preferences: 'Usar siempre suavizante hipoalergénico.', participa_fidelizacion: true, puntos_actuales: 340, fecha_ultimo_pedido: formatDate(today) },
    { id: 'c3', name: 'Taller "El Rápido"', phone: '555-8765', type: ClientType.Corporate, preferences: 'Ropa de trabajo con mucha grasa.', participa_fidelizacion: false, puntos_actuales: 0, fecha_ultimo_pedido: null },
    { id: 'c4', name: 'Juan Pérez', phone: '555-4321', type: ClientType.Regular, preferences: '', participa_fidelizacion: false, puntos_actuales: 0, fecha_ultimo_pedido: null },
];

const initialInventory = [
    { id: 'i1', name: 'Jabón Líquido Ala x 5L', stock: 3.5, unit: 'L', minStock: 1.5, provider: 'Distribuidora Limpieza Total' },
    { id: 'i2', name: 'Suavizante Vivere x 3L', stock: 1.0, unit: 'L', minStock: 1.5, provider: 'Distribuidora Limpieza Total' },
    { id: 'i3', name: 'Bolsas Medianas x 100u', stock: 80, unit: 'Uds', minStock: 50, provider: 'Bolsaplast' },
    { id: 'i4', name: 'Desmanchador Querubín', stock: 0.4, unit: 'L', minStock: 0.5, provider: 'Química del Norte' },
    { id: 'i5', name: 'Ubicación Estantería', stock: 100, unit: 'Uds', minStock: 10, provider: 'N/A' },
];

const initialServices = [
    { id: 's1', name: 'Lavado por Docena', description: 'Lavado y secado de hasta 12 prendas de ropa común.', price: 5000, activo: true, insumos_consumidos: [{ inventoryItemId: 'i1', quantity: 0.1 }, { inventoryItemId: 'i2', quantity: 0.05 }] },
    { id: 's2', name: 'Planchado por Prenda', description: 'Planchado profesional para una prenda.', price: 800, activo: true, insumos_consumidos: [] },
    { id: 's3', name: 'Lavado de Acolchado Queen', description: 'Lavado, desinfección y secado de acolchado tamaño Queen.', price: 12000, activo: true, insumos_consumidos: [{ inventoryItemId: 'i1', quantity: 0.2 }, { inventoryItemId: 'i2', quantity: 0.1 }, { inventoryItemId: 'i3', quantity: 1 }] },
    { id: 's4', name: 'Servicio Express', description: 'Recargo por servicio de entrega urgente.', price: 4000, activo: false, insumos_consumidos: [] },
];

const initialEmployees = [
    { id: 'e1', name: 'Juan Pérez', username: 'juan.perez', role: Role.Admin, avatarUrl: 'https://picsum.photos/id/237/100/100', password: 'password' },
    { id: 'e2', name: 'María Gómez', username: 'maria.gomez', role: Role.Employee, avatarUrl: 'https://picsum.photos/id/238/100/100', password: 'password' },
];

const initialEquipment = [
    { id: 'eq1', name: 'Lavadora LG #1', type: 'Lavadora', status: 'Operativa', notes: 'Revisar centrifugado.' },
    { id: 'eq2', name: 'Lavadora Samsung #2', type: 'Lavadora', status: 'Fuera de Servicio', notes: 'Falla eléctrica.' },
    { id: 'eq3', name: 'Secadora Grande', type: 'Secadora', status: 'Operativa', notes: '' },
    { id: 'eq4', name: 'Plancha Industrial', type: 'Plancha', status: 'Operativa' },
    { id: 'eq5', name: 'Dobladora Automática', type: 'Dobladora', status: 'Operativa' },
    { id: 'eq6', name: 'Selladora de Bolsas', type: 'Selladora', status: 'Operativa' },
];

const initialOrders = [
    { id: 'o1', numericId: 101, clientId: 'c2', services: [{ serviceId: 's1', quantity: 1 }], garments: [{id: 'g1', name: 'Camisa', color: 'Azul', brand: 'Polo', details: 'Pequeña mancha en cuello', controlado_en_empaque: false, quantity: 1, photos: []}], status: OrderStatus.Ready, isExpress: false, receptionDate: formatDate(yesterday), deliveryDate: formatDate(today), totalAmount: 5000, paidAmount: 0, info_empaque: { cantidad_paquetes: 1, ubicacion: 'A1'}, internalNotes: '', assignedTo: 'e2', history: [{id:'l1', timestamp: new Date().toISOString(), userId: 'e1', action: 'Pedido Creado'}, {id:'l1a', timestamp: new Date(new Date(yesterday).setHours(10)).toISOString(), userId: 'e2', action: 'Tarea completada: "Prelavado completado".'}], usedSupplies: [{inventoryItemId: 'i1', quantity: 0.1}, {inventoryItemId: 'i2', quantity: 0.05}], completedTasks: ['register_garments', 'classify_garments', 'spot_treat', 'pre_wash', 'load_machine', 'centrifuge', 'hang_dry', 'collect_dry', 'fold_garments', 'final_control', 'package_garments'] },
    { id: 'o2', numericId: 102, clientId: 'c1', services: [{ serviceId: 's1', quantity: 5 }], garments: [], status: OrderStatus.Washing, isExpress: false, receptionDate: formatDate(today), deliveryDate: formatDate(tomorrow), totalAmount: 25000, paidAmount: 0, info_empaque: { cantidad_paquetes: 5, ubicacion: ''}, internalNotes: 'Necesita lavado industrial.', machineId: 'eq1', assignedTo: 'e1', history: [{id:'l2', timestamp: new Date().toISOString(), userId: 'e1', action: 'Pedido Creado'}, {id:'l2a', timestamp: new Date().toISOString(), userId: 'e1', action: 'Tarea completada: "Prelavado completado".'}], usedSupplies: [{inventoryItemId: 'i1', quantity: 0.5}, {inventoryItemId: 'i2', quantity: 0.25}], completedTasks: ['register_garments', 'classify_garments', 'spot_treat', 'pre_wash'] },
    { id: 'o3', numericId: 103, clientId: 'c3', services: [{ serviceId: 's1', quantity: 2 }, { serviceId: 's4', quantity: 1}], garments: [], status: OrderStatus.Classification, isExpress: true, receptionDate: formatDate(today), deliveryDate: formatDate(today), totalAmount: 14000, paidAmount: 0, info_empaque: { cantidad_paquetes: 2, ubicacion: ''}, internalNotes: 'Tratamiento especial de manchas de aceite.', assignedTo: 'e2', history: [{id:'l3', timestamp: new Date().toISOString(), userId: 'e2', action: 'Pedido Creado'}], usedSupplies: [{inventoryItemId: 'i1', quantity: 0.2}, {inventoryItemId: 'i2', quantity: 0.1}], completedTasks: ['register_garments'], isOverdue: true },
    { id: 'o4', numericId: 104, clientId: 'c4', services: [{ serviceId: 's3', quantity: 1 }], garments: [], status: OrderStatus.Delivered, isExpress: false, receptionDate: formatDate(yesterday), deliveryDate: formatDate(tomorrow), totalAmount: 12000, paidAmount: 12000, info_empaque: { cantidad_paquetes: 1, ubicacion: 'C5'}, internalNotes: '', assignedTo: 'e1', history: [{id:'l4', timestamp: new Date(new Date(yesterday).setDate(today.getDate() - 2)).toISOString(), userId: 'e1', action: 'Pedido Creado'}, {id:'l4a', timestamp: new Date(yesterday).toISOString(), userId: 'e1', action: `Estado cambiado de "${OrderStatus.Ready}" a "${OrderStatus.Delivered}".`}], usedSupplies: [{inventoryItemId: 'i1', quantity: 0.2}, {inventoryItemId: 'i2', quantity: 0.1}], completedTasks: [] },
    { id: 'o5', numericId: 105, clientId: 'c2', services: [{ serviceId: 's2', quantity: 5 }], garments: [{id: 'g2', name: 'Pantalón', color: 'Negro', brand: 'Levis', details: '', controlado_en_empaque: true, quantity: 1, photos: []}, {id: 'g3', name: 'Vestido', color: 'Rojo', brand: '', details: 'Seda', controlado_en_empaque: true, quantity: 1, photos: []}], status: OrderStatus.FinalControl, isExpress: false, receptionDate: formatDate(today), deliveryDate: formatDate(tomorrow), totalAmount: 4000, paidAmount: 0, info_empaque: { cantidad_paquetes: 1, ubicacion: 'B2'}, internalNotes: '', assignedTo: 'e2', history: [{id:'l5', timestamp: new Date().toISOString(), userId: 'e2', action: 'Pedido Creado'}, {id:'l5a', timestamp: new Date().toISOString(), userId: 'e2', action: 'Tarea completada: "Centrifugado finalizado".'}], usedSupplies: [], completedTasks: ['register_garments', 'classify_garments', 'spot_treat', 'pre_wash', 'load_machine', 'centrifuge', 'hang_dry', 'collect_dry', 'iron_garments'] },
    { id: 'o6', numericId: 106, clientId: 'c1', services: [{ serviceId: 's1', quantity: 3 }], garments: [], status: OrderStatus.Assigned, isExpress: false, receptionDate: formatDate(today), deliveryDate: formatDate(tomorrow), totalAmount: 15000, paidAmount: 0, info_empaque: { cantidad_paquetes: 0, ubicacion: ''}, internalNotes: 'Nuevo pedido de sábanas.', assignedTo: 'e2', history: [{id:'l6', timestamp: new Date().toISOString(), userId: 'e1', action: 'Pedido Creado'}], usedSupplies: [{inventoryItemId: 'i1', quantity: 0.3}, {inventoryItemId: 'i2', quantity: 0.15}], completedTasks: [] },
];

const initialAttendance = [
    { id: 'a1', employeeId: 'e1', checkIn: new Date(new Date().setHours(new Date().getHours() - 9)).toISOString(), checkOut: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString() },
    { id: 'a2', employeeId: 'e2', checkIn: new Date(new Date(today).setDate(today.getDate()-1)).toISOString(), checkOut: new Date(new Date(today).setDate(today.getDate()-1)).toISOString() },
];

const initialFilters = {
    turnero: { status: null, date: null },
    inventory: { status: null },
};

const initialPromotions = [
    { id: 'p1', name: '20% Off en Acolchados', description: 'Promo invierno.', type: 'Porcentaje', value: 20, startDate: '2025-06-01', endDate: '2025-08-31', applicableServices: ['s3'], active: true },
    { id: 'p2', name: '$2000 de Regalo', description: 'Descuento para nuevos clientes.', type: 'Monto Fijo', value: 2000, startDate: '2025-01-01', endDate: '2025-12-31', applicableServices: [], active: true },
];

const initialLoyaltyConfig = {
    pointsPerPeso: 0.01, // 1 punto por cada $100
    pesoValuePerPoint: 10, // 1 punto = $10
    expirationDays: 90,
};

const initialPointMovements = [
    { id: 'pm1', clientId: 'c1', orderId: 'o2', type: 'acumulacion', points: 250, timestamp: new Date().toISOString() },
];

const initialExpenseCategories = ["Insumos", "Alquiler", "Sueldos", "Mantenimiento", "Servicios Públicos", "Marketing", "Otros"];

// --- FINANCE DATA ---
const initialPayments = [
    { id: 'pay1', orderId: 'o4', clientId: 'c4', amount: 12000, method: 'Efectivo', paymentDate: new Date(yesterday).toISOString(), isAdvance: false },
];

const initialExpenses = [
    { id: 'ex1', concept: 'Compra de Jabón a proveedor', amount: 25000, date: formatDate(yesterday), paymentMethod: 'Transferencia', category: 'Insumos' },
    { id: 'ex2', concept: 'Pago de alquiler mensual', amount: 150000, date: new Date().toISOString().split('T')[0], paymentMethod: 'Transferencia', category: 'Alquiler' },
    { id: 'ex3', concept: 'Campaña publicitaria Facebook', amount: 15000, date: new Date(new Date().setDate(today.getDate() - 15)).toISOString().split('T')[0], paymentMethod: 'Tarjeta de Crédito', category: 'Marketing', installmentsInfo: { count: 3, firstDueDate: new Date().toISOString().split('T')[0] } },
];

const initialAccountsPayable = [
    { id: 'ap1', expenseId: 'ex3', concept: 'Campaña publicitaria Facebook (1/3)', dueDate: new Date().toISOString().split('T')[0], amount: 5000, status: 'pagada', paymentDate: new Date().toISOString().split('T')[0] },
    { id: 'ap2', expenseId: 'ex3', concept: 'Campaña publicitaria Facebook (2/3)', dueDate: new Date(new Date().setMonth(today.getMonth() + 1)).toISOString().split('T')[0], amount: 5000, status: 'pendiente' },
    { id: 'ap3', expenseId: 'ex3', concept: 'Campaña publicitaria Facebook (3/3)', dueDate: new Date(new Date().setMonth(today.getMonth() + 2)).toISOString().split('T')[0], amount: 5000, status: 'pendiente' },
];

const initialFullState = {
    isLoading: true, // Add loading state
    clients: initialClients,
    services: initialServices,
    orders: initialOrders,
    inventory: initialInventory,
    employees: initialEmployees,
    equipment: initialEquipment,
    attendance: initialAttendance,
    currentUser: null,
    filters: initialFilters,
    promotions: initialPromotions,
    loyaltyConfig: initialLoyaltyConfig,
    pointMovements: initialPointMovements,
    payments: initialPayments,
    expenses: initialExpenses,
    accountsPayable: initialAccountsPayable,
    notificationLogs: [],
    expenseCategories: initialExpenseCategories,
};

let state = { ...initialFullState };

const listeners = new Set();

// Helper function to save specific data collections to Firestore
const saveToFirestore = async (key, data) => {
    try {
        await setDoc(doc(db, "appData", key), { list: data });
    } catch (e) {
        // Fail silently on save error to not block UI, but log it
        console.warn(`Error saving ${key} to Firestore (check permissions):`, e);
    }
};

// Load all data from Firestore on startup
const initStore = async () => {
    try {
        const collectionsToLoad = [
            'clients', 'services', 'orders', 'inventory', 'employees', 'equipment', 'attendance', 
            'promotions', 'loyaltyConfig', 'pointMovements', 'payments', 'expenses', 
            'accountsPayable', 'notificationLogs', 'expenseCategories'
        ];

        const newState = { isLoading: false };
        let hasConnectionError = false;

        // We use Promise.allSettled to ensure that if one request fails (e.g. permission denied),
        // the app still loads with whatever data it can or falls back to initial data.
        const results = await Promise.allSettled(collectionsToLoad.map(async (key) => {
            const docRef = doc(db, "appData", key);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (key === 'loyaltyConfig') {
                    return { key, data: data };
                } else {
                    return { key, data: data.list };
                }
            }
            return null;
        }));

        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
                newState[result.value.key] = result.value.data;
            } else if (result.status === 'rejected') {
                hasConnectionError = true;
                console.warn("Error loading data chunk:", result.reason);
            }
        });

        if (hasConnectionError) {
            console.error("Could not load some data from Firestore. Using local fallback data where necessary.");
        }

        // If we didn't get orders (either DB is empty or connection failed), use initial data
        if (!newState.orders) {
            console.log("Firestore empty or unreachable, using initial demo data.");
            // We don't overwrite state here, just let it fallback to the initialFullState values 
            // which are already in 'state' variable if we didn't update them.
            // However, we must ensure 'isLoading' is set to false.
            store.setState({ isLoading: false });
        } else {
            store.setState(newState);
        }
        
    } catch (error) {
        console.error("Critical error initializing store:", error);
        store.setState({ isLoading: false });
    }
};


const authenticate = (employees, usernameInput, password) => {
    const employee = employees.find((e) => {
        // Compare explicit username directly
        return e.username.toLowerCase() === usernameInput.toLowerCase();
    });

    if (employee && password === employee.password) {
        return employee;
    }
    return null;
};

const createLogEntry = (action) => {
    return {
        id: `l${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: state.currentUser?.id || 'system',
        action,
    };
};

const createNotificationLog = (clientId, template, variables) => {
    const client = state.clients.find((c) => c.id === clientId);
    if (!client) throw new Error("Client not found for notification");

    let content = '';
    switch (template) {
        case 'order_created':
            content = `Hola ${client.name}, hemos recibido tu pedido Nº ${variables.numericId}. La fecha estimada de retiro es el ${variables.deliveryDate}. ¡Gracias por confiar en Q' Limpio!`;
            break;
        case 'order_ready':
            content = `¡Buenas noticias, ${client.name}! Tu pedido Nº ${variables.numericId} ya está listo para ser retirado. El monto a pagar es ${variables.totalAmount.toLocaleString('es-AR', {style: 'currency', currency: 'ARS'})}. ¡Te esperamos!`;
            break;
        case 'payment_complete':
             content = `¡Gracias por tu visita, ${client.name}! Hemos registrado tu pago por el pedido #${variables.numericId}. Has acumulado ${variables.pointsEarned} puntos.`;
            break;
        case 'manual_marketing':
             content = variables.message;
            break;
        default:
            content = 'Notificación del sistema.';
    }

    return {
        id: `notif${Date.now()}`,
        clientId,
        template,
        content,
        timestamp: new Date().toISOString(),
        status: 'sent' // Simulate success
    };
};

const store = {
    init: initStore, // Expose init
    getState: () => state,
    setState: (newState) => {
        state = { ...state, ...newState };
        listeners.forEach(l => l());
        
        // Persist to Firestore based on keys changed
        Object.keys(newState).forEach(key => {
            if (key !== 'isLoading' && key !== 'currentUser' && key !== 'filters') {
                const dataToSave = newState[key];
                if (key === 'loyaltyConfig') {
                     // Special handling for objects
                     setDoc(doc(db, "appData", key), dataToSave).catch(e => console.warn("Save failed", e));
                } else {
                     // Standard handling for arrays
                     saveToFirestore(key, dataToSave);
                }
            }
        });
    },
    subscribe: (listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    getCalendarDataForMonth: (year, month) => {
        const { orders, clients } = state;
        const calendarData = {};

        orders.forEach((order) => {
            const deliveryDateParts = order.deliveryDate.split('-').map(Number);
            const deliveryDate = new Date(Date.UTC(deliveryDateParts[0], deliveryDateParts[1] - 1, deliveryDateParts[2]));
            
            if (deliveryDate.getUTCFullYear() === year && deliveryDate.getUTCMonth() === month) {
                const dateStr = order.deliveryDate;
                const client = clients.find((c) => c.id === order.clientId);
                const clientServiceType = client?.type === ClientType.Corporate ? 'Hotel/Corp.' : 'Regular';

                if (!calendarData[dateStr]) {
                    calendarData[dateStr] = {
                        total_entregas: 0,
                        desglose_por_tipo: []
                    };
                }

                calendarData[dateStr].total_entregas += 1;
                
                const typeIndex = calendarData[dateStr].desglose_por_tipo.findIndex(d => d.type === clientServiceType);
                if (typeIndex > -1) {
                    calendarData[dateStr].desglose_por_tipo[typeIndex].quantity += 1;
                } else {
                    calendarData[dateStr].desglose_por_tipo.push({ type: clientServiceType, quantity: 1 });
                }
            }
        });
        return calendarData;
    },
    getOrdersByDeliveryDate: (date) => {
        return state.orders.filter((order) => order.deliveryDate === date);
    },
    login: (username, password) => {
        const user = authenticate(state.employees, username, password);
        if (user) {
            const now = new Date().toISOString();
            const newAttendanceRecord = {
                id: `a${Date.now()}`,
                employeeId: user.id,
                checkIn: now,
                checkOut: null,
            };
            const attendance = [...state.attendance, newAttendanceRecord];
            store.setState({ currentUser: user, attendance });
            return true;
        }
        return false;
    },
    logout: () => {
        const { currentUser, attendance } = state;
        if (currentUser) {
            const now = new Date().toISOString();
            const lastRecord = attendance
                .filter((a) => a.employeeId === currentUser.id)
                .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())[0];
            
            if (lastRecord && lastRecord.checkOut === null) {
                const updatedRecord = { ...lastRecord, checkOut: now };
                const newAttendance = attendance.map((a) => a.id === updatedRecord.id ? updatedRecord : a);
                store.setState({ currentUser: null, attendance: newAttendance });
            } else {
                 store.setState({ currentUser: null });
            }
        } else {
             store.setState({ currentUser: null });
        }
    },
    moveOrder: (orderId, newStatus) => {
        const originalOrder = state.orders.find((o) => o.id === orderId);
        if (!originalOrder) return;

        // When moving via drag-and-drop, auto-complete all tasks from the previous stage
        let newCompletedTasks = [...(originalOrder.completedTasks || [])];
        const prevStageChecklist = CHECKLISTS[originalOrder.status];
        if (prevStageChecklist) {
            prevStageChecklist.forEach((task) => {
                if (!newCompletedTasks.includes(task.id)) {
                    newCompletedTasks.push(task.id);
                }
            });
        }
        
        const updatedOrder = { ...originalOrder, status: newStatus, completedTasks: newCompletedTasks };
        store.updateOrder(updatedOrder);
    },
    updateOrder: (updatedOrder) => {
        const originalOrder = state.orders.find((o) => o.id === updatedOrder.id);
        if (!originalOrder) return;
    
        const newHistory = [...updatedOrder.history];
    
        // Status Change
        if (originalOrder.status !== updatedOrder.status) {
            newHistory.push(createLogEntry(`Estado cambiado de "${originalOrder.status}" a "${updatedOrder.status}".`));
        }
    
        // Assignment Change
        if (originalOrder.assignedTo !== updatedOrder.assignedTo) {
            const oldE = state.employees.find((e) => e.id === originalOrder.assignedTo)?.name || 'Nadie';
            const newE = state.employees.find((e) => e.id === updatedOrder.assignedTo)?.name || 'Nadie';
            newHistory.push(createLogEntry(`Reasignado de ${oldE} a ${newE}.`));
        }

        // Machine Change
        if (originalOrder.machineId !== updatedOrder.machineId) {
            const oldM = state.equipment.find((m) => m.id === originalOrder.machineId)?.name || 'Ninguna';
            const newM = state.equipment.find((m) => m.id === updatedOrder.machineId)?.name || 'Ninguna';
            newHistory.push(createLogEntry(`Máquina cambiada de ${oldM} a ${newM}.`));
        }
    
        // Internal Notes Change
        if (originalOrder.internalNotes !== updatedOrder.internalNotes) {
            newHistory.push(createLogEntry('Notas internas actualizadas.'));
        }
        
        // Supplies Change
        if (JSON.stringify(originalOrder.usedSupplies) !== JSON.stringify(updatedOrder.usedSupplies)) {
            newHistory.push(createLogEntry('Insumos del pedido actualizados.'));
        }
        
        // Garments Change
        if (JSON.stringify(originalOrder.garments) !== JSON.stringify(updatedOrder.garments)) {
             newHistory.push(createLogEntry('Anotador de prendas actualizado.'));
        }

        // Packaging Info Change
        if (JSON.stringify(originalOrder.info_empaque) !== JSON.stringify(updatedOrder.info_empaque)) {
            newHistory.push(createLogEntry('Información de empaque final actualizada.'));
        }
        
        // Checklist tasks change
        const originalTasks = originalOrder.completedTasks || [];
        const updatedTasks = updatedOrder.completedTasks || [];
        if(originalTasks.length < updatedTasks.length) {
            const newTasks = updatedTasks.filter((t) => !originalTasks.includes(t));
            newTasks.forEach((taskId) => {
                const taskLabel = CHECKLISTS[originalOrder.status]?.find((t) => t.id === taskId)?.label || taskId;
                newHistory.push(createLogEntry(`Tarea completada: "${taskLabel}".`));
            });
        }

        const finalOrder = { ...updatedOrder, history: newHistory };
        const orders = state.orders.map((o) => (o.id === finalOrder.id ? finalOrder : o));
        store.setState({ orders });
    },
    completeTask: (orderId, taskId) => {
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) return;

        let updatedOrder = { ...order };
        const newCompletedTasks = [...(order.completedTasks || [])];
        if (!newCompletedTasks.includes(taskId)) {
            newCompletedTasks.push(taskId);
        }
        updatedOrder.completedTasks = newCompletedTasks;

        const stageChecklist = CHECKLISTS[order.status];
        const taskDefinition = stageChecklist.find((t) => t.id === taskId);

        if (taskDefinition?.isKeyTask) {
            const currentStatusIndex = KANBAN_COLUMNS.indexOf(order.status);
            if (currentStatusIndex < KANBAN_COLUMNS.length - 1) {
                const nextStatus = KANBAN_COLUMNS[currentStatusIndex + 1];
                updatedOrder.status = nextStatus;

                if (nextStatus === OrderStatus.Ready) {
                    try {
                        const notification = createNotificationLog(order.clientId, 'order_ready', {
                            numericId: order.numericId,
                            totalAmount: order.totalAmount - (order.discount || 0) - order.paidAmount,
                        });
                        store.setState({ notificationLogs: [...state.notificationLogs, notification] });
                    } catch(e) {
                        console.error("Failed to create 'order ready' notification", e);
                    }
                }
            }
        }
        
        store.updateOrder(updatedOrder);
    },
    addOrUpdateClient: (client) => {
        const index = state.clients.findIndex((c) => c.id === client.id);
        if (index > -1) {
            const clients = [...state.clients];
            clients[index] = client;
            store.setState({ clients });
        } else {
            const newClient = { ...client, id: `c${Date.now()}`};
            store.setState({ clients: [...state.clients, newClient] });
        }
    },
    addOrUpdateInventoryItem: (item) => {
        const index = state.inventory.findIndex((i) => i.id === item.id);
        if (index > -1) {
            const inventory = [...state.inventory];
            inventory[index] = item;
            store.setState({ inventory });
        } else {
            const newItem = { ...item, id: `i${Date.now()}`};
            store.setState({ inventory: [...state.inventory, newItem] });
        }
    },
    addOrUpdateService: (service) => {
        const index = state.services.findIndex((s) => s.id === service.id);
        if (index > -1) {
            const services = [...state.services];
            services[index] = service;
            store.setState({ services });
        } else {
            const newService = { ...service, id: `s${Date.now()}`};
            store.setState({ services: [...state.services, newService] });
        }
    },
    deleteService: (serviceId) => {
        const services = state.services.map((s) => {
            if (s.id === serviceId) {
                return { ...s, activo: false };
            }
            return s;
        });
        store.setState({ services });
    },
    addOrUpdateEmployee: (employeeData) => {
        const index = state.employees.findIndex((e) => e.id === employeeData.id);
        let finalEmployeeData = undefined;

        if (index > -1) {
            // Update
            const updatedEmployees = state.employees.map((emp) => {
                if (emp.id === employeeData.id) {
                    finalEmployeeData = { ...emp, ...employeeData };
                    return finalEmployeeData;
                }
                return emp;
            });
            store.setState({ employees: updatedEmployees });
        } else {
            // Add
            finalEmployeeData = { 
                ...employeeData, 
                id: `e${Date.now()}`, 
                avatarUrl: `https://picsum.photos/seed/${Date.now()}/100/100` 
            };
            store.setState({ employees: [...state.employees, finalEmployeeData] });
        }
        return finalEmployeeData;
    },
    resetPassword: (employeeId, newPassword) => {
        const employees = state.employees.map((e) => {
            if (e.id === employeeId) {
                return { ...e, password: newPassword };
            }
            return e;
        });
        store.setState({ employees });
    },
    addOrUpdateEquipment: (equipmentItem) => {
        const index = state.equipment.findIndex((e) => e.id === equipmentItem.id);
        if (index > -1) {
            const equipment = [...state.equipment];
            equipment[index] = equipmentItem;
            store.setState({ equipment });
        } else {
            const newEquipment = { ...equipmentItem, id: `eq${Date.now()}`};
            store.setState({ equipment: [...state.equipment, newEquipment] });
        }
    },
    deleteEquipment: (equipmentId) => {
        const equipment = state.equipment.filter((e) => e.id !== equipmentId);
        store.setState({ equipment });
    },
    toggleEquipmentStatus: (equipmentId) => {
        const equipment = state.equipment.map((e) => {
            if (e.id === equipmentId) {
                return { ...e, status: e.status === 'Operativa' ? 'Fuera de Servicio' : 'Operativa' };
            }
            return e;
        });
        store.setState({ equipment });
    },
    addOrder: (order) => {
        const { orders } = store.getState();
        const maxId = Math.max(...orders.map((o) => o.numericId), 0);
        const newOrder = {
            ...order,
            id: `o${Date.now()}`,
            numericId: maxId + 1,
            history: [createLogEntry('Pedido Creado')],
            usedSupplies: [],
            garments: [],
            info_empaque: { cantidad_paquetes: 0, ubicacion: '' },
            completedTasks: [],
        };
        
        const newLogs = [...state.notificationLogs];
        try {
            const notification = createNotificationLog(newOrder.clientId, 'order_created', {
                numericId: newOrder.numericId,
                deliveryDate: new Date(newOrder.deliveryDate + 'T00:00:00').toLocaleDateString('es-AR'),
            });
            newLogs.push(notification);
        } catch(e) {
            console.error("Failed to create notification for new order", e);
        }

        store.setState({ orders: [...orders, newOrder], notificationLogs: newLogs });
        return newOrder;
    },
    setTurneroFilter: (filter) => {
        const newFilters = { 
            ...state.filters,
            turnero: { ...initialFilters.turnero, ...filter } 
        };
        store.setState({ filters: newFilters });
    },
    setInventoryFilter: (filter) => {
        const newFilters = { 
            ...state.filters,
            inventory: { ...initialFilters.inventory, ...filter } 
        };
        store.setState({ filters: newFilters });
    },
    clearTurneroFilter: () => {
        store.setTurneroFilter(initialFilters.turnero);
    },
    clearInventoryFilter: () => {
        store.setInventoryFilter(initialFilters.inventory);
    },

    // Marketing Actions
    getApplicablePromotions: (serviceIds) => {
        const now = new Date();
        return state.promotions.filter((p) => {
            const isDateValid = new Date(p.startDate) <= now && new Date(p.endDate) >= now;
            const appliesToServices = p.applicableServices.length === 0 || p.applicableServices.some((sId) => serviceIds.includes(sId));
            return p.active && isDateValid && appliesToServices;
        });
    },

    addOrUpdatePromotion: (promo) => {
        const index = state.promotions.findIndex((p) => p.id === promo.id);
        if (index > -1) {
            const promotions = [...state.promotions];
            promotions[index] = promo;
            store.setState({ promotions });
        } else {
            const newPromotion = { ...promo, id: `p${Date.now()}`};
            store.setState({ promotions: [...state.promotions, newPromotion] });
        }
    },
    
    deletePromotion: (promoId) => {
        const promotions = state.promotions.filter((p) => p.id !== promoId);
        store.setState({ promotions });
    },

    updateLoyaltyConfig: (config) => {
        store.setState({ loyaltyConfig: config });
    },
    
    // Finance Actions
    addExpenseCategory: (category) => {
        const { expenseCategories } = state;
        const normalizedCategory = category.trim();
        if (normalizedCategory && !expenseCategories.some((c) => c.toLowerCase() === normalizedCategory.toLowerCase())) {
            store.setState({ expenseCategories: [...expenseCategories, normalizedCategory].sort() });
        }
    },

    processPayment: (details) => {
        let { orders, clients, pointMovements, loyaltyConfig, payments } = state;
        const { orderId, amountPaid, method, isAdvance, pointsToRedeem } = details;

        const order = orders.find((o) => o.id === orderId);
        if (!order) return false;
        
        let client = clients.find((c) => c.id === order.clientId);
        if (!client) return false;

        const orderTotalAfterDiscount = order.totalAmount - (order.discount || 0);
        let finalAmountDue = orderTotalAfterDiscount - order.paidAmount;
        let pointsRedeemedValue = 0;

        // 1. Redeem points
        if (pointsToRedeem > 0 && client.participa_fidelizacion) {
            if (client.puntos_actuales < pointsToRedeem) {
                alert("El cliente no tiene suficientes puntos.");
                return false;
            }
            pointsRedeemedValue = pointsToRedeem * loyaltyConfig.pesoValuePerPoint;
            if (pointsRedeemedValue > finalAmountDue) {
                alert("No se pueden canjear más puntos que el total a pagar.");
                return false;
            }
            
            finalAmountDue -= pointsRedeemedValue;
            client.puntos_actuales -= pointsToRedeem;
            
            pointMovements.push({
                id: `pm${Date.now()}`,
                clientId: client.id,
                orderId: order.id,
                type: 'canje',
                points: -pointsToRedeem,
                timestamp: new Date().toISOString()
            });
        }
        
        const amountToActuallyPay = finalAmountDue;
        if (amountPaid < amountToActuallyPay && !isAdvance) {
             if (amountPaid > 0) {
                 alert("El monto pagado es menor al total adeudado. Marque como 'Adelanto' o complete el pago.");
                 return false;
             }
        }

        const newPayment = {
            id: `pay${Date.now()}`,
            orderId: order.id,
            clientId: client.id,
            amount: amountPaid,
            method: method,
            paymentDate: new Date().toISOString(),
            isAdvance: isAdvance,
        };

        const updatedOrder = { ...order };
        updatedOrder.paidAmount += amountPaid;

        const newLogs = [...state.notificationLogs];
        let pointsEarned = 0;

        // 2. If it's not an advance, close the order and accumulate points
        if (!isAdvance) {
            updatedOrder.status = OrderStatus.Delivered;

            if (client.participa_fidelizacion) {
                pointsEarned = Math.floor(amountToActuallyPay * loyaltyConfig.pointsPerPeso);
                if(pointsEarned > 0){
                    client.puntos_actuales += pointsEarned;
                    pointMovements.push({
                        id: `pm${Date.now() + 1}`,
                        clientId: client.id,
                        orderId: order.id,
                        type: 'acumulacion',
                        points: pointsEarned,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            client.fecha_ultimo_pedido = new Date().toISOString().split('T')[0];

            try {
                const notification = createNotificationLog(client.id, 'payment_complete', {
                    numericId: order.numericId,
                    pointsEarned,
                });
                newLogs.push(notification);
            } catch(e) {
                console.error("Failed to create 'payment' notification", e);
            }
        }
        
        const updatedClients = clients.map((c) => c.id === client.id ? client : c);
        
        store.setState({
            payments: [...state.payments, newPayment],
            notificationLogs: newLogs,
            clients: updatedClients,
        });

        // Call updateOrder to ensure history is logged
        store.updateOrder(updatedOrder);

        return true;
    },

    addExpense: (expense) => {
        let { expenses, accountsPayable } = store.getState();
        const newExpense = { ...expense, id: `ex${Date.now()}` };
        
        store.addExpenseCategory(newExpense.category);
        
        const newGeneratedPayables = [];
        if (newExpense.installmentsInfo && newExpense.installmentsInfo.count > 0) {
            const { count, firstDueDate } = newExpense.installmentsInfo;
            const installmentAmount = newExpense.amount / count;
            for (let i = 0; i < count; i++) {
                const dueDate = new Date(firstDueDate + 'T00:00:00');
                dueDate.setMonth(dueDate.getMonth() + i);
                newGeneratedPayables.push({
                    id: `ap${Date.now() + i}`,
                    expenseId: newExpense.id,
                    concept: `${newExpense.concept} (${i + 1}/${count})`,
                    dueDate: dueDate.toISOString().split('T')[0],
                    amount: installmentAmount,
                    status: 'pendiente',
                });
            }
        }
        
        store.setState({
            expenses: [...expenses, newExpense],
            accountsPayable: [...accountsPayable, ...newGeneratedPayables],
        });
    },

    markAccountPayableAsPaid: (accountId) => {
        let { accountsPayable } = store.getState();
        const updatedAccountsPayable = accountsPayable.map((acc) => {
            if (acc.id === accountId) {
                return {
                    ...acc,
                    status: 'pagada',
                    paymentDate: new Date().toISOString().split('T')[0],
                };
            }
            return acc;
        });
        store.setState({ accountsPayable: updatedAccountsPayable });
    },
    
    sendMarketingNotification: (clientIds, message) => {
        const newLogs = [];
        clientIds.forEach((clientId) => {
            try {
                const notification = createNotificationLog(clientId, 'manual_marketing', { message });
                newLogs.push(notification);
            } catch(e) {
                console.error(`Failed to create marketing notification for client ${clientId}`, e);
            }
        });
        store.setState({ notificationLogs: [...state.notificationLogs, ...newLogs] });
    },


    // Reports Actions
    generateExpenseByCategory: (startDate, endDate) => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        const results = {};

        state.expenses.forEach((e) => {
            const expenseDate = new Date(e.date + 'T00:00:00');
            if (!e.installmentsInfo && expenseDate >= start && expenseDate <= end) {
                results[e.category] = (results[e.category] || 0) + e.amount;
            }
        });

        state.accountsPayable.forEach((ap) => {
            if (ap.status === 'pagada' && ap.paymentDate) {
                const paymentDate = new Date(ap.paymentDate + 'T00:00:00');
                if (paymentDate >= start && paymentDate <= end) {
                    const originalExpense = state.expenses.find((e) => e.id === ap.expenseId);
                    if (originalExpense) {
                        results[originalExpense.category] = (results[originalExpense.category] || 0) + ap.amount;
                    }
                }
            }
        });

        return Object.entries(results).map(([category, amount]) => ({
            category,
            amount,
        })).sort((a, b) => b.amount - a.amount);
    },

    generateEmployeePerformance: (startDate, endDate) => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        const performance = {};

        state.orders.forEach((order) => {
            order.history.forEach((log) => {
                const logDate = new Date(log.timestamp);
                if (logDate >= start && logDate <= end && log.action.startsWith('Tarea completada:')) {
                    const employee = state.employees.find((e) => e.id === log.userId);
                    if (employee) {
                        if (!performance[employee.id]) {
                            performance[employee.id] = { employeeName: employee.name, tasksCompleted: 0 };
                        }
                        performance[employee.id].tasksCompleted++;
                    }
                }
            });
        });
        
        return Object.entries(performance).map(([employeeId, data]) => ({
            employeeId,
            ...data
        })).sort((a,b) => b.tasksCompleted - a.tasksCompleted);
    },
    
    generateSupplyUsage: (startDate, endDate) => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        const usage = {};

        state.orders.forEach((order) => {
            if (order.status === OrderStatus.Delivered) {
                const receptionDate = new Date(order.receptionDate + 'T00:00:00');
                if (receptionDate >= start && receptionDate <= end) {
                    order.usedSupplies.forEach((used) => {
                        const supplyInfo = state.inventory.find((i) => i.id === used.inventoryItemId);
                        if (supplyInfo) {
                            if (!usage[supplyInfo.id]) {
                                usage[supplyInfo.id] = { supplyName: supplyInfo.name, quantityUsed: 0, unit: supplyInfo.unit };
                            }
                            usage[supplyInfo.id].quantityUsed += used.quantity;
                        }
                    });
                }
            }
        });

        return Object.entries(usage).map(([supplyId, data]) => ({
            supplyId,
            ...data
        })).sort((a, b) => b.quantityUsed - a.quantityUsed);
    },

    generateTopClients: (startDate, endDate) => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        const clientData = {};
        
        state.orders.forEach((order) => {
            const receptionDate = new Date(order.receptionDate + 'T00:00:00');
            if (receptionDate >= start && receptionDate <= end) {
                const clientInfo = state.clients.find((c) => c.id === order.clientId);
                if (clientInfo) {
                    if (!clientData[clientInfo.id]) {
                        clientData[clientInfo.id] = { clientName: clientInfo.name, orderCount: 0, totalSpent: 0 };
                    }
                    clientData[clientInfo.id].orderCount++;
                    clientData[clientInfo.id].totalSpent += order.totalAmount - (order.discount || 0);
                }
            }
        });

        return Object.entries(clientData).map(([clientId, data]) => ({
            clientId,
            ...data
        }));
    },

    generateKpiReport: (startDate, endDate) => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');

        const deliveredOrdersInPeriod = [];

        state.orders.forEach((order) => {
            if (order.status === OrderStatus.Delivered) {
                const finalPayment = state.payments
                    .filter((p) => p.orderId === order.id && !p.isAdvance)
                    .sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
                
                if (finalPayment) {
                     const deliveryDate = new Date(finalPayment.paymentDate);
                     if (deliveryDate >= start && deliveryDate <= end) {
                         deliveredOrdersInPeriod.push({ order, deliveryTimestamp: finalPayment.paymentDate });
                     }
                }
            }
        });

        // 1. On-Time Delivery Rate
        let onTimeCount = 0;
        if (deliveredOrdersInPeriod.length > 0) {
            deliveredOrdersInPeriod.forEach(({ order, deliveryTimestamp }) => {
                const promisedDate = new Date(order.deliveryDate + 'T23:59:59');
                const actualDate = new Date(deliveryTimestamp);
                if (actualDate <= promisedDate) {
                    onTimeCount++;
                }
            });
        }
        const onTimeDeliveryRate = deliveredOrdersInPeriod.length > 0
            ? (onTimeCount / deliveredOrdersInPeriod.length) * 100
            : 0;

        // 2. Cycle Time
        const serviceCycleTimes = {};
        deliveredOrdersInPeriod.forEach(({ order, deliveryTimestamp }) => {
            const receptionDate = new Date(order.receptionDate + 'T00:00:00');
            const deliveryDate = new Date(deliveryTimestamp);
            const durationHours = (deliveryDate.getTime() - receptionDate.getTime()) / (1000 * 60 * 60);

            order.services.forEach((s) => {
                if (!serviceCycleTimes[s.serviceId]) {
                    serviceCycleTimes[s.serviceId] = [];
                }
                serviceCycleTimes[s.serviceId].push(durationHours);
            });
        });

        const cycleTimes = Object.entries(serviceCycleTimes).map(([serviceId, durations]) => {
            const service = state.services.find((s) => s.id === serviceId);
            const avgHours = durations.reduce((sum, d) => sum + d, 0) / durations.length;
            return {
                serviceName: service?.name || 'Servicio Desconocido',
                avgHours: parseFloat(avgHours.toFixed(1)),
            };
        });

        // 3. Loyalty
        const ordersForLoyalty = state.orders.filter((order) => {
            const receptionDate = new Date(order.receptionDate + 'T00:00:00');
            return receptionDate >= start && receptionDate <= end;
        });

        const clientOrderCounts = {};
        ordersForLoyalty.forEach((order) => {
            clientOrderCounts[order.clientId] = (clientOrderCounts[order.clientId] || 0) + 1;
        });
        
        const uniqueClients = Object.keys(clientOrderCounts).length;
        let loyalty = { recurrentCustomerRate: 0, avgOrdersPerCustomer: 0 };

        if (uniqueClients > 0) {
            const recurrentClients = Object.values(clientOrderCounts).filter((count) => count > 1).length;
            const totalOrders = ordersForLoyalty.length;
            
            loyalty = {
                recurrentCustomerRate: (recurrentClients / uniqueClients) * 100,
                avgOrdersPerCustomer: totalOrders / uniqueClients,
            };
        }

        return {
            onTimeDeliveryRate,
            cycleTimes,
            loyalty,
        };
    },
};

export function useStore() {
    const [localState, setLocalState] = useState(store.getState());

    useEffect(() => {
        const unsubscribe = store.subscribe(() => setLocalState(store.getState()));
        return () => unsubscribe();
    }, []);

    return localState;
}

export const actions = store;
