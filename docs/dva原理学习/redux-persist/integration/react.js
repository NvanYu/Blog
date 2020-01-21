import React from "react";

/**
* PersistGate: 一个组件，渲染时可以让我们从存储引擎中获取数据并同步到仓库
*/
class PersistGate extends React.Component {
  componentDidMount() {
    this.props.persistor.initState();
  }
  render() {
    return this.props.children;
  }
}

export { PersistGate };
