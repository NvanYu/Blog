import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Consumer } from "./context";
export default class Redirect extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <Consumer>
        {// 重定向就是匹配不到后直接跳到redirect中的to路径
        state => {
          state.history.push(this.props.to);
          return null;
        }}
      </Consumer>
    );
  }
}
