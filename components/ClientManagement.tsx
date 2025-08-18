

import React, { useState, useMemo } from 'react';
import { useStore, actions } from '../services/store';
import { Client, ClientType } from '../types';
import { Table, TableRow, TableCell } from './common/Table';
import { Modal, ModalForm, FormInput, FormSelect, FormTextarea } from './common/Modal';
import { PlusIcon } from './icons';

const emptyClient: Client = { id: '', name: '', phone: '', type: ClientType.Regular, preferences: '', participa_fidelizacion: false, puntos_actuales: 0, fecha_ultimo_pedido: null };

export const ClientManagement: React.FC = () => {
    const { clients } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = useMemo(() => 
        clients.filter((client: Client) => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm)
        ), [clients, searchTerm]);

    const handleOpenModal = (client: Client | null) => {
        setSelectedClient(client || emptyClient);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    const handleSave = (clientToSave: Client) => {
        actions.addOrUpdateClient(clientToSave);
        handleCloseModal();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Buscar por nombre o teléfono..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                <button onClick={() => handleOpenModal(null)} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Añadir Cliente
                </button>
            </div>

            <Table headers={['Nombre', 'Teléfono', 'Tipo', 'Puntos Fidel.', '']}>
                {filteredClients.map((client: Client) => (
                    <TableRow key={client.id} onEdit={() => handleOpenModal(client)}>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.type}</TableCell>
                        <TableCell>{client.participa_fidelizacion ? client.puntos_actuales : 'No participa'}</TableCell>
                    </TableRow>
                ))}
            </Table>

            {isModalOpen && selectedClient && (
                <ClientModal 
                    client={selectedClient} 
                    onClose={handleCloseModal} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
};

const ClientModal = ({ client, onClose, onSave }: { client: Client, onClose: () => void, onSave: (client: Client) => void }) => {
    const [formData, setFormData] = useState<Client>(client);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    return (
        <Modal title={formData.id ? "Editar Cliente" : "Nuevo Cliente"} isOpen={true} onClose={onClose}>
            <ModalForm onSave={() => onSave(formData)} onCancel={onClose}>
                <FormInput label="Nombre" id="name" name="name" value={formData.name} onChange={handleChange} required />
                <FormInput label="Teléfono" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                <FormSelect label="Tipo de Cliente" id="type" name="type" value={formData.type} onChange={handleChange}>
                    <option value={ClientType.Regular}>Regular</option>
                    <option value={ClientType.Corporate}>Cuenta Corriente</option>
                </FormSelect>
                <FormTextarea label="Preferencias" id="preferences" name="preferences" value={formData.preferences} onChange={handleChange} />
                <div className="flex items-center pt-2">
                    <input type="checkbox" id="participa_fidelizacion" name="participa_fidelizacion" checked={formData.participa_fidelizacion} onChange={handleCheckboxChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <label htmlFor="participa_fidelizacion" className="ml-2 block text-sm text-text-main">Inscribir en programa de fidelización</label>
                </div>
            </ModalForm>
        </Modal>
    );
};