import React, { useState } from 'react';
import { actions } from '../services/store';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = actions.login(username, password);
        if (!success) {
            setError('Usuario o contraseña incorrectos.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-light">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-display font-bold text-primary">Q' Limpio</h1>
                    <p className="mt-2 text-text-secondary">Gestión de Lavandería</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    {error && <p className="text-sm text-center text-status-red">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Ingresar
                        </button>
                    </div>
                </form>
                 <p className="mt-4 text-xs text-center text-gray-400">
                    Usuarios de prueba:<br/>
                    Admin: <strong>juan.perez</strong> / pass: <strong>password</strong><br/>
                    Empleado: <strong>maria.gomez</strong> / pass: <strong>password</strong>
                </p>
            </div>
        </div>
    );
};