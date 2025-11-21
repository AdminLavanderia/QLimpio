
import React, { useState } from 'react';
import { useStore, actions } from '../services/store';
import { Employee, Role, AttendanceRecord } from '../types';
import { PlusIcon, EditIcon, ClockIcon, KeyIcon, EyeIcon, EyeOffIcon } from './icons';
import { Modal, ModalForm, FormInput, FormSelect } from './common/Modal';

const emptyEmployee: Employee = { id: '', name: '', username: '', role: Role.Employee, avatarUrl: '', password: '' };

const EmployeeStatus = ({ employeeId }: { employeeId: string }) => {
    const { attendance } = useStore();
    const lastRecord = attendance
        .filter((a: AttendanceRecord) => a.employeeId === employeeId)
        .sort((a: AttendanceRecord, b: AttendanceRecord) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())[0];

    const isPresent = lastRecord && lastRecord.checkOut === null;

    return (
        <div className="flex items-center mt-2">
            <span className={`w-2.5 h-2.5 rounded-full mr-2 ${isPresent ? 'bg-status-green animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="text-sm text-text-secondary">{isPresent ? 'Presente' : 'Ausente'}</span>
        </div>
    );
};


export const EmployeeManagement: React.FC = () => {
    const { employees } = useStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const handleOpenModal = (employee: Employee | null) => {
        setSelectedEmployee(employee || emptyEmployee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };
    
    const handleSave = (employeeToSave: Employee) => {
        const savedEmployee = actions.addOrUpdateEmployee(employeeToSave);

        if (savedEmployee) {
            alert(`Los datos de ${savedEmployee.name} se guardaron correctamente.`);
            handleCloseModal();
        } else {
            alert('Hubo un error al guardar los datos del empleado.');
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-end items-center">
                 <button onClick={() => handleOpenModal(null)} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Añadir Empleado
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {employees.map((employee: Employee) => (
                    <div key={employee.id} className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                                <img src={employee.avatarUrl} alt={employee.name} className="w-16 h-16 rounded-full mr-4" />
                                <div>
                                    <p className="font-bold text-text-main">{employee.name}</p>
                                    <p className="text-xs text-text-secondary mb-1">@{employee.username}</p>
                                    <p className="text-sm text-text-secondary">{employee.role}</p>
                                </div>
                            </div>
                             <button onClick={() => handleOpenModal(employee)} className="text-gray-400 hover:text-primary">
                                <EditIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="self-end">
                            <EmployeeStatus employeeId={employee.id} />
                        </div>
                    </div>
                ))}
            </div>
            
            {isModalOpen && selectedEmployee && (
                <EmployeeModal 
                    employee={selectedEmployee}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};


const EmployeeModal = ({ employee, onClose, onSave }: { employee: Employee, onClose: () => void, onSave: (employee: Employee) => void }) => {
    const [formData, setFormData] = useState<Employee>(employee);
    const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'security'>('info');
    
    // Security Tab State
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');
    
    const { attendance, currentUser } = useStore();
    const isAdmin = currentUser?.role === Role.Admin;

    const employeeAttendance = attendance
        .filter((a: AttendanceRecord) => a.employeeId === formData.id)
        .sort((a: AttendanceRecord, b: AttendanceRecord) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Auto-generate username suggestion for new employees when name changes, but only if user hasn't manually edited it
            // or if it's a new user and they haven't typed in the username field yet (simple heuristic)
            if (name === 'name' && !prev.id && (!prev.username || prev.username.length < 3)) {
                 newData.username = value
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, '.')
                    .replace(/[^a-z0-9.]/g, '');
            }
            return newData;
        });
    };

    // Main save handler for the "Info" tab.
    const handleSaveChanges = () => {
        if (!formData.username || formData.username.length < 3) {
             alert('El nombre de usuario es obligatorio y debe tener al menos 3 caracteres.');
             return;
        }
        if (!formData.id && (!formData.password || formData.password.length < 4)) {
            alert('La contraseña es obligatoria y debe tener al menos 4 caracteres.');
            return;
        }
        onSave(formData);
    }
    
    // Handler for the "Security" tab form.
    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 4) {
            alert('La nueva contraseña debe tener al menos 4 caracteres.');
            return;
        }
        if (newPassword !== verifyPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        
        const updatedEmployeeWithNewPassword = { ...formData, password: newPassword };
        onSave(updatedEmployeeWithNewPassword);
    };

    const formatDateTime = (isoString: string | null): string => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDuration = (start: string, end: string | null): string => {
        if (!end) return 'En curso';
        const diff = new Date(end).getTime() - new Date(start).getTime();
        if (diff < 0) return 'Error';
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    };

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === id ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
            {icon} <span className="ml-2">{label}</span>
        </button>
    );

    return (
        <Modal title={formData.id ? "Ficha del Empleado" : "Nuevo Empleado"} isOpen={true} onClose={onClose}>
            <div className="border-b border-gray-200 px-4 pt-2">
                <nav className="flex space-x-2 -mb-px">
                    <TabButton id="info" label="Información" icon={<EditIcon className="w-4 h-4"/>} />
                    {formData.id && <TabButton id="attendance" label="Asistencia" icon={<ClockIcon className="w-4 h-4"/>} />}
                    {formData.id && isAdmin && <TabButton id="security" label="Seguridad" icon={<KeyIcon className="w-4 h-4"/>} />}
                </nav>
            </div>
            {activeTab === 'info' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="flex flex-col flex-1 min-h-0">
                    <main className="p-6 overflow-y-auto flex-1 space-y-4">
                        <FormInput label="Nombre Completo" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        <FormInput 
                            label="Usuario (para login)" 
                            id="username" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                            placeholder="ej: graciela.jorquera"
                        />
                        {!formData.id && (
                             <FormInput
                                label="Contraseña Inicial"
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password || ''}
                                onChange={handleChange}
                                required
                                minLength={4}
                            />
                        )}
                        <FormSelect label="Rol" id="role" name="role" value={formData.role} onChange={handleChange} disabled={!isAdmin}>
                            <option value={Role.Employee}>Operario de Lavandería</option>
                            <option value={Role.Admin}>Encargado / Administrador</option>
                        </FormSelect>
                        {!isAdmin && <p className="text-xs text-yellow-600">Solo un administrador puede cambiar el rol.</p>}
                    </main>
                    <footer className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 bg-white border mr-2 hover:bg-gray-100">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-blue-600">Guardar Cambios</button>
                    </footer>
                </form>
            )}
            {activeTab === 'attendance' && (
                 <main className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-2">
                        {employeeAttendance.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden max-h-96">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-text-secondary sticky top-0">
                                        <tr>
                                            <th className="p-3 font-semibold">Fecha</th>
                                            <th className="p-3 font-semibold">Entrada</th>
                                            <th className="p-3 font-semibold">Salida</th>
                                            <th className="p-3 font-semibold text-right">Duración</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {employeeAttendance.map((record: AttendanceRecord) => (
                                            <tr key={record.id}>
                                                <td className="p-3">{new Date(record.checkIn).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit', year: 'numeric'})}</td>
                                                <td className="p-3">{formatDateTime(record.checkIn)}</td>
                                                <td className="p-3">{formatDateTime(record.checkOut)}</td>
                                                <td className="p-3 text-right font-medium">{calculateDuration(record.checkIn, record.checkOut)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-text-secondary py-8">No hay registros de asistencia para este empleado.</p>
                        )}
                    </div>
                 </main>
            )}
            {activeTab === 'security' && isAdmin && (
                 <div className="flex flex-col flex-1 min-h-0">
                    <main className="p-6 overflow-y-auto flex-1 space-y-4">
                        <h3 className="font-bold text-lg">Seguridad de la Cuenta</h3>

                        {!isChangingPassword ? (
                            <>
                                <div>
                                    <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-text-secondary">Contraseña Actual</label>
                                    <div className="relative">
                                        <input
                                            id="currentPassword"
                                            type={isPasswordVisible ? 'text' : 'password'}
                                            value={formData.password}
                                            disabled
                                            className="bg-gray-200 border border-gray-300 text-text-main text-sm rounded-lg block w-full p-2.5 pr-10"
                                        />
                                        <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                                            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(true)}
                                    className="mt-4 w-full bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-500 flex items-center justify-center"
                                >
                                    <KeyIcon className="w-5 h-5 mr-2" />
                                    Cambiar Contraseña
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handlePasswordSave} className="space-y-4">
                                <p className="text-sm text-text-secondary">Introduce la nueva contraseña para {formData.name}.</p>
                                <FormInput
                                    label="Nueva Contraseña"
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 4 caracteres"
                                    required
                                    minLength={4}
                                />
                                <FormInput
                                    label="Verificar Contraseña"
                                    id="verifyPassword"
                                    type="password"
                                    value={verifyPassword}
                                    onChange={(e) => setVerifyPassword(e.target.value)}
                                    placeholder="Vuelva a introducir la contraseña"
                                    required
                                />
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <button type="button" onClick={() => { setIsChangingPassword(false); setNewPassword(''); setVerifyPassword(''); }} className="px-4 py-2 rounded-lg text-gray-700 bg-white border hover:bg-gray-100">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-blue-600 font-bold">Guardar Nueva Contraseña</button>
                                </div>
                            </form>
                        )}
                    </main>
                </div>
            )}
        </Modal>
    );
};