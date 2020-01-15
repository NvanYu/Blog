import React from "react";

class PersistGate extends React.Component {
  componentDidMount() {
    this.props.persistor.initState();
  }
  render() {
    return this.props.children;
  }
}

export { PersistGate };
