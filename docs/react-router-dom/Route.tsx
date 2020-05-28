import React, { ComponentType } from "react";
import RouterContext from "./context";
import { pathToRegexp, Key } from "path-to-regexp";
import { RouteComponentProps, match } from "./";
import { LocationDescriptor } from "../history";
interface RouteProps {
  path?: LocationDescriptor;
  exact?: boolean;
  component?: ComponentType<RouteComponentProps<any>> | ComponentType<any>;
  render?: (props: RouteComponentProps<any>) => React.ReactNode;
  children?: (props: RouteComponentProps<any>) => React.ReactNode;
}

export default class extends React.Component<RouteProps> {
  static contextType = RouterContext;
  render() {
    let {
      path = "/",
      component: RouteComponent,
      exact = false,
      render,
      children
    } = this.props;
    let pathname = this.context.location.pathname;
    let keys: Array<Key> = [];
    let routePath: string = typeof path === "object" ? path.pathname : path;
    let regexp = pathToRegexp(routePath, keys, { end: exact });
    let result: Array<string> = pathname.match(regexp);
    let routeComponentProps: RouteComponentProps<any> = {
      location: this.context.location,
      history: this.context.history
    };
    if (result) {
      let [url, ...values] = result;
      let paramNames = keys.map((key: Key) => key.name);
      let memo: Record<string, any> = {};
      let params = values.reduce(
        (memo: Record<string, any>, value: string, index: number) => {
          memo[paramNames[index]] = value;
          return memo;
        },
        memo
      );
      type Params = typeof params;
      let matchResult: match<Params> = {
        params,
        isExact: url === path,
        path: routePath,
        url
      };
      routeComponentProps.match = matchResult;
      if (RouteComponent) {
        return <RouteComponent {...routeComponentProps} />;
      } else if (render) {
        return render(routeComponentProps);
      } else if (children) {
        return children(routeComponentProps);
      } else {
        return null;
      }
    } else {
      if (children) {
        return children(routeComponentProps);
      } else {
        return null;
      }
    }
  }
}
