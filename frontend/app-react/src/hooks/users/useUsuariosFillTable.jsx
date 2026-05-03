import { useEffect, useState } from "react";

const useUsuariosFillTable = (dataService, params) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const getData = async () => {
            const response = await dataService(params);
            setData(response.data);
        };
        getData();

        if (params) {
            getData();
        }



    }, [params]);
    return data;
}

export default useUsuariosFillTable;
