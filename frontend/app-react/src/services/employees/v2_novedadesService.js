import v2_api from '../v2_api';

export const getNovedadesPorFecha = async (fecha) => {
    const response = await v2_api.get('/novedades', {
        params: { fecha }
    });
    return response.data;
};

export const getNovedadesPorRango = async (fecha_inicio, fecha_fin) => {
    const response = await v2_api.get('/novedades', {
        params: { fecha_inicio, fecha_fin }
    });
    return response.data;
};

export const saveNovedadesPorFecha = async (fecha, novedades) => {
    const response = await v2_api.post('/novedades', {
        fecha,
        novedades
    });
    return response.data;
};
