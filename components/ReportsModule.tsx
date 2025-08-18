
import React, { useState, useMemo } from 'react';
import { useStore, actions } from '../services/store';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ReportIcon, DollarSignIcon, BasketIcon, ClientsIcon, InventoryIcon, EmployeesIcon, ChevronLeftIcon, TrendingUpIcon } from './icons';
import { PaymentMethod, TopClient, KpiReportData, Payment, Expense, AccountPayable, ExpenseByCategory, EmployeePerformance, SupplyUsage, KpiCycleTime } from '../types';

// --- Helper Functions & Constants ---
const formatCurrency = (value: number) => value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
const COLORS = ['#4A90E2', '#F5A623', '#2ECC71', '#E74C3C', '#9B59B6', '#34495E', '#1ABC9C', '#3498DB', '#F1C40F'];
const today = new Date().toISOString().split('T')[0];
const lastWeekStart = new Date();
lastWeekStart.setDate(lastWeekStart.getDate() - 7);
const lastMonthStart = new Date();
lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);


// --- Generic Components ---
const ReportCard = ({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) => (
    <div onClick={onClick} className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-start cursor-pointer transition-transform transform hover:-translate-y-1 hover:shadow-md">
        <div className="w-10 h-10 text-primary">{icon}</div>
        <h3 className="text-lg font-bold font-display text-text-main mt-4">{title}</h3>
        <p className="text-sm text-text-secondary mt-1 flex-1">{description}</p>
        <span className="mt-4 text-sm font-bold text-primary">Ver Reporte →</span>
    </div>
);

const DateRangeFilter = ({ range, setRange }: { range: { start: string, end: string }, setRange: (r: { start: string, end: string }) => void }) => (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
            <label htmlFor="startDate">Desde:</label>
            <input type="date" id="startDate" value={range.start} onChange={e => setRange({ ...range, start: e.target.value })} className="p-2 border rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="endDate">Hasta:</label>
            <input type="date" id="endDate" value={range.end} onChange={e => setRange({ ...range, end: e.target.value })} className="p-2 border rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setRange({ start: lastWeekStart.toISOString().split('T')[0], end: today })} className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300">Últimos 7 días</button>
            <button onClick={() => setRange({ start: lastMonthStart.toISOString().split('T')[0], end: today })} className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300">Últimos 30 días</button>
        </div>
    </div>
);


// --- Individual Report Components ---

const ExpensesByCategoryReport = ({ range }: { range: { start: string, end: string }}) => {
    const data = useMemo(() => actions.generateExpenseByCategory(range.start, range.end), [range]);
    const totalExpenses = data.reduce((sum: number, item: ExpenseByCategory) => sum + item.amount, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-bold mb-2">Total de Gastos</h4>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                <hr className="my-4"/>
                <h4 className="font-bold mb-2">Desglose</h4>
                 <ul className="space-y-2">
                    {data.map((item: ExpenseByCategory, index: number) => (
                        <li key={item.category} className="flex justify-between items-center text-sm">
                            <span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>{item.category}</span>
                            <span className="font-semibold">{formatCurrency(item.amount)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                            return <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>;
                        }}>
                            {data.map((entry: ExpenseByCategory, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const EmployeePerformanceReport = ({ range }: { range: { start: string, end: string }}) => {
    const data = useMemo(() => actions.generateEmployeePerformance(range.start, range.end), [range]);
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                    <tr><th className="px-6 py-3">Empleado</th><th className="px-6 py-3 text-right">Tareas Completadas</th></tr>
                </thead>
                <tbody>
                    {data.map((emp: EmployeePerformance) => (
                        <tr key={emp.employeeId} className="border-b">
                            <td className="px-6 py-4 font-semibold">{emp.employeeName}</td>
                            <td className="px-6 py-4 text-right font-bold text-lg">{emp.tasksCompleted}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    );
};

const SupplyUsageReport = ({ range }: { range: { start: string, end: string }}) => {
    const data = useMemo(() => actions.generateSupplyUsage(range.start, range.end), [range]);
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                    <tr><th className="px-6 py-3">Insumo</th><th className="px-6 py-3 text-right">Cantidad Consumida</th></tr>
                </thead>
                <tbody>
                    {data.map((sup: SupplyUsage) => (
                        <tr key={sup.supplyId} className="border-b">
                            <td className="px-6 py-4 font-semibold">{sup.supplyName}</td>
                            <td className="px-6 py-4 text-right font-bold">{sup.quantityUsed.toFixed(2)} {sup.unit}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    );
};

const TopClientsReport = ({ range }: { range: { start: string, end: string }}) => {
    const [sortBy, setSortBy] = useState<'orderCount' | 'totalSpent'>('totalSpent');
    const data = useMemo(() => {
        const clients = actions.generateTopClients(range.start, range.end);
        return clients.sort((a: TopClient, b: TopClient) => b[sortBy] - a[sortBy]);
    }, [range, sortBy]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-end gap-2 mb-4">
                <button onClick={() => setSortBy('orderCount')} className={`px-3 py-1 text-sm rounded-full ${sortBy === 'orderCount' ? 'bg-primary text-white' : 'bg-gray-200'}`}>Por Nº Pedidos</button>
                <button onClick={() => setSortBy('totalSpent')} className={`px-3 py-1 text-sm rounded-full ${sortBy === 'totalSpent' ? 'bg-primary text-white' : 'bg-gray-200'}`}>Por Monto Gastado</button>
            </div>
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                    <tr><th className="px-6 py-3">Cliente</th><th className="px-6 py-3 text-right">Pedidos</th><th className="px-6 py-3 text-right">Monto Total</th></tr>
                </thead>
                <tbody>
                    {data.map((client: TopClient) => (
                        <tr key={client.clientId} className="border-b">
                            <td className="px-6 py-4 font-semibold">{client.clientName}</td>
                            <td className="px-6 py-4 text-right font-bold">{client.orderCount}</td>
                            <td className="px-6 py-4 text-right font-bold">{formatCurrency(client.totalSpent)}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    );
};

const KpiReportView = ({ range }: { range: { start: string, end: string }}) => {
    const data = useMemo(() => actions.generateKpiReport(range.start, range.end), [range]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-sm font-semibold text-text-secondary">Tasa de Entrega a Tiempo</p>
                    <p className="text-4xl font-bold text-status-green mt-2">{data.onTimeDeliveryRate.toFixed(1)}%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-sm font-semibold text-text-secondary">Tasa de Cliente Recurrente</p>
                    <p className="text-4xl font-bold text-primary mt-2">{data.loyalty.recurrentCustomerRate.toFixed(1)}%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-sm font-semibold text-text-secondary">Pedidos Promedio por Cliente</p>
                    <p className="text-4xl font-bold text-accent mt-2">{data.loyalty.avgOrdersPerCustomer.toFixed(1)}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-4">Tiempo Medio de Ciclo por Servicio</h3>
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Servicio</th>
                            <th className="px-6 py-3 text-right">Tiempo Promedio (Horas)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.cycleTimes.map((ct: KpiCycleTime) => (
                            <tr key={ct.serviceName} className="border-b">
                                <td className="px-6 py-4 font-semibold">{ct.serviceName}</td>
                                <td className="px-6 py-4 text-right font-bold">{ct.avgHours}</td>
                            </tr>
                        ))}
                         {data.cycleTimes.length === 0 && (
                            <tr>
                                <td colSpan={2} className="text-center p-8 text-gray-500">No hay datos de ciclos completados para este período.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main Component ---
export const ReportsModule = () => {
    const [activeReport, setActiveReport] = useState<string>('hub');
    const [dateRange, setDateRange] = useState({ start: lastMonthStart.toISOString().split('T')[0], end: today });
    
    const { payments, expenses, accountsPayable } = useStore();

    const cashClosingData = useMemo(() => {
        const dailyPayments = payments.filter((p: Payment) => p.paymentDate.startsWith(dateRange.end));
        const summary = dailyPayments.reduce((acc: Record<string, number>, p: Payment) => {
            acc[p.method] = (acc[p.method] || 0) + p.amount;
            return acc;
        }, {} as Record<PaymentMethod, number>);
        const total = dailyPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
        return { summary, total };
    }, [payments, dateRange.end]);

    const monthlyBalanceData = useMemo(() => {
        const balanceMonth = dateRange.end.slice(0, 7);
        const totalIncome = payments
            .filter((p: Payment) => p.paymentDate.startsWith(balanceMonth))
            .reduce((sum: number, p: Payment) => sum + p.amount, 0);

        const oneOffExpenses = expenses
            .filter((e: Expense) => !e.installmentsInfo && e.date.startsWith(balanceMonth))
            .reduce((sum: number, e: Expense) => sum + e.amount, 0);

        const paidInstallments = accountsPayable
            .filter((ap: AccountPayable) => ap.status === 'pagada' && ap.paymentDate?.startsWith(balanceMonth))
            .reduce((sum: number, ap: AccountPayable) => sum + ap.amount, 0);
            
        const totalExpenses = oneOffExpenses + paidInstallments;

        return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
    }, [payments, expenses, accountsPayable, dateRange.end]);


    const renderContent = () => {
        if (activeReport === 'hub') {
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ReportCard icon={<DollarSignIcon />} title="Balance Mensual" description="Analiza ingresos vs. egresos para entender la rentabilidad de tu negocio mes a mes." onClick={() => setActiveReport('monthlyBalance')} />
                    <ReportCard icon={<BasketIcon />} title="Cierre de Caja Diario" description="Genera un resumen de los ingresos de un día específico, desglosado por método de pago." onClick={() => setActiveReport('cashClosing')} />
                    <ReportCard icon={<PieChart />} title="Gastos por Categoría" description="Visualiza tus gastos agrupados por categoría para identificar dónde se concentran los costos." onClick={() => setActiveReport('expensesByCategory')} />
                    <ReportCard icon={<EmployeesIcon />} title="Rendimiento de Empleados" description="Mide la productividad del equipo basándote en la cantidad de tareas completadas." onClick={() => setActiveReport('employeePerformance')} />
                    <ReportCard icon={<InventoryIcon />} title="Uso de Insumos" description="Calcula el consumo real de insumos en los pedidos para optimizar las compras y el stock." onClick={() => setActiveReport('supplyUsage')} />
                    <ReportCard icon={<ClientsIcon />} title="Top Clientes" description="Identifica a tus clientes más valiosos por frecuencia o monto gastado para fidelizarlos." onClick={() => setActiveReport('topClients')} />
                    <ReportCard icon={<TrendingUpIcon />} title="Indicadores Clave (KPIs)" description="Mide eficiencia, calidad y lealtad con métricas para la toma de decisiones estratégicas." onClick={() => setActiveReport('kpi')} />
                </div>
            );
        }

        const reportTitleMap: { [key: string]: string } = {
            monthlyBalance: 'Balance Mensual',
            cashClosing: 'Cierre de Caja Diario',
            expensesByCategory: 'Gastos por Categoría',
            employeePerformance: 'Rendimiento de Empleados',
            supplyUsage: 'Uso de Insumos',
            topClients: 'Top Clientes',
            kpi: 'Indicadores Clave de Rendimiento (KPIs)',
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveReport('hub')} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"><ChevronLeftIcon /></button>
                    <h2 className="text-2xl font-bold font-display">{reportTitleMap[activeReport]}</h2>
                </div>

                {activeReport !== 'monthlyBalance' && activeReport !== 'cashClosing' && <DateRangeFilter range={dateRange} setRange={setDateRange} />}
                
                {activeReport === 'monthlyBalance' && 
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <label htmlFor="balanceMonth" className="font-bold">Balance para el mes:</label>
                            <input type="month" id="balanceMonth" value={dateRange.end.slice(0, 7)} onChange={e => setDateRange({ ...dateRange, end: e.target.value + '-01' })} className="p-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm font-semibold text-green-800">Total Ingresos</p><p className="text-2xl font-bold text-green-700">{formatCurrency(monthlyBalanceData.totalIncome)}</p></div>
                            <div className="p-4 bg-red-50 rounded-lg"><p className="text-sm font-semibold text-red-800">Total Egresos</p><p className="text-2xl font-bold text-red-700">{formatCurrency(monthlyBalanceData.totalExpenses)}</p></div>
                            <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm font-semibold text-blue-800">Balance Final</p><p className="text-2xl font-bold text-blue-700">{formatCurrency(monthlyBalanceData.balance)}</p></div>
                        </div>
                    </div>
                }

                {activeReport === 'cashClosing' && 
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <label htmlFor="closingDate" className="font-bold">Cierre para el día:</label>
                            <input type="date" id="closingDate" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="p-2 border rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            {Object.entries(cashClosingData.summary).map(([method, amount]) => (
                                <div key={method} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">{method}</span>
                                    <span className="font-bold">{formatCurrency(amount as number)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between p-4 mt-4 bg-primary text-white rounded-lg text-lg">
                            <span className="font-bold">TOTAL INGRESOS</span>
                            <span className="font-bold">{formatCurrency(cashClosingData.total)}</span>
                        </div>
                    </div>
                }

                {activeReport === 'expensesByCategory' && <ExpensesByCategoryReport range={dateRange} />}
                {activeReport === 'employeePerformance' && <EmployeePerformanceReport range={dateRange} />}
                {activeReport === 'supplyUsage' && <SupplyUsageReport range={dateRange} />}
                {activeReport === 'topClients' && <TopClientsReport range={dateRange} />}
                {activeReport === 'kpi' && <KpiReportView range={dateRange} />}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderContent()}
        </div>
    );
};