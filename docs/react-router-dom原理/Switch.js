import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Consumer } from "./context";
import pathToReg from "path-to-regexp";
export default class Switch extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <Consumer>
        {state => {
          let pathname = state.location.pathname;
          let children = this.props.children;
          for (var i = 0; i < children.length; i++) {
            let child = children[i];
            // redirect可能没有path
            let path = child.props.path || "";
            let reg = pathToReg(path, [], { end: false });
            // Switch匹配成功了
            if (reg.text(pathname)) {
              return child; // 把匹配到的组件返回即可
            }
          }
          return null;
        }}
      </Consumer>
    );
  }
}
