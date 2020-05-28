import React from "react";
import { Route, Link } from "./";
import { LocationDescriptor } from "../history";
interface Props {
  to: LocationDescriptor;
  exact?: boolean;
  children: React.ReactNode;
}

export default (props: Props) => {
  let { to, exact, children } = props;
  return (
    <Route
      path={to}
      exact={exact}
      children={(childrenProps: any) => {
        <Link
          className={childrenProps.match ? "active" : ""}
          to={to}
          {...childrenProps}
        >
          {children}
        </Link>;
      }}
    ></Route>
  );
};
