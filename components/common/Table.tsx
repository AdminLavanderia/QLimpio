import React from 'react';
import { EditIcon, TrashIcon } from '../icons';

interface TableProps {
    headers: string[];
    children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                    <tr>
                        {headers.map(header => (
                            <th key={header} scope="col" className="px-6 py-3">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
};

interface TableRowProps {
    children: React.ReactNode;
    onEdit: () => void;
    // onDelete: () => void; // Maybe later
}

export const TableRow: React.FC<TableRowProps> = ({ children, onEdit }) => {
    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            {children}
            <td className="px-6 py-4 text-right">
                <button onClick={onEdit} className="font-medium text-primary hover:underline">
                    <EditIcon />
                </button>
            </td>
        </tr>
    );
};

export const TableCell = ({ children }: { children: React.ReactNode }) => (
    <td className="px-6 py-4 text-text-main font-medium">
        {children}
    </td>
);