import { useState } from 'react';
import '../../css/LoginForm.css';
import logo from '../../assets/logotipo.jpeg';
import { showError, showSuccess } from '../../utils/Alerts';
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
        <>

            <div className='container'>
                <div className='row'>
                    <div className='col-md-6'>
                        <form onSubmit={handleSubmit}>
                            <div className='row'>

                                <div className='col-md-12'>
                                    <h2>COMSER TEL S.A de C.V</h2>
                                </div>

                            </div>
                            <br></br>
                            <div className='title'><ion-icon name="lock-closed"></ion-icon>Iniciar Sesión</div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Correo:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="mechanichal.workshop@gmail.com"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Contraseña:</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder=""
                                    required
                                />
                            </div>
                            <button type="submit" className="">INGRESAR</button>
                        </form>

                    </div>
                    <div className='col-md-6 '>
                        <img src={logo} alt="Logotipo" className='logo' />

                    </div>

                </div>


            </div>

            <Modal_default className="modal_custom" show={showModal} onHide={() => setShowModal(false)} title="Cambiar contraseña temporal">
                <form id="form_change_password" onSubmit={sendForm}>



                    <div className="mb-3">
                        <label htmlFor="temp_password" className="form-label">Contraseña temporal <span className="text-danger"> * </span></label>
                        <input type="password" name="temp_password" placeholder="Clave temporal" autoComplete="off" className="form-control custom_input required" id="temp_password" />
                        <div className="form-text"></div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="new_password" className="form-label">Nueva Contraseña <span className="text-danger"> * </span></label>
                        <input type="password" name="new_password" placeholder="Nueva contraseña" autoComplete="off" className="form-control custom_input required" id="new_password" />
                        <div className="form-text"></div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirm_password" className="form-label">Confirmar Contraseña <span className="text-danger"> * </span></label>
                        <input type="password" name="confirm_password" placeholder="Confirmar contraseña" className="form-control custom_input required" id="confirm_password" />
                        <div className="form-text"></div>
                    </div>

                    <button type="submit" style={{ float: 'right', backgroundColor: '#2d2d7f', color: 'white' }} className="btn">Actualizar</button>
                </form>
            </Modal_default>
        </>
    );

}