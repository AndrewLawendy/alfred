import { useState, useEffect } from "react";

const useFetch = <T>(request: () => Promise<T>) => {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    setIsLoading(true);

    request()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { isLoading, data, error };
};

export default useFetch;
