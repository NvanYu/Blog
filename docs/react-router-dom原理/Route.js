import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Consumer } from "./context";
import pathToReg from "path-to-regexp";
export default class HashRouter extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Consumer>
        {state => {
          // path是route中传递的
          let { path, component: Component, exact = false } = this.props;
          // pathname是locaion中传递的
          let pathname = state.location.pathname;
          // 根据path实现一个正则，通过正则匹配  path-to-regexp包
          let keys = [];
          let reg = pathToReg(path, keys, { end: exact });
          keys = keys.map(item => item.name); //[id, name]
          let result = pathname.match(reg);
          let [url, ...values] = result || []; //[1,2]
          let props = {
            location: state.location,
            history: state.history,
            match: {
              params: keys.reduce((obj, current, idx) => {
                obj[current] = values[idx];
                return obj;
              }, {})
            }
          };
          if (result) {
            return <Component {...props}></Component>;
          }
          return null;
        }}
      </Consumer>
    );
  }
}
