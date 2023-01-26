import { Redirect } from "wouter";
import useAuth from "hooks/useAuth";

type AuthorizedProps = {
  children: React.ReactNode;
};

const Authorized = ({ children }: AuthorizedProps) => {
  const [user, isLoading] = useAuth();

  if (!isLoading) {
    if (user) return <>{children}</>;

    return <Redirect to="/login" replace />;
  }

  return null;
};

export default Authorized;
