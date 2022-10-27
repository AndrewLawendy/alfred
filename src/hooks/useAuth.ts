import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "utils/firebase";

const useAuth = () => {
  return useAuthState(auth);
};

export default useAuth;
