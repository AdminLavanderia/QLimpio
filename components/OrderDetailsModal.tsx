

import React, { useState, useMemo, useEffect } from 'react';
import { Order, Garment, OrderStatus, Role, UsedSupply, EquipmentType, Service, Client, InventoryItem, Equipment, Employee, LogEntry } from '../types';
import { useStore, actions } from '../services/store';
import { ANOTADOR_EDITABLE_STATUSES, CHECKLISTS, ChecklistItem } from '../constants';
import { XIcon, LockIcon, PlusIcon, HistoryIcon, EditIcon, EmployeesIcon, InventoryIcon, PackageIcon, TrashIcon, CameraIcon, TasksIcon } from './icons';
import { CameraModal } from './CameraModal';

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
    openPaymentModal: (order: Order) => void;
}

type ActiveTab = 'tasks' | 'anotador' | 'insumos' | 'asignacion' | 'historial';


interface AnotadorViewProps {
    isEditable: boolean;
    isStageEditable: boolean;
    isFinalControlStage: boolean;
    isAdmin: boolean;
    isLockedByAdmin: boolean;
    allGarmentsChecked: boolean;
    garments: Garment[];
    info_empaque: Order['info_empaque'];
    setIsLockedByAdmin: (locked: boolean) => void;
    handleGarmentChange: (index: number, field: keyof Garment, value: any) => void;
    handleRemoveGarment: (index: number) => void;
    handleAddGarment: () => void;
    setCameraModalOpenFor: (index: number | null) => void;
    handleFieldChange: (field: keyof Order, value: any) => void;
}

