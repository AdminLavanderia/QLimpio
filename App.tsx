import React, { useEffect } from 'react';
import { useStore, actions } from './services/store';
import { Login } from './components/Login';
import { MainLayout } from './components/MainLayout';

const App: React.FC = () => {
    const { currentUser, isLoading } = useStore();

    useEffect(() => {
        // Initial data load from Firestore
        actions.init();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light flex-col">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-primary">Cargando datos desde la nube...</h2>
                <p className="text-sm text-text-secondary mt-2">Conectando con Firebase</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Login />;
    }

    return <MainLayout />;
};

export default App;