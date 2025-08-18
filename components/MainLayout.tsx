
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { Turnero } from './Turnero';
import { Placeholder } from './Placeholder';
import { AppView, Order, Role } from '../types';
import { ClientManagement } from './ClientManagement';
import { InventoryManagement } from './InventoryManagement';
import { ServiceManagement } from './ServiceManagement';
import { EmployeeManagement } from './EmployeeManagement';
import { OrderDetailsModal } from './OrderDetailsModal';
import { CalendarView } from './CalendarView';
import { NewOrderModal } from './NewOrderModal';
import { PostOrderCreationModal } from './PostOrderCreationModal';
import { EquipmentManagement } from './EquipmentManagement';
import { useStore } from '../services/store';
import { MarketingModule } from './MarketingModule';
import { PaymentModal } from './PaymentModal';
import { MyTasksView } from './MyTasksView';
import { FinanceModule } from './FinanceModule';
import { ReportsModule } from './ReportsModule';
import { NotificationModule } from './NotificationModule';


export const MainLayout: React.FC = () => {
    const { orders, currentUser } = useStore();
    const isAdmin = currentUser?.role === Role.Admin;
    const [activeView, setActiveView] = useState<AppView>('dashboard');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
    const [postCreationOrder, setPostCreationOrder] = useState<Order | null>(null);
    const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

    const selectedOrderForModal = selectedOrderId ? orders.find((o: Order) => o.id === selectedOrderId) : null;
    const orderForPayment = paymentOrderId ? orders.find((o: Order) => o.id === paymentOrderId) : null;

    const handleOpenOrderModal = (order: Order) => {
        setSelectedOrderId(order.id);
    };

    const handleCloseOrderModal = () => {
        setSelectedOrderId(null);
    };
    
    const handleOpenPaymentModal = (order: Order) => {
        handleCloseOrderModal(); // Close details modal first
        setPaymentOrderId(order.id);
    };

    const handleNewOrderClick = () => {
        setIsNewOrderModalOpen(true);
    };
    
    const handleOrderCreated = (order: Order) => {
        setPostCreationOrder(order);
    };

    const handleGoToAnotador = () => {
        if(postCreationOrder){
            handleOpenOrderModal(postCreationOrder);
        }
        setPostCreationOrder(null);
    };

    const handleGoToPayment = () => {
        if (postCreationOrder) {
            setPaymentOrderId(postCreationOrder.id);
        }
        setPostCreationOrder(null);
    };


    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard setActiveView={setActiveView} openOrderDetails={handleOpenOrderModal} onNewOrderClick={handleNewOrderClick} />;
            case 'mytasks':
                return <MyTasksView openOrderDetails={handleOpenOrderModal} />;
            case 'turnero':
                return <Turnero openOrderDetails={handleOpenOrderModal} />;
            case 'calendar':
                return <CalendarView openOrderDetails={handleOpenOrderModal} />;
            case 'clients':
                 return <ClientManagement />;
            case 'inventory':
                 return isAdmin ? <InventoryManagement /> : <Placeholder title="Acceso Denegado" description="No tienes permisos para esta sección." />;
            case 'services':
                 return isAdmin ? <ServiceManagement /> : <Placeholder title="Acceso Denegado" description="No tienes permisos para gestionar servicios." />;
            case 'equipment':
                 return isAdmin ? <EquipmentManagement /> : <Placeholder title="Acceso Denegado" description="No tienes permisos para gestionar equipos." />;
            case 'employees':
                 return isAdmin ? <EmployeeManagement /> : <Placeholder title="Acceso Denegado" description="No tienes permisos para gestionar empleados." />;
            case 'notifications':
                 return isAdmin ? <NotificationModule /> : <Placeholder title="Acceso Denegado" description="No tienes permisos para esta sección." />;
            case 'reports':
                 return isAdmin ? <ReportsModule /> : <Placeholder title="Acceso Denegado" description="No tienes permisos para esta sección." />;
             case 'marketing':
                 return isAdmin ? <MarketingModule /> : <Placeholder title="Acceso Denegado" description="No tienes permisos para gestionar el marketing."/>;
            case 'finance':
                 return isAdmin ? <FinanceModule /> : <Placeholder title="Acceso Denegado" description="No tienes permisos para esta sección." />;
            case 'settings':
                 return isAdmin ? <Placeholder title="Configuración" description="Ajusta la configuración general de la aplicación, como los datos de la empresa, roles y notificaciones." /> : <Placeholder title="Acceso Denegado" description="No tienes permisos para esta sección." />;
            default:
                return <Dashboard setActiveView={setActiveView} openOrderDetails={handleOpenOrderModal} onNewOrderClick={handleNewOrderClick} />;
        }
    };

    return (
        <div className="flex h-screen bg-background-light font-sans text-text-main">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header activeView={activeView} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
                    {renderContent()}
                </main>
            </div>
            {selectedOrderForModal && (
                <OrderDetailsModal 
                    order={selectedOrderForModal}
                    onClose={handleCloseOrderModal}
                    openPaymentModal={handleOpenPaymentModal}
                />
            )}
            {isNewOrderModalOpen && (
                <NewOrderModal 
                    onClose={() => setIsNewOrderModalOpen(false)} 
                    onOrderCreated={handleOrderCreated}
                />
            )}
            {postCreationOrder && (
                <PostOrderCreationModal
                    order={postCreationOrder}
                    onClose={() => setPostCreationOrder(null)}
                    onGoToAnotador={handleGoToAnotador}
                    onGoToPayment={handleGoToPayment}
                />
            )}
            {orderForPayment && (
                <PaymentModal
                    order={orderForPayment}
                    onClose={() => setPaymentOrderId(null)}
                />
            )}
        </div>
    );
};