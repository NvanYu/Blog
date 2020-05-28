import React, { ReactNode } from "react";
import { LocationDescriptor } from "../history";
import RouterContext from "./context";
type Props = React.PropsWithChildren<{
  to: LocationDescriptor;
}>;

export default class extends React.Component<Props> {
  static contextType = RouterContext;
  render(): ReactNode {
    this.context.history.push(this.props.to);
    return null;
  }
}
