import axios from 'axios';

// Configurar la instancia de Axios (v2) para el nuevo sistema de planillas
const v2_api = axios.create({
    baseURL: 'http://localhost:3001/api', // Asegúrate de que apunte al puerto de tu backend
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar token si existe
v2_api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta globalmente
v2_api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Lógica para manejar token expirado o no autorizado
            console.error('No autorizado. Token expirado o inválido.');
        }
        return Promise.reject(error);
    }
);

export default v2_api;
