import { useEffect, useState } from "react";

import { localDate } from "utils/laundry";

// Today's local date, kept fresh: an installed app can sit in the background
// overnight and come back without anything else re-rendering
const useToday = () => {
  const [today, setToday] = useState(localDate);

  useEffect(() => {
    const refresh = () => setToday(localDate());
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return today;
};

export default useToday;
