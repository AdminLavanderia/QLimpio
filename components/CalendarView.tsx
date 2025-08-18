

import React, { useState, useMemo } from 'react';
import { actions, useStore } from '../services/store';
import { CalendarData, Order, ClientType, Client } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from './icons';

const DayDetailsPanel = ({ date, onClose, openOrderDetails }: { date: Date, onClose: () => void, openOrderDetails: (order: Order) => void }) => {
    const { clients } = useStore();
    const dateStr = date.toISOString().split('T')[0];
    const orders = actions.getOrdersByDeliveryDate(dateStr);

    const groupedOrders = orders.reduce((acc: Record<string, Order[]>, order: Order) => {
        const client = clients.find((c: Client) => c.id === order.clientId);
        const group = client?.type === ClientType.Corporate ? 'Hotel/Corp.' : 'Regular';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    return (
        <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-lg z-20 flex flex-col transform transition-transform duration-300 ease-in-out">
            <header className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold font-display text-lg">Entregas para {date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XIcon /></button>
            </header>
            <main className="p-4 overflow-y-auto flex-1">
                {Object.keys(groupedOrders).length === 0 ? (
                    <p className="text-center text-text-secondary mt-8">No hay entregas para este día.</p>
                ) : (
                    Object.entries(groupedOrders).map(([groupName, groupOrders]) => (
                        <div key={groupName} className="mb-6">
                            <h4 className="font-bold text-primary mb-2">{groupName} ({groupOrders.length})</h4>
                            <ul className="space-y-2">
                                {groupOrders.map((order: Order) => {
                                    const client = clients.find((c: Client) => c.id === order.clientId);
                                    return (
                                    <li 
                                        key={order.id} 
                                        className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                        onClick={() => openOrderDetails(order)}
                                    >
                                        <p className="font-semibold">#{order.numericId} - {client?.name}</p>
                                        <p className="text-xs text-text-secondary">Estado: {order.status}</p>
                                    </li>
                                )})}
                            </ul>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export const CalendarView = ({ openOrderDetails }: { openOrderDetails: (order: Order) => void }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const calendarData = useMemo(() => {
        return actions.getCalendarDataForMonth(currentDate.getFullYear(), currentDate.getMonth());
    }, [currentDate]);

    const changeMonth = (amount: number) => {
        setSelectedDate(null);
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const renderHeader = () => {
        const monthFormat = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' });
        return (
            <div className="flex justify-between items-center p-4">
                <h2 className="text-xl font-bold font-display capitalize">{monthFormat.format(currentDate)}</h2>
                <div className="flex space-x-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeftIcon /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-200">Hoy</button>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRightIcon /></button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return (
            <div className="grid grid-cols-7 text-center font-semibold text-text-secondary text-sm">
                {days.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(monthStart);
        startDate.setDate(startDate.getDate() - monthStart.getDay());
        const endDate = new Date(monthEnd);
        if (monthEnd.getDay() !== 6) {
           endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
        }

        const rows = [];
        let days = [];
        let day = new Date(startDate);

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const dateForCell = new Date(day);
                const dateStr = dateForCell.toISOString().split('T')[0];
                const dayData = calendarData[dateStr];
                const isToday = dateForCell.toDateString() === new Date().toDateString();
                const isCurrentMonth = dateForCell.getMonth() === currentDate.getMonth();

                days.push(
                    <div
                        key={dateForCell.toString()}
                        className={`border-t border-r p-2 h-32 flex flex-col cursor-pointer transition-colors ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-blue-50'} ${isToday ? 'bg-blue-100' : ''}`}
                        onClick={() => setSelectedDate(dateForCell)}
                    >
                        <span className={`self-end font-semibold ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                            {dateForCell.getDate()}
                        </span>
                        {dayData && (
                            <div className="mt-1 text-xs text-left">
                                <p className="font-bold text-blue-600">{dayData.total_entregas} entregas</p>
                                {dayData.desglose_por_tipo.map(d => (
                                    <p key={d.type}>{d.type}: {d.quantity}</p>
                                ))}
                            </div>
                        )}
                    </div>
                );
                day.setDate(day.getDate() + 1);
            }
            rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
            days = [];
        }

        return <div className="border-l border-b">{rows}</div>;
    };


    return (
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col relative overflow-hidden">
            {renderHeader()}
            {renderDays()}
            <div className="flex-1 overflow-y-auto">
                {renderCells()}
            </div>
            {selectedDate && <DayDetailsPanel date={selectedDate} onClose={() => setSelectedDate(null)} openOrderDetails={openOrderDetails} />}
        </div>
    );
};