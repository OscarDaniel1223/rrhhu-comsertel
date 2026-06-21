import v2_api from '../v2_api';

export const getCargos = async () => {
    const response = await v2_api.get('/cargos');
    return response.data;
};

export const createCargo = async (data) => {
    const response = await v2_api.post('/cargos', data);
    return response.data;
};

export const updateCargo = async (id, data) => {
    const response = await v2_api.put(`/cargos/${id}`, data);
    return response.data;
};

export const deleteCargo = async (id) => {
    const response = await v2_api.delete(`/cargos/${id}`);
    return response.data;
};
