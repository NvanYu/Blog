import React from "react";
import { Route, RouteComponentProps } from "./";
export default function<P>(OldComponent: React.ComponentType<P>) {
  return (props: P) => (
    <Route
      render={(routeProps: RouteComponentProps) => (
        <OldComponent {...props} {...routeProps} />
      )}
    />
  );
}
