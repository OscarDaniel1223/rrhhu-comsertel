import v2_api from '../v2_api';

export const getAusenciasIncapacidades = async (idEmpleado = null) => {
    const url = idEmpleado ? `/ausencias-incapacidades?id_empleado=${idEmpleado}` : '/ausencias-incapacidades';
    const response = await v2_api.get(url);
    return response.data;
};

export const getAusenciaIncapacidadById = async (id) => {
    const response = await v2_api.get(`/ausencias-incapacidades/${id}`);
    return response.data;
};

export const createAusenciaIncapacidad = async (ausenciaData) => {
    const response = await v2_api.post('/ausencias-incapacidades', ausenciaData);
    return response.data;
};

export const updateAusenciaIncapacidad = async (id, ausenciaData) => {
    const response = await v2_api.put(`/ausencias-incapacidades/${id}`, ausenciaData);
    return response.data;
};

export const deleteAusenciaIncapacidad = async (id) => {
    const response = await v2_api.delete(`/ausencias-incapacidades/${id}`);
    return response.data;
};
