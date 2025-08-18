



import React from 'react';
import { useStore, actions } from '../services/store';
import { OrderStatus, AppView, Order, Role, Client, InventoryItem, AccountPayable } from '../types';
import { BasketIcon, DollarSignIcon, PackageIcon, BellIcon, PlusIcon, TurneroIcon, ClientsIcon, ReportIcon } from './icons';


const DashboardCard = ({ icon, title, value, colorClass = 'text-primary', onClick }: { icon: React.ReactNode, title: string, value: string | number, colorClass?: string, onClick?: () => void }) => (
    <div 
      className="bg-white p-6 rounded-lg shadow-sm flex flex-col transition-transform transform hover:-translate-y-1"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
        <div className={`w-10 h-10 ${colorClass}`}>{icon}</div>
        <p className="text-sm text-text-secondary mt-4">{title}</p>
        <p className="text-3xl font-bold font-display text-text-main mt-1">{value}</p>
    </div>
);

const QuickAccessButton = ({ icon, label, onClick, primary = false }: { icon: React.ReactNode, label: string, onClick: () => void, primary?: boolean }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center w-full px-4 py-3 text-base font-bold rounded-lg transition-colors duration-200 ${
            primary ? 'bg-accent text-white hover:bg-orange-500' : 'bg-white border border-primary text-primary hover:bg-blue-50'
        }`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);

const WeeklyDeliveriesWidget = ({ setActiveView }: { setActiveView: (view: AppView) => void }) => {
    const { orders } = useStore();
    const weekDates = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date;
    });

    const deliveriesByDate = weekDates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const count = orders.filter((o: Order) => o.deliveryDate === dateStr).length;
        return { date, count };
    });

    const maxDeliveries = Math.max(...deliveriesByDate.map(d => d.count), 5); // min height for bar

    const getBarColor = (count: number) => {
        if (count > 8) return 'bg-status-red';
        if (count > 4) return 'bg-status-yellow';
        return 'bg-status-green';
    };

    return (
        <div 
            className="space-y-3 cursor-pointer p-2"
            onClick={() => setActiveView('calendar')}
        >
            {deliveriesByDate.map(({ date, count }) => (
                <div key={date.toISOString()} className="flex items-center gap-4 group">
                    <div className="text-center w-14 flex-shrink-0">
                        <p className="font-bold text-sm text-text-main group-hover:text-primary">{date.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')}</p>
                        <p className="text-xs text-text-secondary">{date.toLocaleDateString('es-AR', { day: '2-digit' })}</p>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-5 relative">
                        <div
                            className={`absolute top-0 left-0 h-5 rounded-full transition-all duration-300 ${getBarColor(count)}`}
                            style={{ width: `${(count / maxDeliveries) * 100}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-end pr-2 text-sm font-bold text-gray-700">{count}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};


export const Dashboard: React.FC<{
    setActiveView: (view: AppView) => void;
    openOrderDetails: (order: Order) => void;
    onNewOrderClick: () => void;
}> = ({setActiveView, openOrderDetails, onNewOrderClick}) => {
    const { orders, inventory, clients, currentUser, accountsPayable } = useStore();
    const isAdmin = currentUser?.role === Role.Admin;
    
    const todayStr = new Date().toISOString().split('T')[0];

    const ordersToday = orders.filter((o: Order) => o.receptionDate === todayStr).length;
    const incomeToday = orders
        .filter((o: Order) => o.receptionDate === todayStr)
        .reduce((sum: number, o: Order) => sum + o.paidAmount, 0)
        .toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

    const readyToPickup = orders.filter((o: Order) => o.status === OrderStatus.Ready).length;
    const inventoryAlerts = inventory.filter((i: InventoryItem) => i.stock <= i.minStock).length;
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const accountsPayableAlerts = accountsPayable.filter((ap: AccountPayable) => {
        if (ap.status !== 'pendiente') return false;
        const dueDate = new Date(ap.dueDate + 'T00:00:00');
        const todayAtStart = new Date();
        todayAtStart.setHours(0,0,0,0);
        return dueDate <= sevenDaysFromNow && dueDate >= todayAtStart;
    }).length;

    const totalAlerts = inventoryAlerts + accountsPayableAlerts;

    const recentOrders = orders.slice().sort((a: Order, b: Order) => b.numericId - a.numericId).slice(0, 4);

    return (
        <div className="space-y-8">
            {/* Top Widgets */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard 
                        icon={<BasketIcon />} 
                        title="Pedidos del Día" 
                        value={ordersToday}
                        onClick={() => {
                            actions.setTurneroFilter({ date: 'today', status: null });
                            setActiveView('turnero');
                        }}
                    />
                    <DashboardCard 
                        icon={<DollarSignIcon />} 
                        title="Ingresos del Día" 
                        value={incomeToday}
                        onClick={() => setActiveView('reports')}
                    />
                    <DashboardCard 
                        icon={<PackageIcon />} 
                        title="Listos para Retirar" 
                        value={readyToPickup}
                        onClick={() => {
                            actions.setTurneroFilter({ status: OrderStatus.Ready, date: null });
                            setActiveView('turnero');
                        }}
                    />
                    <DashboardCard 
                        icon={<BellIcon />} 
                        title="Alertas del Sistema" 
                        value={totalAlerts} 
                        colorClass={totalAlerts > 0 ? 'text-accent' : 'text-status-green'}
                        onClick={() => {
                            if (inventoryAlerts > 0) {
                                actions.setInventoryFilter({ status: 'low' });
                                setActiveView('inventory');
                            } else if (accountsPayableAlerts > 0) {
                                setActiveView('finance');
                            }
                        }}
                    />
                </div>
            )}

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-display font-bold text-lg text-text-main mb-4">Entregas de la Semana</h3>
                    <WeeklyDeliveriesWidget setActiveView={setActiveView} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-display font-bold text-lg text-text-main mb-4">Accesos Directos</h3>
                    <div className="space-y-4">
                        <QuickAccessButton icon={<PlusIcon className="w-5 h-5"/>} label="Nuevo Pedido" onClick={onNewOrderClick} primary />
                        <QuickAccessButton icon={<TurneroIcon className="w-5 h-5"/>} label="Ver Turnero" onClick={() => setActiveView('turnero')} />
                        <QuickAccessButton icon={<ClientsIcon className="w-5 h-5"/>} label="Ver Clientes" onClick={() => setActiveView('clients')} />
                        {isAdmin && <QuickAccessButton icon={<ReportIcon className="w-5 h-5"/>} label="Reporte de Ventas" onClick={() => setActiveView('reports')} />}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                 <h3 className="font-display font-bold text-lg text-text-main mb-4">Últimos Pedidos Registrados</h3>
                 <div className="divide-y divide-gray-200 -mx-6">
                    {recentOrders.map((order: Order) => {
                        const client = clients.find((c: Client) => c.id === order.clientId);
                        return (
                            <div 
                                key={order.id} 
                                className="flex items-center justify-between py-3 px-6 cursor-pointer hover:bg-gray-50"
                                onClick={() => openOrderDetails(order)}
                            >
                                <div>
                                    <p className="font-bold text-text-main">Lavado #{order.numericId}</p>
                                    <p className="text-sm text-text-secondary">{client?.name || 'Cliente no encontrado'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-text-main">{order.status}</p>
                                    <p className="text-xs text-text-secondary">Entrega: {order.deliveryDate}</p>
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </div>
        </div>
    );
};