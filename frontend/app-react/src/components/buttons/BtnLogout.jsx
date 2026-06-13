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

        <button
            type="button"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg transition-colors duration-200 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-white dark:border-white dark:hover:bg-white/10 dark:hover:text-white dark:focus:ring-offset-slate-900"
            onClick={logout}
        >
            <i className="bi bi-box-arrow-left text-sm"></i> Cerrar sesión
        </button>
    );

}