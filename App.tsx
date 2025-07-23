import React from 'react';
import { useStore } from './services/store';
import { Login } from './components/Login';
import { MainLayout } from './components/MainLayout';

const App: React.FC = () => {
    const { currentUser } = useStore();

    if (!currentUser) {
        return <Login />;
    }

    return <MainLayout />;
};

export default App;