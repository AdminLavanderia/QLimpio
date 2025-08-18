
import React, { useState, useMemo } from 'react';
import { useStore, actions } from '../services/store';
import { Expense, AccountPayable, Payment, PaymentMethod, ExpenseCategory, PAYMENT_METHODS, Client, Order } from '../types';
import { Modal, ModalForm, FormInput, FormSelect } from './common/Modal';
import { PlusIcon } from './icons';

const formatCurrency = (value: number) => value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

type FinanceTab = 'expenses' | 'payable' | 'income';

// Expense Modal
const emptyExpense: Omit<Expense, 'id'> = {
    concept: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Transferencia',
    category: 'Otros'
};

const ExpenseModal = ({ onClose, onSave }: { onClose: () => void, onSave: (expense: Omit<Expense, 'id'>) => void }) => {
    const { expenseCategories } = useStore();
    const [formData, setFormData] = useState(emptyExpense);
    const [hasInstallments, setHasInstallments] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleInstallmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const count = parseInt(value, 10) || 0;
        setFormData(prev => ({
            ...prev,
            installmentsInfo: {
                ...prev.installmentsInfo,
                count,
                firstDueDate: prev.installmentsInfo?.firstDueDate || new Date().toISOString().split('T')[0]
            }
        }));
    };
    
    const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            installmentsInfo: {
                ...prev.installmentsInfo,
                count: prev.installmentsInfo?.count || 1,
                firstDueDate: value
            }
        }));
    };

    const handleSave = () => {
        const expenseToSave: Omit<Expense, 'id' | 'installmentsInfo'> & { installmentsInfo?: { count: number; firstDueDate: string; } } = { ...formData };
        if (!hasInstallments) {
            delete expenseToSave.installmentsInfo;
        }
        onSave(expenseToSave);
    };

    return (
        <Modal title="Registrar Nuevo Gasto" isOpen={true} onClose={onClose}>
            <ModalForm onSave={handleSave} onCancel={onClose}>
                <FormInput label="Concepto" id="concept" name="concept" value={formData.concept} onChange={handleChange} required />
                <FormInput label="Monto Total" id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
                <FormInput label="Fecha" id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                
                <div>
                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-text-secondary">Categoría</label>
                    <input
                        list="category-list"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="bg-gray-50 border border-gray-300 text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                        placeholder="Escribe o selecciona una categoría"
                    />
                    <datalist id="category-list">
                        {expenseCategories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                </div>

                <FormSelect label="Método de Pago" id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                     {PAYMENT_METHODS.filter(m => m !== 'Cuenta Corriente').map(m => <option key={m} value={m}>{m}</option>)}
                </FormSelect>
                <div className="flex items-center pt-2">
                    <input type="checkbox" id="hasInstallments" checked={hasInstallments} onChange={(e) => setHasInstallments(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <label htmlFor="hasInstallments" className="ml-2 block text-sm text-text-main">¿Es en cuotas?</label>
                </div>
                {hasInstallments && (
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg mt-2 bg-gray-50">
                        <FormInput label="Nº de Cuotas" id="installmentsCount" name="count" type="number" value={formData.installmentsInfo?.count || ''} onChange={handleInstallmentsChange} />
                        <FormInput label="Vencimiento 1ra Cuota" id="firstDueDate" name="firstDueDate" type="date" value={formData.installmentsInfo?.firstDueDate || ''} onChange={handleDueDateChange} />
                    </div>
                )}
            </ModalForm>
        </Modal>
    );
};

const ExpensesView = () => {
    const { expenses } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (expense: Omit<Expense, 'id'>) => {
        actions.addExpense(expense);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-bold">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Registrar Gasto
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-text-secondary uppercase text-xs">
                        <tr>
                            <th className="p-3 font-semibold">Fecha</th><th className="p-3 font-semibold">Concepto</th><th className="p-3 font-semibold">Categoría</th><th className="p-3 font-semibold text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {expenses.slice().sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((exp: Expense) => (
                            <tr key={exp.id}>
                                <td className="p-3">{new Date(exp.date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                                <td className="p-3 font-semibold">{exp.concept}</td>
                                <td className="p-3">{exp.category}</td>
                                <td className="p-3 text-right font-bold text-red-600">{formatCurrency(exp.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ExpenseModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

const AccountsPayableView = () => {
    const { accountsPayable } = useStore();
    const [showPaid, setShowPaid] = useState(false);

    const filteredPayables = useMemo(() => {
        return accountsPayable
            .filter((ap: AccountPayable) => showPaid || ap.status === 'pendiente')
            .sort((a: AccountPayable, b: AccountPayable) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [accountsPayable, showPaid]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={showPaid} onChange={() => setShowPaid(!showPaid)} className="h-4 w-4 text-primary rounded" />
                    <span className="ml-2 text-sm text-text-main">Mostrar pagadas</span>
                </label>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-text-secondary uppercase text-xs">
                        <tr>
                            <th className="p-3 font-semibold">Vencimiento</th><th className="p-3 font-semibold">Concepto</th><th className="p-3 font-semibold text-right">Monto</th><th className="p-3 font-semibold text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredPayables.map((ap: AccountPayable) => (
                            <tr key={ap.id}>
                                <td className="p-3">{new Date(ap.dueDate + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                                <td className="p-3 font-semibold">{ap.concept}</td>
                                <td className="p-3 text-right font-bold text-red-600">{formatCurrency(ap.amount)}</td>
                                <td className="p-3 text-center">
                                    {ap.status === 'pendiente' ? (
                                        <button onClick={() => actions.markAccountPayableAsPaid(ap.id)} className="bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-200">
                                            Marcar Pagada
                                        </button>
                                    ) : (
                                        <span className="text-green-600 font-bold">Pagada</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const IncomeView = () => {
    const { payments, clients, orders } = useStore();

    return (
         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-text-secondary uppercase text-xs">
                    <tr>
                        <th className="p-3 font-semibold">Fecha</th><th className="p-3 font-semibold">Cliente</th><th className="p-3 font-semibold">Pedido Nº</th><th className="p-3 font-semibold">Método</th><th className="p-3 font-semibold text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {payments.slice().sort((a: Payment, b: Payment) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).map((p: Payment) => {
                        const client = clients.find((c: Client) => c.id === p.clientId);
                        const order = orders.find((o: Order) => o.id === p.orderId);
                        return (
                        <tr key={p.id}>
                            <td className="p-3">{new Date(p.paymentDate).toLocaleDateString('es-AR')}</td>
                            <td className="p-3 font-semibold">{client?.name || 'N/A'}</td>
                            <td className="p-3">{order?.numericId || '-'}</td>
                            <td className="p-3">{p.method}</td>
                            <td className="p-3 text-right font-bold text-green-600">{formatCurrency(p.amount)}</td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
    );
};

export const FinanceModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FinanceTab>('expenses');

    const TabButton = ({ id, label }: { id: FinanceTab, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 text-sm font-bold rounded-t-lg ${activeTab === id ? 'border-b-2 border-primary text-primary bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="flex space-x-2 -mb-px">
                    <TabButton id="expenses" label="Gastos" />
                    <TabButton id="payable" label="Cuentas por Pagar" />
                    <TabButton id="income" label="Ingresos" />
                </nav>
            </div>

            <div>
                {activeTab === 'expenses' && <ExpensesView />}
                {activeTab === 'payable' && <AccountsPayableView />}
                {activeTab === 'income' && <IncomeView />}
            </div>
        </div>
    );
};