import axios from "axios";

const getUserRegister = async () => {
    const response = await axios.get("http://localhost:3001/api/getRegisterUsers");
    return response;
};

const getClientRegister = async () => {
    const response = await axios.get("http://localhost:3001/api/getRegisterClients");
    return response;
};

const getVentasMes = async () => {
    const response = await axios.get("http://localhost:3001/api/getVentasMes");
    return response;
};

const getDailySales = async () => {
    const response = await axios.get("http://localhost:3001/api/getDailySales");
    return response;
};

const getVentasMesAnterior = async () => {
    const response = await axios.get("http://localhost:3001/api/getVentasMesAnterior");
    return response;
};

export { getUserRegister, getClientRegister, getVentasMes, getDailySales, getVentasMesAnterior };