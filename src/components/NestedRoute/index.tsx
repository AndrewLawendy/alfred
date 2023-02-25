import { ReactNode } from "react";
import { useRouter, useLocation, Router } from "wouter";

type NestedRouteProps = {
  base: string;
  children: ReactNode;
};

const NestedRoute = (props: NestedRouteProps) => {
  const router = useRouter();
  const [parentLocation] = useLocation();

  const nestedBase = `${router.base}${props.base}`;

  // don't render anything outside of the scope
  if (!parentLocation.startsWith(nestedBase)) return null;

  // we need key to make sure the router will remount when base changed
  return (
    <Router base={nestedBase} key={nestedBase}>
      {props.children}
    </Router>
  );
};

export default NestedRoute;
