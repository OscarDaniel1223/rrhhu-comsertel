import { useEffect, useState } from "react";

const useInfoStats = (dataService) => {
    const [infoStats, setInfoStats] = useState({});
    useEffect(() => {
        const fetchInfoStats = async () => {
            const infoStats = await dataService();
            setInfoStats(infoStats.data[0]);
        };
        fetchInfoStats();
    }, [dataService]);
    return infoStats;
};

export default useInfoStats;