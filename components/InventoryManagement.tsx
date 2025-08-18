

import React, { useState, useMemo } from 'react';
import { useStore, actions } from '../services/store';
import { InventoryItem } from '../types';
import { Table, TableRow, TableCell } from './common/Table';
import { Modal, ModalForm, FormInput, FormSelect } from './common/Modal';
import { PlusIcon, XIcon } from './icons';

const emptyItem: InventoryItem = { id: '', name: '', stock: 0, unit: 'Uds', minStock: 0, provider: '' };

const StatusBadge = ({ stock, minStock }: { stock: number; minStock: number }) => {
    if (stock <= 0) {
        return <span className="px-2 py-1 text-xs font-semibold text-white bg-status-red rounded-full">AGOTADO</span>;
    }
    if (stock <= minStock) {
        return <span className="px-2 py-1 text-xs font-semibold text-white bg-status-yellow rounded-full">BAJO</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold text-white bg-status-green rounded-full">OK</span>;
};

export const InventoryManagement: React.FC = () => {
    const { inventory, filters } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const activeFilter = filters.inventory;

    const filteredInventory = useMemo(() => {
        if (!activeFilter.status) {
            return inventory;
        }
        if (activeFilter.status === 'low') {
            return inventory.filter((item: InventoryItem) => item.stock <= item.minStock);
        }
        return inventory;
    }, [inventory, activeFilter]);


    const handleOpenModal = (item: InventoryItem | null) => {
        setSelectedItem(item || emptyItem);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleSave = (itemToSave: InventoryItem) => {
        actions.addOrUpdateInventoryItem(itemToSave);
        handleCloseModal();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center">
                 <button onClick={() => handleOpenModal(null)} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Añadir Insumo
                </button>
            </div>

            {activeFilter.status === 'low' && (
                <div className="flex items-center justify-between p-2 bg-yellow-100 text-yellow-800 rounded-lg">
                    <p className="text-sm font-semibold">
                        Filtro activo: Mostrando solo insumos con stock bajo o agotado.
                    </p>
                    <button onClick={actions.clearInventoryFilter} className="flex items-center font-bold hover:text-yellow-900">
                        <XIcon className="w-4 h-4 mr-1" />
                        Limpiar
                    </button>
                </div>
            )}

            <Table headers={['Insumo', 'Stock Actual', 'Unidad', 'Stock Mínimo', 'Estado', 'Proveedor', '']}>
                {filteredInventory.map((item: InventoryItem) => (
                    <TableRow key={item.id} onEdit={() => handleOpenModal(item)}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.minStock}</TableCell>
                        <TableCell><StatusBadge stock={item.stock} minStock={item.minStock} /></TableCell>
                        <TableCell>{item.provider}</TableCell>
                    </TableRow>
                ))}
            </Table>
            
            {isModalOpen && selectedItem && (
                <InventoryModal 
                    item={selectedItem}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const InventoryModal = ({ item, onClose, onSave }: { item: InventoryItem, onClose: () => void, onSave: (item: InventoryItem) => void }) => {
    const [formData, setFormData] = useState<InventoryItem>(item);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    return (
        <Modal title={formData.id ? "Editar Insumo" : "Nuevo Insumo"} isOpen={true} onClose={onClose}>
            <ModalForm onSave={() => onSave(formData)} onCancel={onClose}>
                <FormInput label="Nombre del Insumo" id="name" name="name" value={formData.name} onChange={handleChange} required />
                <FormInput label="Stock Actual" id="stock" name="stock" type="number" step="0.1" value={formData.stock} onChange={handleChange} required />
                <FormSelect label="Unidad" id="unit" name="unit" value={formData.unit} onChange={handleChange}>
                    <option value="L">Litros</option>
                    <option value="Kg">Kilos</option>
                    <option value="Uds">Unidades</option>
                </FormSelect>
                <FormInput label="Stock Mínimo para Alerta" id="minStock" name="minStock" type="number" step="0.1" value={formData.minStock} onChange={handleChange} required />
                <FormInput label="Proveedor Predeterminado" id="provider" name="provider" value={formData.provider} onChange={handleChange} />
            </ModalForm>
        </Modal>
    );
};