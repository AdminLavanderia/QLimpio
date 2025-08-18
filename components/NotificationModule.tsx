
import React, { useState } from 'react';
import { useStore, actions } from '../services/store';
import { Client, NotificationLog } from '../types';

export const NotificationModule: React.FC = () => {
    const { clients, notificationLogs } = useStore();
    const [activeTab, setActiveTab] = useState<'history' | 'send'>('history');
    const [message, setMessage] = useState('');
    const [selectedClients, setSelectedClients] = useState<string[]>([]);

    const handleClientToggle = (clientId: string) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const handleSend = () => {
        if (!message || selectedClients.length === 0) {
            alert('Por favor, escriba un mensaje y seleccione al menos un cliente.');
            return;
        }
        actions.sendMarketingNotification(selectedClients, message);
        alert(`Notificación enviada a ${selectedClients.length} cliente(s).`);
        setMessage('');
        setSelectedClients([]);
        setActiveTab('history');
    };

    const sortedLogs = [...notificationLogs].sort((a: NotificationLog, b: NotificationLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="flex space-x-2 -mb-px">
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-3 text-sm font-bold rounded-t-lg ${activeTab === 'history' ? 'border-b-2 border-primary text-primary bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}>
                        Historial de Envíos
                    </button>
                    <button onClick={() => setActiveTab('send')} className={`px-4 py-3 text-sm font-bold rounded-t-lg ${activeTab === 'send' ? 'border-b-2 border-primary text-primary bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}>
                        Enviar Campaña Manual
                    </button>
                </nav>
            </div>

            {activeTab === 'send' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Crear Mensaje de WhatsApp</h3>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe tu mensaje de promoción aquí... (Ej: ¡Hola {nombre_cliente}! Este mes en Q' Limpio...)"
                            className="w-full p-2 border rounded-lg h-32 focus:ring-primary focus:border-primary"
                        />
                        <button onClick={handleSend} className="mt-4 bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">
                            Enviar Notificación
                        </button>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                         <h3 className="font-bold text-lg mb-4">Seleccionar Clientes ({selectedClients.length})</h3>
                         <div className="border rounded-lg max-h-64 overflow-y-auto">
                            <ul>
                                {clients.map((client: Client) => (
                                    <li key={client.id} className="p-2 border-b last:border-b-0 hover:bg-gray-50">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedClients.includes(client.id)}
                                                onChange={() => handleClientToggle(client.id)}
                                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            <span>{client.name}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Historial de Notificaciones Enviadas</h3>
                    <div className="border rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-text-secondary sticky top-0">
                                <tr>
                                    <th className="p-3 font-semibold">Cliente</th>
                                    <th className="p-3 font-semibold">Tipo</th>
                                    <th className="p-3 font-semibold">Contenido</th>
                                    <th className="p-3 font-semibold">Fecha</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y">
                                {sortedLogs.map((log: NotificationLog) => {
                                    const client = clients.find((c: Client) => c.id === log.clientId);
                                    return (
                                    <tr key={log.id}>
                                        <td className="p-3 font-medium">{client?.name || 'N/A'}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-1 text-xs bg-gray-200 rounded-full">{log.template.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="p-3 text-text-secondary">{log.content}</td>
                                        <td className="p-3">{new Date(log.timestamp).toLocaleString('es-AR')}</td>
                                    </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};