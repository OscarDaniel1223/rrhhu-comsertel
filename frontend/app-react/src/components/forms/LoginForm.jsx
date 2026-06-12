import { useState } from 'react';
import logo from '../../assets/comsertel-banner.png';
import { showError, showSuccess } from '../../utils/alerts';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth/authService';
import { useAuth } from "../../providers/AuthContext";

import Modal_default from '../modal/Modal_default';
import { changePassword } from '../../services/auth/authService';

export default function LoginForm() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            showError('Por favor, completa todos los campos.');
            return;
        }
        try {
            const data = await login(email, password);

            if (data.cambio_pass === 0) {
                loginUser(data.token, data.rol, data.id, data.name, data.cambio_pass);
                await setShowModal(true);
            } else {
                loginUser(data.token, data.rol, data.id, data.name, data.cambio_pass);
                await showSuccess(data.message || 'Bienvenido.');
                navigate('/dashboard');
            }

        } catch (err) {
            if (err.response) {
                showError(err.response.data.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.');
            }
        }
    };

    const sendForm = async (e) => {
        e.preventDefault();
        const temp_password = document.getElementById('temp_password').value.trim();
        const new_password = document.getElementById('new_password').value.trim();
        const confirm_password = document.getElementById('confirm_password').value.trim();
        const id = localStorage.getItem('id');
        alert(id);
        if (!new_password || !confirm_password) {
            showError('Por favor, completa todos los campos.');
            return;
        }
        if (new_password !== confirm_password) {
            showError('Las contraseñas no coinciden.');
            return;
        }

        try {
            const data = await changePassword(temp_password, new_password, id);
            if (data.status === 200) {
                await showSuccess(data.message || 'Contraseña actualizada correctamente.');
                setShowModal(false);
            } else {
                await showError(data.message || 'Error al actualizar la contraseña.');
            }
        } catch (err) {
            if (err.response) {
                showError(err.response.data.message || 'Error al cambiar la contraseña.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-200">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-200">
                <div className="flex flex-col md:flex-row">
                    
                    {/* Sección del Formulario */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        <div className="text-center md:text-left mb-8">
                            <h2 className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 tracking-tight">
                                COMSERTEL S.A de C.V
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                Sistema de Gestión de Recursos Humanos
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <i className="bi bi-lock-fill text-blue-600 dark:text-blue-400"></i>
                                <span>Iniciar Sesión</span>
                            </div>
                            
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Correo Electrónico:
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@gmail.com"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Contraseña:
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            >
                                INGRESAR
                            </button>
                        </form>
                    </div>
                    
                    {/* Sección de la Imagen de Marca */}
                    <div className="hidden md:flex md:w-1/2 bg-blue-50 dark:bg-slate-950 items-center justify-center p-12 border-l border-slate-100 dark:border-slate-800">
                        <img 
                            src={logo} 
                            alt="Logotipo" 
                            className="w-full h-auto max-h-[350px] object-contain transform hover:scale-105 transition-transform duration-300" 
                        />
                    </div>
                    
                </div>
            </div>
            
            <Modal_default className="modal_custom" show={showModal} onHide={() => setShowModal(false)} title="Cambiar contraseña temporal">
                <form id="form_change_password" onSubmit={sendForm} className="space-y-4">
                    <div>
                        <label htmlFor="temp_password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Contraseña temporal <span className="text-red-500"> * </span>
                        </label>
                        <input 
                            type="password" 
                            name="temp_password" 
                            placeholder="Clave temporal" 
                            autoComplete="off" 
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
                            id="temp_password" 
                        />
                    </div>
                    <div>
                        <label htmlFor="new_password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Nueva Contraseña <span className="text-red-500"> * </span>
                        </label>
                        <input 
                            type="password" 
                            name="new_password" 
                            placeholder="Nueva contraseña" 
                            autoComplete="off" 
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
                            id="new_password" 
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm_password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Confirmar Contraseña <span className="text-red-500"> * </span>
                        </label>
                        <input 
                            type="password" 
                            name="confirm_password" 
                            placeholder="Confirmar contraseña" 
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
                            id="confirm_password" 
                        />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors duration-200"
                        >
                            Actualizar
                        </button>
                    </div>
                </form>
            </Modal_default>
        </div>
    );
}