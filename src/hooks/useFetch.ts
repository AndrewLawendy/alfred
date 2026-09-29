import { useState, useEffect } from "react";

const useFetch = <T>(request: () => Promise<T>) => {
  const [data, setData] = useState<T>();
  // The request starts on mount, so it's loading from the first render
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    request()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { isLoading, data, error };
};

export default useFetch;
