

import React from 'react';
import { PackageIcon } from './icons';

interface PlaceholderProps {
    title: string;
    description: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({ title, description }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-lg shadow-sm p-8">
            <div className="text-primary mb-4">
                <PackageIcon className="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold font-display text-text-main">{title}</h2>
            <p className="mt-2 max-w-md text-text-secondary">{description}</p>
        </div>
    );
};