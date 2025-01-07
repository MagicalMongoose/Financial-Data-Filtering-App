// Writen by Claude 3.5 Sonnet

import { useState, useEffect } from 'react';

function useAPI(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    const fetchData = async () => {
        try {
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
        setLoading(false);
        } catch (err) {
        setError(err.message);
        setLoading(false);
        }
    };

    fetchData();
    }, [url]);

    return { data, loading, error };
}

export default useAPI;