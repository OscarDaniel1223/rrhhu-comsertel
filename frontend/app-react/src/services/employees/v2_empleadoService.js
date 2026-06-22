import v2_api from '../v2_api';

export const getEmpleados = async () => {
    const response = await v2_api.get('/empleados');
    return response.data;
};

export const getEmpleadoById = async (id) => {
    const response = await v2_api.get(`/empleados/${id}`);
    return response.data;
};

export const createEmpleado = async (empleadoData) => {
    const response = await v2_api.post('/empleados', empleadoData);
    return response.data;
};

export const updateEmpleado = async (id, empleadoData) => {
    const response = await v2_api.put(`/empleados/${id}`, empleadoData);
    return response.data;
};

export const deleteEmpleado = async (id) => {
    const response = await v2_api.delete(`/empleados/${id}`);
    return response.data;
};

export const programarVacacion = async (id, mesVacaciones) => {
    const response = await v2_api.put(`/empleados/${id}/vacacion-mes`, { mes_vacaciones: mesVacaciones });
    return response.data;
};

export const programarAguinaldo = async (id, fechaAguinaldo) => {
    const response = await v2_api.put(`/empleados/${id}/aguinaldo-fecha`, { fecha_aguinaldo: fechaAguinaldo });
    return response.data;
};
