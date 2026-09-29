import { useEffect } from "react";
import { Redirect } from "wouter";
import useAuth from "hooks/useAuth";
import { refreshDevice } from "utils/reminders";

type AuthorizedProps = {
  children: React.ReactNode;
};

const Authorized = ({ children }: AuthorizedProps) => {
  const [user, isLoading] = useAuth();

  // Once per sign-in: keep this phone's reminder address current
  const uid = user?.uid;
  useEffect(() => {
    if (uid) refreshDevice().catch(() => undefined);
  }, [uid]);

  if (!isLoading) {
    if (user) return <>{children}</>;

    return <Redirect to="/login" replace />;
  }

  return null;
};

export default Authorized;
