import React from "react";
import { History, Location, LocationDescriptor } from "../history";
import RouterContext from "./context";
import { ContextValue, Message } from "./";
interface Props {}

interface State {
  location: Location;
}

declare global {
  interface Window {
    onpushstate: (state: any, pathname: string) => void;
  }
}

export default class extends React.Component<Props, State> {
  locationState: any;
  state = {
    location: {
      pathname: "/"
    }
  };
  componentDidMount() {
    window.onpopstate = (event: PopStateEvent) => {
      this.setState({
        location: {
          ...this.state.location,
          pathname: document.location.pathname,
          state: event.state
        }
      });
    };
    window.onpushstate = (state: any, pathname: string) => {
      this.setState({
        location: {
          ...this.state.location,
          pathname,
          state
        }
      });
    };
  }
  render() {
    let that = this;
    let history: History = {
      push(to: LocationDescriptor) {
        if (history.message) {
          let allow = window.confirm(
            history.message(
              typeof to === "object" ? (to as Location) : { pathname: to }
            )
          );
          if (!allow) {
            return;
          }
        }
        if (typeof to === "object") {
          let { pathname, state } = to;
          window.history.pushState(state, null, pathname);
        } else {
          window.history.pushState(null, null, to);
        }
      },
      message: null,
      block(message: Message | null) {
        history.message = message;
      }
    };
    let contextValue: ContextValue = {
      location: this.state.location,
      history
    };
    return (
      <RouterContext.Provider value={contextValue}>
        {this.props.children}
      </RouterContext.Provider>
    );
  }
}
