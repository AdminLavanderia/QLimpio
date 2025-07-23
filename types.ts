export enum OrderStatus {
    Assigned = "Turnos Asignados",
    Reception = "Recepción / Anotador",
    Classification = "Clasificación y Prelavado",
    Washing = "En Lavado",
    Drying = "En Secado",
    Folding = "Doblado y Planchado",
    FinalControl = "Control Final y Empaquetado",
    Ready = "Listo para Retirar",
    Delivered = "Entregado y Pagado",
}

export enum ClientType {
    Regular = "Regular",
    Corporate = "Cuenta Corriente",
}

export enum Role {
    Employee = "Operario de Lavandería",
    Admin = "Encargado / Administrador",
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    type: ClientType;
    preferences: string;
    participa_fidelizacion: boolean;
    puntos_actuales: number;
    fecha_ultimo_pedido: string | null; // ISO Date string
}

export interface DefaultSupply {
    inventoryItemId: string;
    quantity: number;
}

export interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    activo: boolean;
    insumos_consumidos: DefaultSupply[];
}

export interface Garment {
    id:string;
    name: string;
    color: string;
    brand: string;
    details: string;
    quantity: number;
    photos: string[]; // Array of base64 strings
    controlado_en_empaque: boolean;
}

export interface LogEntry {
    id: string;
    timestamp: string; // ISO String
    userId: string;
    action: string;
}

export interface UsedSupply {
    inventoryItemId: string;
    quantity: number;
}

export interface Order {
    id: string;
    numericId: number;
    clientId: string;
    services: { serviceId: string; quantity: number }[];
    garments: Garment[];
    status: OrderStatus;
    isExpress: boolean;
    assignedTo?: string; // Employee ID
    info_empaque: {
        cantidad_paquetes: number;
        ubicacion: string;
    };
    machineId?: string;
    receptionDate: string;
    deliveryDate: string;
    totalAmount: number;
    paidAmount: number;
    internalNotes: string;
    history: LogEntry[];
    usedSupplies: UsedSupply[];
    appliedPromotionId?: string;
    discount?: number;
    completedTasks?: string[];
    isOverdue?: boolean;
}

export interface InventoryItem {
    id: string;
    name: string;
    stock: number;
    unit: 'L' | 'Kg' | 'Uds';
    minStock: number;
    provider: string;
}

export interface Employee {
    id: string;
    name: string;
    role: Role;
    avatarUrl: string;
    password?: string;
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    checkIn: string; // ISO String
    checkOut: string | null; // ISO String or null
}

export type EquipmentType = "Lavadora" | "Secadora" | "Centrífugador" | "Plancha" | "Planchadora" | "Dobladora" | "Selladora" | "Hidrolavadora";
export type EquipmentStatus = "Operativa" | "Fuera de Servicio";

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  notes?: string;
}

export interface TurneroFilter {
    status: OrderStatus | null;
    date: 'today' | null;
}

export interface InventoryFilter {
    status: 'low' | null;
}

export interface AppFilters {
    turnero: TurneroFilter;
    inventory: InventoryFilter;
}

export interface CalendarDayBreakdown {
    type: string;
    quantity: number;
}

export interface CalendarDayData {
    total_entregas: number;
    desglose_por_tipo: CalendarDayBreakdown[];
}

export type CalendarData = Record<string, CalendarDayData>; // Key is YYYY-MM-DD

// Marketing and Loyalty
export interface Promotion {
    id: string;
    name: string;
    description: string;
    type: 'Porcentaje' | 'Monto Fijo';
    value: number;
    startDate: string; // ISO Date string
    endDate: string; // ISO Date string
    applicableServices: string[]; // Array of service IDs
    active: boolean;
}

export interface LoyaltyConfig {
    pointsPerPeso: number; // e.g., 0.01 for 1 point per $100
    pesoValuePerPoint: number; // e.g., 10 for 1 point = $10
    expirationDays: number;
}

export interface PointMovement {
    id: string;
    clientId: string;
    orderId?: string;
    type: 'acumulacion' | 'canje' | 'vencimiento';
    points: number; // Positive for accumulation, negative for redemption/expiration
    timestamp: string;
}

// Finance Module Types
export type PaymentMethod = "Efectivo" | "Transferencia" | "Tarjeta de Débito" | "Tarjeta de Crédito" | "Cuenta Corriente";
export const PAYMENT_METHODS: PaymentMethod[] = ["Efectivo", "Transferencia", "Tarjeta de Débito", "Tarjeta de Crédito", "Cuenta Corriente"];

export type ExpenseCategory = string;

export interface Payment {
    id: string;
    orderId?: string; // Optional for CtaCte payments
    clientId: string;
    amount: number;
    method: PaymentMethod;
    paymentDate: string; // ISO Date string
    isAdvance: boolean;
}

export interface Expense {
    id: string;
    concept: string;
    amount: number;
    date: string; // ISO Date string
    paymentMethod: PaymentMethod;
    category: ExpenseCategory;
    installmentsInfo?: {
        count: number;
        firstDueDate: string; // ISO Date string
    };
}

export interface AccountPayable {
    id: string;
    expenseId: string;
    concept: string; // Duplicated for easier display
    dueDate: string; // ISO Date string
    amount: number;
    status: 'pendiente' | 'pagada';
    paymentDate?: string; // ISO Date string
}


export type AppView = 'dashboard' | 'turnero' | 'clients' | 'inventory' | 'services' | 'employees' | 'equipment' | 'settings' | 'reports' | 'marketing' | 'finance' | 'calendar' | 'mytasks' | 'notifications';

// Reports Module Types
export interface ExpenseByCategory {
    category: ExpenseCategory;
    amount: number;
}

export interface EmployeePerformance {
    employeeId: string;
    employeeName: string;
    tasksCompleted: number;
}

export interface SupplyUsage {
    supplyId: string;
    supplyName: string;
    quantityUsed: number;
    unit: 'L' | 'Kg' | 'Uds';
}

export interface TopClient {
    clientId: string;
    clientName: string;
    orderCount: number;
    totalSpent: number;
}

// Notifications Module Types
export interface NotificationLog {
    id: string;
    clientId: string;
    template: string; // e.g., 'order_ready', 'manual_marketing'
    content: string;
    timestamp: string; // ISO Date string
    status: 'sent' | 'failed';
}

// KPI Reports
export interface KpiCycleTime {
    serviceName: string;
    avgHours: number;
}

export interface KpiLoyalty {
    recurrentCustomerRate: number; // percentage
    avgOrdersPerCustomer: number;
}

export interface KpiReportData {
    onTimeDeliveryRate: number; // percentage
    cycleTimes: KpiCycleTime[];
    loyalty: KpiLoyalty;
}