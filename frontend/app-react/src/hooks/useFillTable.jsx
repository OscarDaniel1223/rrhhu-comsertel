import { useEffect, useState } from "react";

const useFillTable = (dataService, interval = 0) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const getData = async () => {
            const response = await dataService();
            setData(response.data);
        };
        getData();

        const timer = setInterval(() => {
            getData();
        }, interval);

        return () => clearInterval(timer);
    }, [dataService, interval]); // solo intervala

    return data;
}

export default useFillTable;
