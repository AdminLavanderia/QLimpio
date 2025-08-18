

import React, { useState } from 'react';
import { useStore, actions } from '../services/store';
import { Equipment, EquipmentType, EquipmentStatus } from '../types';
import { Modal, ModalForm, FormInput, FormSelect, FormTextarea } from './common/Modal';
import { PlusIcon, EditIcon, TrashIcon } from './icons';

const emptyEquipment: Equipment = { id: '', name: '', type: 'Lavadora', status: 'Operativa', notes: '' };

const StatusPill = ({ status }: { status: EquipmentStatus }) => {
    const color = status === 'Operativa' ? 'bg-status-green' : 'bg-status-red';
    return <span className={`px-2 py-1 text-xs font-semibold text-white ${color} rounded-full`}>{status}</span>;
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
);

export const EquipmentManagement: React.FC = () => {
    const { equipment } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

    const handleOpenModal = (item: Equipment | null) => {
        setSelectedItem(item || emptyEquipment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleSave = (itemToSave: Equipment) => {
        actions.addOrUpdateEquipment(itemToSave);
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Seguro que quieres eliminar este equipo? Esta acción no se puede deshacer.')) {
            actions.deleteEquipment(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center">
                 <button onClick={() => handleOpenModal(null)} className="flex items-center bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-500 font-bold">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Añadir Equipo
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Notas</th>
                            <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipment.map((item: Equipment) => (
                            <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-text-main">{item.name}</td>
                                <td className="px-6 py-4">{item.type}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <ToggleSwitch checked={item.status === 'Operativa'} onChange={() => actions.toggleEquipmentStatus(item.id)} />
                                        <StatusPill status={item.status} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-text-secondary">{item.notes}</td>
                                <td className="px-6 py-4 text-right space-x-4">
                                    <button onClick={() => handleOpenModal(item)} className="font-medium text-primary hover:underline inline-flex items-center"><EditIcon /></button>
                                    <button onClick={() => handleDelete(item.id)} className="font-medium text-status-red hover:underline inline-flex items-center"><TrashIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isModalOpen && selectedItem && (
                <EquipmentModal 
                    item={selectedItem}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const EquipmentModal = ({ item, onClose, onSave }: { item: Equipment, onClose: () => void, onSave: (item: Equipment) => void }) => {
    const [formData, setFormData] = useState<Equipment>(item);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal title={formData.id ? "Editar Equipo" : "Nuevo Equipo"} isOpen={true} onClose={onClose}>
            <ModalForm onSave={() => onSave(formData)} onCancel={onClose}>
                <FormInput label="Nombre del Equipo" id="name" name="name" value={formData.name} onChange={handleChange} required />
                <FormSelect label="Tipo de Equipo" id="type" name="type" value={formData.type} onChange={handleChange}>
                    <option value="Lavadora">Lavadora</option>
                    <option value="Secadora">Secadora</option>
                    <option value="Centrífugador">Centrífugador</option>
                    <option value="Plancha">Plancha</option>
                    <option value="Planchadora">Planchadora</option>
                    <option value="Dobladora">Dobladora</option>
                    <option value="Selladora">Selladora</option>
                    <option value="Hidrolavadora">Hidrolavadora</option>
                </FormSelect>
                <FormSelect label="Estado" id="status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="Operativa">Operativa</option>
                    <option value="Fuera de Servicio">Fuera de Servicio</option>
                </FormSelect>
                <FormTextarea label="Notas (mantenimiento, fallas, etc.)" id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} />
            </ModalForm>
        </Modal>
    );
};