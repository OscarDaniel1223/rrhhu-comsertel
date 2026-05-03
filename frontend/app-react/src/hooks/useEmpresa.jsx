import { useEffect, useState } from "react";

const useEmpresa = (dataService) => {
    const [empresa, setEmpresa] = useState({});
    useEffect(() => {
        const fetchEmpresa = async () => {
            const empresa = await dataService();
            setEmpresa(empresa.data[0]);
        };
        fetchEmpresa();
    }, [dataService]);
    return empresa;
};

export default useEmpresa;