import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";


export default function BtnLogout() {

    const navigate = useNavigate();
    const logout = () => {
        Swal.fire({
            icon: 'question',
            title: 'Cerrar sesión',
            text: '¿Estás seguro de que quieres cerrar sesión?',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                navigate('/');
            }
        });

    };

    return (

        <button type="button" className="btn btn-outline-primary  w-100" onClick={logout}   > <i className="bi bi-box-arrow-left"></i> Cerrar sesion</button>
    );

}