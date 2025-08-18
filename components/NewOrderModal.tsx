
import React, { useState, useMemo, useEffect } from 'react';
import { actions, useStore } from '../services/store';
import { Modal, ModalForm, FormInput, FormSelect, FormTextarea } from './common/Modal';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, TicketIcon } from './icons';
import { Order, OrderStatus, Promotion, Service, Client } from '../types';

const DeliveryLoadCalendarPopup = ({ onSelectDate, onClose, currentDeliveryDate }: { onSelectDate: (date: string) => void, onClose: () => void, currentDeliveryDate: string }) => {
    const [viewDate, setViewDate] = useState(new Date(currentDeliveryDate || Date.now()));
    
    const calendarData = useMemo(() => {
        return actions.getCalendarDataForMonth(viewDate.getFullYear(), viewDate.getMonth());
    }, [viewDate]);

    const changeMonth = (amount: number) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    
    let days = [];
    let day = startDate;
    while(days.length < 42) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    return (
        <div className="absolute top-full mt-2 w-72 bg-white border shadow-lg rounded-lg z-30 p-2" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-200"><ChevronLeftIcon className="w-5 h-5"/></button>
                <span className="font-semibold text-sm">{viewDate.toLocaleDateString('es-AR', {month: 'long', year: 'numeric'})}</span>
                <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-200"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-text-secondary">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
                {days.map((d: Date) => {
                    const dateStr = d.toISOString().split('T')[0];
                    const dayData = calendarData[dateStr];
                    const isCurrentMonth = d.getMonth() === viewDate.getMonth();
                    return (
                        <button
                            type="button"
                            key={dateStr}
                            onClick={() => { onSelectDate(dateStr); onClose(); }}
                            className={`h-9 flex flex-col items-center justify-center rounded-lg ${!isCurrentMonth ? 'text-gray-300' : 'hover:bg-primary hover:text-white'} ${dateStr === currentDeliveryDate ? 'bg-primary text-white' : ''}`}
                        >
                            <span className="text-sm">{d.getDate()}</span>
                            {isCurrentMonth && dayData && <span className={`text-[8px] font-bold`}>{dayData.total_entregas}</span>}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export const NewOrderModal = ({ onClose, onOrderCreated }: { onClose: () => void, onOrderCreated: (order: Order) => void }) => {
    const { clients, services, employees } = useStore();
    const [formData, setFormData] = useState({
        clientId: '',
        serviceIds: [] as string[],
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isExpress: false,
        assignedTo: '',
        internalNotes: '',
        appliedPromotionId: '',
    });
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [applicablePromotions, setApplicablePromotions] = useState<Promotion[]>([]);
    
    const subtotal = useMemo(() => {
        return formData.serviceIds.reduce((sum: number, sId: string) => {
            const service = services.find((s: Service) => s.id === sId);
            return sum + (service?.price || 0);
        }, 0);
    }, [formData.serviceIds, services]);

    const discount = useMemo(() => {
        if (!formData.appliedPromotionId) return 0;
        const promo = applicablePromotions.find((p: Promotion) => p.id === formData.appliedPromotionId);
        if (!promo) return 0;
        if (promo.type === 'Porcentaje') {
            return subtotal * (promo.value / 100);
        }
        return promo.value;
    }, [formData.appliedPromotionId, applicablePromotions, subtotal]);
    
    const totalAmount = subtotal - discount + (formData.isExpress ? 4000 : 0);
    
    useEffect(() => {
        if (formData.serviceIds.length > 0) {
            const promos = actions.getApplicablePromotions(formData.serviceIds);
            setApplicablePromotions(promos);
            // If the currently selected promo is no longer applicable, deselect it
            if (formData.appliedPromotionId && !promos.some((p: Promotion) => p.id === formData.appliedPromotionId)) {
                setFormData(prev => ({...prev, appliedPromotionId: ''}));
            }
        } else {
            setApplicablePromotions([]);
            setFormData(prev => ({...prev, appliedPromotionId: ''}));
        }
    }, [formData.serviceIds]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleServiceChange = (serviceId: string) => {
        setFormData(prev => {
            const newServices = prev.serviceIds.includes(serviceId)
                ? prev.serviceIds.filter((id: string) => id !== serviceId)
                : [...prev.serviceIds, serviceId];
            return { ...prev, serviceIds: newServices };
        });
    };

    const handleSave = () => {
        if (!formData.clientId || formData.serviceIds.length === 0) {
            alert("Por favor, seleccione un cliente y al menos un servicio.");
            return;
        }

        const orderData: Omit<Order, 'id' | 'numericId' | 'history' | 'usedSupplies' | 'garments' | 'info_empaque' | 'completedTasks'> = {
            clientId: formData.clientId,
            services: formData.serviceIds.map((sId: string) => ({ serviceId: sId, quantity: 1})),
            status: OrderStatus.Assigned,
            isExpress: formData.isExpress,
            assignedTo: formData.assignedTo || undefined,
            receptionDate: new Date().toISOString().split('T')[0],
            deliveryDate: formData.deliveryDate,
            totalAmount: totalAmount,
            paidAmount: 0,
            internalNotes: formData.internalNotes,
            appliedPromotionId: formData.appliedPromotionId || undefined,
            discount: discount
        };
        const newOrder = actions.addOrder(orderData);
        onOrderCreated(newOrder);
        onClose();
    };

    return (
        <Modal title="Crear Nuevo Pedido" isOpen={true} onClose={onClose}>
            <ModalForm onSave={handleSave} onCancel={onClose}>
                <FormSelect label="Cliente" id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} required>
                    <option value="" disabled>Seleccione un cliente</option>
                    {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </FormSelect>
                <div>
                    <label className="block mb-2 text-sm font-medium text-text-secondary">Servicios</label>
                    <div className="grid grid-cols-2 gap-2 border p-2 rounded-lg max-h-32 overflow-y-auto">
                        {services.filter((s: Service) => s.activo).map((s: Service) => (
                            <label key={s.id} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100">
                                <input type="checkbox" checked={formData.serviceIds.includes(s.id)} onChange={() => handleServiceChange(s.id)} />
                                <span>{s.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                 {applicablePromotions.length > 0 && (
                    <FormSelect label="Promoción Aplicable" id="appliedPromotionId" name="appliedPromotionId" value={formData.appliedPromotionId} onChange={handleChange}>
                        <option value="">Ninguna</option>
                        {applicablePromotions.map((p: Promotion) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </FormSelect>
                )}
                 <div className="p-3 bg-gray-50 rounded-lg text-right">
                    <p className="text-sm">Subtotal: {subtotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
                    {discount > 0 && <p className="text-sm text-green-600">Descuento: -{discount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>}
                    <p className="font-bold text-lg">Total: {totalAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
                </div>
                 <div className="relative">
                    <label htmlFor="deliveryDate" className="block mb-2 text-sm font-medium text-text-secondary">Fecha de Entrega</label>
                    <div className="flex items-center">
                        <input id="deliveryDate" name="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleChange} required className="bg-gray-50 border border-gray-300 text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        <button type="button" onClick={() => setIsCalendarOpen(o => !o)} className="p-2 ml-2 text-text-secondary hover:text-primary"><CalendarIcon /></button>
                    </div>
                     {isCalendarOpen && <DeliveryLoadCalendarPopup onSelectDate={(date) => setFormData(p => ({...p, deliveryDate: date}))} onClose={() => setIsCalendarOpen(false)} currentDeliveryDate={formData.deliveryDate} />}
                </div>
                 <FormSelect label="Asignar a (Opcional)" id="assignedTo" name="assignedTo" value={formData.assignedTo} onChange={handleChange}>
                    <option value="">Sin asignar</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </FormSelect>
                <FormTextarea label="Notas Internas" id="internalNotes" name="internalNotes" value={formData.internalNotes} onChange={handleChange} />
            </ModalForm>
        </Modal>
    );
};