const AnotadorView: React.FC<AnotadorViewProps> = ({
    isEditable,
    isStageEditable,
    isFinalControlStage,
    isAdmin,
    isLockedByAdmin,
    allGarmentsChecked,
    garments,
    info_empaque,
    setIsLockedByAdmin,
    handleGarmentChange,
    handleRemoveGarment,
    handleAddGarment,
    setCameraModalOpenFor,
    handleFieldChange,
}) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Lista de Prendas</h3>
                {!isStageEditable && isAdmin && (
                    <button onClick={() => setIsLockedByAdmin(!isLockedByAdmin)} className="flex items-center text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full hover:bg-yellow-200">
                        <LockIcon className="mr-2"/> {isLockedByAdmin ? 'Desbloquear Edición' : 'Bloquear Edición'}
                    </button>
                )}
                 {!isStageEditable && !isAdmin && <span className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full"><LockIcon className="mr-2"/> Bloqueado</span>}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse table-fixed">
                    <thead className="bg-gray-50">
                        <tr>
                            {isFinalControlStage && <th className="p-2 w-12 border border-gray-300" title="Controlado">✓</th>}
                            <th className="p-2 border border-gray-300 w-20">Cant</th>
                            <th className="p-2 border border-gray-300">Prenda | Color | Descripción | Marca</th>
                            <th className="p-2 w-16 border border-gray-300 text-center">Fotos</th>
                            {isEditable && <th className="p-2 w-14 border border-gray-300"></th>}
                        </tr>
                    </thead>
                    <tbody>
                    {(garments || []).map((g: Garment, i: number) => (
                        <tr key={g.id}>
                            {isFinalControlStage && (
                                <td className="p-0 border border-gray-300 align-middle text-center"><input type="checkbox" checked={!!g.controlado_en_empaque} onChange={e => handleGarmentChange(i, 'controlado_en_empaque', e.target.checked)} className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"/></td>
                            )}
                            <td className="p-0 border border-gray-300 align-middle">
                                <input
                                    type="number"
                                    min="1"
                                    value={g.quantity ?? 1}
                                    onChange={e => handleGarmentChange(i, 'quantity', parseInt(e.target.value, 10) || 1)}
                                    disabled={!isEditable}
                                    className="w-full h-full p-2 bg-transparent text-center focus:outline-none focus:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </td>
                            <td className="p-0 border border-gray-300 align-middle">
                                 <input
                                    type="text"
                                    placeholder="Ej: Remera blanca con cuello en V Rip Curl"
                                    value={g.name || ''}
                                    onChange={e => handleGarmentChange(i, 'name', e.target.value)}
                                    disabled={!isEditable}
                                    className="w-full h-full p-2 bg-transparent focus:outline-none focus:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-500"
                                 />
                            </td>
                            <td className="p-0 border border-gray-300 text-center align-middle">
                                <button onClick={() => setCameraModalOpenFor(i)} disabled={!isEditable} className="text-primary disabled:text-gray-400 p-2 m-auto flex justify-center">
                                    <div className="relative">
                                        <CameraIcon className="w-5 h-5"/>
                                        {g.photos && g.photos.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{g.photos.length}</span>
                                        )}
                                    </div>
                                </button>
                            </td>
                            {isEditable && <td className="border border-gray-300 p-0 align-middle text-center"><button onClick={() => handleRemoveGarment(i)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-4 h-4"/></button></td>}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {isEditable && <button onClick={handleAddGarment} className="mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm flex items-center"><PlusIcon className="w-4 h-4 mr-2"/>Añadir Prenda</button>}
            
            {isFinalControlStage && (
                <div className={`mt-6 p-4 border-t ${allGarmentsChecked ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <h4 className="font-bold text-md mb-2">Información de Empaquetado</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Nº de Paquetes"
                            value={info_empaque?.cantidad_paquetes ?? ''}
                            onChange={e => handleFieldChange('info_empaque', {...info_empaque, cantidad_paquetes: parseInt(e.target.value) || 0})}
                            className="p-2 border rounded-lg"
                        />
                         <input
                            type="text"
                            placeholder="Ubicación en Estantería"
                            value={info_empaque?.ubicacion || ''}
                            onChange={e => handleFieldChange('info_empaque', {...info_empaque, ubicacion: e.target.value})}
                            className="p-2 border rounded-lg"
                        />
                    </div>
                    {!allGarmentsChecked && <p className="text-xs text-center text-gray-500 mt-2">Marque todas las prendas como controladas para completar la tarea de "Control Final".</p>}
                </div>
            )}
        </div>
    );
};


export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, openPaymentModal }) => {
    const { clients, currentUser, employees, inventory, equipment, services } = useStore();
    const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
    
    // This local state holds all edits. It's initialized once from the prop.
    const [editableOrder, setEditableOrder] = useState<Order>(order);
    
    // This effect syncs external updates (like status changes) to the local state
    // without overwriting fields the user is actively editing.
    useEffect(() => {
        // If the underlying order from the store changes (e.g., status, history),
        // update our local state to reflect it, but keep the user's edits
        // on the fields they control.
        setEditableOrder(currentLocalOrder => ({
            ...order, // Base the update on the freshest data from the store
            garments: currentLocalOrder.garments,
            usedSupplies: currentLocalOrder.usedSupplies,
            assignedTo: currentLocalOrder.assignedTo,
            machineId: currentLocalOrder.machineId,
            internalNotes: currentLocalOrder.internalNotes,
            info_empaque: currentLocalOrder.info_empaque,
        }));
    }, [order.status, order.history, order.completedTasks]);


    const [isLockedByAdmin, setIsLockedByAdmin] = useState(true);
    const [cameraModalOpenFor, setCameraModalOpenFor] = useState<number | null>(null);
    
    const client = clients.find((c: Client) => c.id === editableOrder.clientId);
    const isStageEditable = ANOTADOR_EDITABLE_STATUSES.includes(editableOrder.status);
    const isAdmin = currentUser?.role === Role.Admin;
    const isEditable = isStageEditable || (isAdmin && !isLockedByAdmin);
    
    const isFinalControlStage = editableOrder.status === OrderStatus.FinalControl;
    const allGarmentsChecked = useMemo(() => {
        if (!isFinalControlStage || !editableOrder.garments || editableOrder.garments.length === 0) return false;
        return editableOrder.garments.every((g: Garment) => g.controlado_en_empaque);
    }, [editableOrder.garments, isFinalControlStage]);

    const availableEquipment = useMemo(() => {
        let requiredTypes: EquipmentType[] = [];
        switch (editableOrder.status) {
            case OrderStatus.Washing: requiredTypes = ["Lavadora", "Hidrolavadora"]; break;
            case OrderStatus.Drying: requiredTypes = ["Secadora", "Centrífugador"]; break;
            case OrderStatus.Folding: requiredTypes = ["Plancha", "Planchadora", "Dobladora"]; break;
            case OrderStatus.FinalControl: requiredTypes = ["Selladora"]; break;
            default: return [];
        }
        return equipment.filter((e: Equipment) => requiredTypes.includes(e.type) && e.status === 'Operativa');
    }, [equipment, editableOrder.status]);

    const handleFieldChange = (field: keyof Order, value: any) => {
        setEditableOrder(prev => ({ ...prev, [field]: value }));
    };
    
    const handleGarmentChange = (index: number, field: keyof Garment, value: any) => {
        const newGarments = [...editableOrder.garments];
        if(newGarments[index]){
             newGarments[index] = { ...newGarments[index], [field]: value };
            handleFieldChange('garments', newGarments);
        }
    };

    const handleAddGarment = () => {
        const newGarment: Garment = { id: `g${Date.now()}`, name: '', color: '', brand: '', details: '', quantity: 1, photos: [], controlado_en_empaque: false };
        handleFieldChange('garments', [...editableOrder.garments, newGarment]);
    };

    const handleRemoveGarment = (index: number) => {
        handleFieldChange('garments', editableOrder.garments.filter((_, i: number) => i !== index));
    };
    
    const handleSupplyChange = (index: number, quantity: number) => {
        const newSupplies = [...editableOrder.usedSupplies];
        newSupplies[index].quantity = quantity;
        handleFieldChange('usedSupplies', newSupplies);
    };
    
    const handleAddSupply = (inventoryItemId: string) => {
        if(inventoryItemId && !editableOrder.usedSupplies.some((s: UsedSupply) => s.inventoryItemId === inventoryItemId)) {
            const newSupply: UsedSupply = { inventoryItemId, quantity: 1 };
            handleFieldChange('usedSupplies', [...editableOrder.usedSupplies, newSupply]);
        }
    };
    
    const handleRemoveSupply = (inventoryItemId: string) => {
        handleFieldChange('usedSupplies', editableOrder.usedSupplies.filter((s: UsedSupply) => s.inventoryItemId !== inventoryItemId));
    }

    const handleSave = () => {
        actions.updateOrder(editableOrder);
        onClose();
    };

    const handleCheckboxToggle = (taskId: string) => {
        if (editableOrder.completedTasks?.includes(taskId)) return;

        if (taskId === 'package_garments') {
            if (!editableOrder.info_empaque.cantidad_paquetes || !editableOrder.info_empaque.ubicacion) {
                alert('Por favor, complete la información de empaque en la pestaña "Anotador" antes de marcar esta tarea.');
                setActiveTab('anotador');
                return;
            }
        }
        if (taskId === 'final_control' && !allGarmentsChecked) {
            alert('Por favor, marque todas las prendas como controladas antes de completar esta tarea.');
            return;
        }

        actions.completeTask(editableOrder.id, taskId);
    };

    const TabButton = ({ id, label, icon }: { id: ActiveTab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === id ? 'border-b-2 border-primary text-primary bg-blue-50' : 'text-text-secondary hover:bg-gray-100'}`}
        >
            {icon}<span className="ml-2 hidden sm:inline">{label}</span>
        </button>
    );
    
    const formatDateTime = (isoString: string | null): string => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold font-display text-text-main">
                        Pedido #{editableOrder.numericId} - <span className="text-primary">{client?.name}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <XIcon />
                    </button>
                </header>

                <div className="border-b border-gray-200 px-4">
                    <nav className="flex space-x-1 -mb-px overflow-x-auto">
                        <TabButton id="tasks" label="Tareas" icon={<TasksIcon className="w-4 h-4"/>} />
                        <TabButton id="anotador" label="Anotador" icon={<EditIcon className="w-4 h-4"/>} />
                        <TabButton id="insumos" label="Insumos" icon={<InventoryIcon className="w-4 h-4"/>} />
                        <TabButton id="asignacion" label="Asignación" icon={<EmployeesIcon className="w-4 h-4"/>}/>
                        <TabButton id="historial" label="Historial" icon={<HistoryIcon className="w-4 h-4"/>}/>
                    </nav>
                </div>

                <main className="p-6 overflow-y-auto flex-1 min-h-0">
                    {activeTab === 'tasks' && (
                        <div>
                            <h3 className="font-bold text-lg mb-4">Tareas para: <span className="font-display text-primary">{editableOrder.status}</span></h3>
                            <ul className="space-y-3">
                                {CHECKLISTS[editableOrder.status]
                                    .filter((task: ChecklistItem) => !task.condition || task.condition(editableOrder, services))
                                    .map((task: ChecklistItem) => {
                                    const isCompleted = editableOrder.completedTasks?.includes(task.id) ?? false;
                                    return (
                                        <li key={task.id} className={`p-3 rounded-lg flex items-start ${isCompleted ? 'bg-green-50 text-gray-500' : 'bg-white'}`}>
                                            <input 
                                                id={`task-${task.id}`} 
                                                type="checkbox" 
                                                checked={isCompleted}
                                                onChange={() => handleCheckboxToggle(task.id)}
                                                disabled={isCompleted}
                                                className="h-5 w-5 mt-0.5 text-primary rounded border-gray-300 focus:ring-primary disabled:opacity-50"
                                            />
                                            <div className="ml-3">
                                                <label htmlFor={`task-${task.id}`} className={`font-semibold ${isCompleted ? 'line-through' : 'text-text-main'}`}>
                                                    {task.label}
                                                    {task.isKeyTask && <span className="ml-2 text-xs font-bold bg-accent text-white px-2 py-0.5 rounded-full">TAREA CLAVE</span>}
                                                </label>
                                                {task.description && <p className="text-xs text-text-secondary mt-1">{task.description}</p>}
                                            </div>
                                        </li>
                                    );
                                })}
                                {CHECKLISTS[editableOrder.status].length === 0 && <p className="text-text-secondary">No hay tareas específicas para esta etapa.</p>}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'anotador' && (
                        <AnotadorView
                            isEditable={isEditable}
                            isStageEditable={isStageEditable}
                            isFinalControlStage={isFinalControlStage}
                            isAdmin={isAdmin}
                            isLockedByAdmin={isLockedByAdmin}
                            allGarmentsChecked={allGarmentsChecked}
                            garments={editableOrder.garments}
                            info_empaque={editableOrder.info_empaque}
                            setIsLockedByAdmin={setIsLockedByAdmin}
                            handleGarmentChange={handleGarmentChange}
                            handleRemoveGarment={handleRemoveGarment}
                            handleAddGarment={handleAddGarment}
                            setCameraModalOpenFor={setCameraModalOpenFor}
                            handleFieldChange={handleFieldChange}
                        />
                    )}
                     {activeTab === 'insumos' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">Insumos Utilizados</h3>
                            <div className="space-y-2">
                            {editableOrder.usedSupplies.map((supply: UsedSupply, index: number) => {
                                const item = inventory.find((i: InventoryItem) => i.id === supply.inventoryItemId);
                                if(!item) return null;
                                return (
                                <div key={item.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                                    <span className="flex-1 font-medium">{item.name}</span>
                                    <input
                                        type="number"
                                        step="0.05"
                                        value={supply.quantity ?? 0}
                                        onChange={(e) => handleSupplyChange(index, parseFloat(e.target.value) || 0)}
                                        className="w-24 p-1 border rounded"
                                    />
                                    <span>{item.unit}</span>
                                    <button onClick={() => handleRemoveSupply(item.id)} className="text-red-500 hover:text-red-700">
                                        <XIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                                );
                            })}
                            </div>
                             <div className="flex items-center gap-2 pt-4 border-t">
                                 <select 
                                     onChange={(e) => handleAddSupply(e.target.value)}
                                     defaultValue=""
                                     className="flex-1 bg-white border border-gray-300 text-sm rounded-lg p-2"
                                >
                                     <option value="" disabled>Seleccionar insumo para añadir...</option>
                                     {inventory.map((item: InventoryItem) => (
                                         <option key={item.id} value={item.id}>{item.name}</option>
                                     ))}
                                 </select>
                            </div>
                        </div>
                    )}
                    {activeTab === 'asignacion' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">Asignación</h3>
                            <div>
                                <label className="block font-semibold mb-2">Empleado Asignado:</label>
                                <select 
                                    value={editableOrder.assignedTo || ''}
                                    onChange={e => handleFieldChange('assignedTo', e.target.value)}
                                    disabled={!isAdmin}
                                    className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-200"
                                >
                                    <option value="" disabled>Sin asignar</option>
                                    {employees.map((e: Employee) => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                                {!isAdmin && <p className="text-sm text-yellow-600 mt-2">Solo los administradores pueden reasignar tareas.</p>}
                            </div>

                             <div>
                                <label className="block font-semibold mb-2">Máquina Asignada:</label>
                                <select 
                                    value={editableOrder.machineId || ''}
                                    onChange={e => handleFieldChange('machineId', e.target.value)}
                                    disabled={availableEquipment.length === 0}
                                    className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-200"
                                >
                                    <option value="">Seleccionar máquina...</option>
                                    {availableEquipment.map((e: Equipment) => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                                 {availableEquipment.length === 0 && <p className="text-sm text-gray-500 mt-2">No hay máquinas operativas o relevantes para esta etapa.</p>}
                            </div>
                            
                             <div>
                                <label className="block font-semibold mb-2">Notas Internas:</label>
                                <textarea
                                    value={editableOrder.internalNotes || ''}
                                    onChange={e => handleFieldChange('internalNotes', e.target.value)}
                                    className="w-full p-2 border rounded-lg mt-1 bg-gray-50"
                                    rows={4}
                                ></textarea>
                            </div>
                        </div>
                    )}
                     {activeTab === 'historial' && (
                        <div>
                             <h3 className="font-bold text-lg mb-4">Historial del Pedido</h3>
                             <div className="border rounded-lg max-h-96 overflow-y-auto">
                                <ul className="divide-y">
                                    {editableOrder.history.slice().reverse().map((log: LogEntry) => {
                                        const user = employees.find((e: Employee) => e.id === log.userId);
                                        return (
                                            <li key={log.id} className="p-3">
                                                <p className="font-medium text-text-main">{log.action}</p>
                                                <p className="text-xs text-text-secondary">
                                                    Por {user?.name || 'Sistema'} el {formatDateTime(log.timestamp)}
                                                </p>
                                            </li>
                                        )
                                    })}
                                </ul>
                             </div>
                        </div>
                    )}
                </main>

                <footer className="flex justify-between items-center p-4 border-t bg-gray-50">
                    <div>
                         {editableOrder.status === OrderStatus.Ready && (
                            <button 
                                onClick={() => openPaymentModal(editableOrder)} 
                                className="px-6 py-2 rounded-lg text-white bg-status-green hover:bg-green-600 font-bold"
                            >
                                Registrar Pago
                            </button>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-white border mr-2 hover:bg-gray-100">Cancelar</button>
                        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-blue-600">Guardar Cambios</button>
                    </div>
                </footer>
            </div>
            {cameraModalOpenFor !== null && editableOrder.garments && editableOrder.garments[cameraModalOpenFor] && (
                <CameraModal
                    onClose={() => setCameraModalOpenFor(null)}
                    onSave={(photos) => {
                        handleGarmentChange(cameraModalOpenFor, 'photos', photos);
                        setCameraModalOpenFor(null);
                    }}
                    initialPhotos={editableOrder.garments[cameraModalOpenFor]?.photos || []}
                />
            )}
        </div>
    );
};