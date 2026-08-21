import { useState, useEffect } from 'react';

/**
 * Custom hook for API calls
 */
export const useAPI = (apiCall) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiCall();
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error fetching data');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [apiCall]);

  return { data, loading, error };
};

/**
 * Custom hook for traffic data
 */
export const useTrafficData = (refreshInterval = 5000) => {
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchTrafficData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/intersections');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setTrafficData(data.data);
            setError(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error fetching traffic data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrafficData();
    intervalId = setInterval(fetchTrafficData, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [refreshInterval]);

  return { trafficData, loading, error };
};
