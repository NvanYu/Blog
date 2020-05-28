import React from "react";
import { LocationDescriptor } from "../history";
import RouterContext from "./context";
type LinkProps = React.PropsWithChildren<{
  to: LocationDescriptor;
}>;

export default class extends React.Component<LinkProps> {
  static contextType = RouterContext;
  render() {
    return (
      <a {...this.props} onClick={this.context.history.push(to)}>
        {this.props.children}
      </a>
    );
  }
}
