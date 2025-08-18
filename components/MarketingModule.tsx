
import React, { useState } from 'react';
import { useStore, actions } from '../services/store';
import { Promotion, LoyaltyConfig, Service, PointMovement, Client } from '../types';
import { PlusIcon, EditIcon, TrashIcon, TicketIcon, StarIcon } from './icons';
import { Modal, ModalForm, FormInput, FormSelect, FormTextarea } from './common/Modal';

// --- Promotions Management ---
const emptyPromotion: Promotion = {
    id: '', name: '', description: '', type: 'Porcentaje', value: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicableServices: [], active: true,
};

const PromotionModal = ({ promo, onClose, onSave }: { promo: Promotion; onClose: () => void; onSave: (p: Promotion) => void; }) => {
    const { services } = useStore();
    const [formData, setFormData] = useState<Promotion>(promo);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleServiceToggle = (serviceId: string) => {
        setFormData(prev => {
            const newServices = prev.applicableServices.includes(serviceId)
                ? prev.applicableServices.filter(id => id !== serviceId)
                : [...prev.applicableServices, serviceId];
            return { ...prev, applicableServices: newServices };
        });
    };

    return (
        <Modal title={formData.id ? 'Editar Promoción' : 'Nueva Promoción'} isOpen={true} onClose={onClose}>
            <ModalForm onSave={() => onSave(formData)} onCancel={onClose}>
                <FormInput label="Nombre" id="name" name="name" value={formData.name} onChange={handleChange} required />
                <FormTextarea label="Descripción" id="description" name="description" value={formData.description} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                    <FormSelect label="Tipo de Descuento" id="type" name="type" value={formData.type} onChange={handleChange}>
                        <option value="Porcentaje">Porcentaje (%)</option>
                        <option value="Monto Fijo">Monto Fijo ($)</option>
                    </FormSelect>
                    <FormInput label="Valor" id="value" name="value" type="number" value={formData.value} onChange={handleChange} required />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Fecha de Inicio" id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                    <FormInput label="Fecha de Fin" id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block mb-2 text-sm font-medium text-text-secondary">Servicios Aplicables (dejar en blanco para todos)</label>
                    <div className="grid grid-cols-2 gap-2 border p-2 rounded-lg max-h-24 overflow-y-auto">
                        {services.filter((s: Service) => s.activo).map((s: Service) => (
                            <label key={s.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100">
                                <input type="checkbox" checked={formData.applicableServices.includes(s.id)} onChange={() => handleServiceToggle(s.id)} />
                                <span className="text-sm">{s.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <label htmlFor="active" className="ml-2 block text-sm text-text-main">Promoción Activa</label>
                </div>
            </ModalForm>
        </Modal>
    );
};

const PromotionsManager = () => {
    const { promotions } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

    const handleSave = (promo: Promotion) => {
        actions.addOrUpdatePromotion(promo);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => { setSelectedPromo(emptyPromotion); setIsModalOpen(true); }} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-bold">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Crear Promoción
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    {/* ... table header ... */}
                    <tbody>
                        {promotions.map((promo: Promotion) => (
                             <tr key={promo.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-text-main">{promo.name}</td>
                                <td className="px-6 py-4">{promo.type === 'Porcentaje' ? `${promo.value}%` : promo.value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                                <td className="px-6 py-4">{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${promo.active ? 'bg-status-green' : 'bg-gray-400'}`}>{promo.active ? 'Activa' : 'Inactiva'}</span></td>
                                <td className="px-6 py-4 text-right space-x-4">
                                     <button onClick={() => { setSelectedPromo(promo); setIsModalOpen(true); }} className="font-medium text-primary hover:underline inline-flex items-center"><EditIcon /></button>
                                     <button onClick={() => actions.deletePromotion(promo.id)} className="font-medium text-status-red hover:underline inline-flex items-center"><TrashIcon /></button>
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && selectedPromo && <PromotionModal promo={selectedPromo} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};


// --- Loyalty Program Management ---
const LoyaltyManager = () => {
    const { loyaltyConfig, pointMovements, clients } = useStore();
    const [config, setConfig] = useState(loyaltyConfig);

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSaveConfig = () => {
        actions.updateLoyaltyConfig(config);
        alert('Configuración guardada!');
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4">Configuración del Programa</h3>
                <div className="space-y-4">
                    <FormInput label="1 Punto por cada X pesos gastados" id="pointsPerPeso" name="pointsPerPeso" type="number" value={1 / config.pointsPerPeso} onChange={e => setConfig(prev => ({...prev, pointsPerPeso: 1 / (parseFloat(e.target.value) || 1)}))}/>
                    <FormInput label="Valor en pesos de 1 punto" id="pesoValuePerPoint" name="pesoValuePerPoint" type="number" value={config.pesoValuePerPoint} onChange={handleConfigChange} />
                    <FormInput label="Días para vencimiento de puntos" id="expirationDays" name="expirationDays" type="number" value={config.expirationDays} onChange={handleConfigChange} />
                    <button onClick={handleSaveConfig} className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-blue-700">Guardar Configuración</button>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                 <h3 className="font-bold text-lg mb-4">Últimos Movimientos de Puntos</h3>
                 <div className="border rounded-lg overflow-hidden max-h-96">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-text-secondary sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold">Cliente</th>
                                <th className="p-3 font-semibold">Tipo</th>
                                <th className="p-3 font-semibold text-right">Puntos</th>
                                <th className="p-3 font-semibold">Fecha</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y">
                             {pointMovements.slice().reverse().map((mov: PointMovement) => {
                                const client = clients.find((c: Client) => c.id === mov.clientId);
                                return (
                                <tr key={mov.id}>
                                    <td className="p-3 font-medium">{client?.name || 'N/A'}</td>
                                    <td className="p-3 capitalize">{mov.type}</td>
                                    <td className={`p-3 text-right font-bold ${mov.points > 0 ? 'text-green-600' : 'text-red-600'}`}>{mov.points > 0 ? `+${mov.points}`: mov.points}</td>
                                    <td className="p-3">{new Date(mov.timestamp).toLocaleString('es-AR')}</td>
                                </tr>
                                )
                             })}
                         </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
}


export const MarketingModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'promotions' | 'loyalty'>('promotions');

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-3 text-md font-bold rounded-t-lg transition-colors ${activeTab === id ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
            {icon} <span className="ml-2">{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="flex space-x-4 -mb-px">
                    <TabButton id="promotions" label="Promociones" icon={<TicketIcon className="w-5 h-5"/>}/>
                    <TabButton id="loyalty" label="Fidelización" icon={<StarIcon className="w-5 h-5"/>}/>
                </nav>
            </div>
            <div>
                {activeTab === 'promotions' && <PromotionsManager />}
                {activeTab === 'loyalty' && <LoyaltyManager />}
            </div>
        </div>
    );
};