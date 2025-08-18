

import React, { useState } from 'react';
import { useStore, actions } from '../services/store';
import { Service, DefaultSupply, InventoryItem } from '../types';
import { Table } from './common/Table';
import { Modal, ModalForm, FormInput, FormTextarea } from './common/Modal';
import { PlusIcon, TrashIcon, XIcon, EditIcon } from './icons';

const emptyService: Service = { id: '', name: '', price: 0, description: '', activo: true, insumos_consumidos: [] };

export const ServiceManagement: React.FC = () => {
    const { services } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const handleOpenModal = (service: Service | null) => {
        setSelectedService(service || emptyService);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
    };

    const handleSave = (serviceToSave: Service) => {
        actions.addOrUpdateService(serviceToSave);
        handleCloseModal();
    };

    const handleDelete = (serviceId: string) => {
        if (window.confirm('¿Seguro que quieres desactivar este servicio? Los pedidos existentes no se verán afectados.')) {
            actions.deleteService(serviceId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center">
                 <button onClick={() => handleOpenModal(null)} className="flex items-center bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-500 font-bold">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nuevo Servicio
                </button>
            </div>
            
            <Table headers={['Nombre', 'Precio', 'Estado', 'Acciones']}>
                {services.map((service: Service) => (
                    <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-text-main font-medium">{service.name}</td>
                        <td className="px-6 py-4">{service.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${service.activo ? 'bg-status-green' : 'bg-gray-400'}`}>
                                {service.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-4">
                             <button onClick={() => handleOpenModal(service)} className="font-medium text-primary hover:underline inline-flex items-center">
                                <EditIcon className="w-5 h-5" />
                            </button>
                            {service.activo && (
                                <button onClick={() => handleDelete(service.id)} className="font-medium text-status-red hover:underline inline-flex items-center" title="Desactivar Servicio">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </Table>
            
            {isModalOpen && selectedService && (
                <ServiceModal 
                    service={selectedService}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const ServiceModal = ({ service, onClose, onSave }: { service: Service, onClose: () => void, onSave: (service: Service) => void }) => {
    const { inventory } = useStore();
    const [formData, setFormData] = useState<Service>(service);
    const [newInsumoId, setNewInsumoId] = useState<string>('');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? parseFloat(value) || 0 : value);
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleInsumoQtyChange = (index: number, quantity: number) => {
        const newInsumos = [...formData.insumos_consumidos];
        newInsumos[index].quantity = quantity;
        setFormData(prev => ({ ...prev, insumos_consumidos: newInsumos }));
    };

    const handleRemoveInsumo = (index: number) => {
        const newInsumos = [...formData.insumos_consumidos];
        newInsumos.splice(index, 1);
        setFormData(prev => ({ ...prev, insumos_consumidos: newInsumos }));
    };

    const handleAddInsumo = () => {
        if (newInsumoId && !formData.insumos_consumidos.some((i: DefaultSupply) => i.inventoryItemId === newInsumoId)) {
            const newDefaultSupply: DefaultSupply = { inventoryItemId: newInsumoId, quantity: 1 };
            setFormData(prev => ({ ...prev, insumos_consumidos: [...prev.insumos_consumidos, newDefaultSupply] }));
            setNewInsumoId('');
        }
    };
    
    const availableInsumos = inventory.filter(
        (invItem: InventoryItem) => !formData.insumos_consumidos.some((sup: DefaultSupply) => sup.inventoryItemId === invItem.id)
    );

    return (
        <Modal title={formData.id ? "Editar Servicio" : "Nuevo Servicio"} isOpen={true} onClose={onClose}>
            <ModalForm onSave={() => onSave(formData)} onCancel={onClose}>
                <FormInput label="Nombre del Servicio" id="name" name="name" value={formData.name} onChange={handleChange} required />
                <FormTextarea label="Descripción" id="description" name="description" value={formData.description || ''} onChange={handleChange} />
                <FormInput label="Precio" id="price" name="price" type="number" step="100" value={formData.price} onChange={handleChange} required />
                <div className="flex items-center">
                    <input type="checkbox" id="activo" name="activo" checked={formData.activo} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <label htmlFor="activo" className="ml-2 block text-sm text-text-main">Servicio Activo</label>
                </div>
                
                <div className="pt-4 mt-4 border-t space-y-2">
                    <h3 className="font-semibold text-text-main">Insumos Consumidos por Defecto</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {formData.insumos_consumidos.map((insumo: DefaultSupply, index: number) => {
                             const itemDetails = inventory.find((i: InventoryItem) => i.id === insumo.inventoryItemId);
                             return (
                                 <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                     <span className="flex-1 text-sm">{itemDetails?.name || 'Insumo no encontrado'}</span>
                                     <input 
                                        type="number" 
                                        value={insumo.quantity} 
                                        onChange={(e) => handleInsumoQtyChange(index, parseFloat(e.target.value) || 0)}
                                        className="w-20 p-1 border rounded text-sm"
                                        step="0.01"
                                     />
                                     <span className="text-sm text-text-secondary">{itemDetails?.unit}</span>
                                     <button type="button" onClick={() => handleRemoveInsumo(index)} className="text-status-red hover:text-red-700">
                                         <XIcon className="w-4 h-4"/>
                                     </button>
                                 </div>
                             );
                        })}
                         {formData.insumos_consumidos.length === 0 && (
                            <p className="text-center text-sm text-text-secondary py-4">No hay insumos asignados a este servicio.</p>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                        <select
                            value={newInsumoId}
                            onChange={(e) => setNewInsumoId(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                        >
                            <option value="" disabled>Seleccionar insumo...</option>
                            {availableInsumos.map((item: InventoryItem) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                        <button type="button" onClick={handleAddInsumo} disabled={!newInsumoId} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300">
                            Añadir
                        </button>
                    </div>
                </div>
            </ModalForm>
        </Modal>
    );
};