import React, { ReactElement } from "react";
import RouterContext from "./context";
import { pathToRegexp, Key } from "path-to-regexp";
interface Props {
  children: Array<ReactElement>;
}
export default class extends React.Component<Props> {
  static contextType = RouterContext;
  render() {
    let pathname = this.context.location.pathname;
    if (this.props.children) {
      for (let i = 0; i < this.props.children.length; i++) {
        let child: ReactElement = children[i];
        let {
          path = "/",
          exact = false,
          component: RouteComponent
        } = child.props;
        let keys: Array<Key> = [];
        let regexp = pathToRegexp(path, keys, { end: exact });
        let result = pathname.match(regexp);
        if (result) {
          return child;
        }
      }
    }
    return null;
  }
}
