import React from "react";
import dva, { connect } from "dva";
import { Router, Route } from "dva/router";
import { createLogger } from "redux-logger";
import keymaster from "keymaster";

let app = dva({
  // 使用中间件
  onAction: createLogger()
});

const delay = ms =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

// combineReducer
// state = {
//   counter1: { number: 0 },
//   counter2: { number: 0 }
// }

// 定义模型
app.model({
  namespace: "counter1",
  state: { number: 0 },
  reducers: {
    // 属性名就是一个action-type,值就是一个函数，用来计算新状态的
    // store.dispatch({type: 'counter1/add'})
    add(state) {
      return { number: state.number + 1 };
    },
    minus(state) {
      return { number: state.number - 1 };
    },
    log(state) {
      // 如果reducers和effects有相同的dispatch的函数，先执行reducers中的，因为effects中是异步的
      console.log("reducer log");
    }
  },
  // 如果想实现异步操作，用effects
  effects: {
    *asyncAdd(action, { put, call }) {
      yield call(delay, 1000);
      // 不能使用自己的前缀 put({type: 'counter1/add'})是错的
      // 但是其他命名空间的前缀是可以的put({ type: 'counter2/add' })
      // 这里不用加前缀即可
      yield put({ type: "add" });
    },
    *log(action, { select }) {
      let state = yield select(state => state.counter1);
      console.log("effect log", state);
    }
  },
  subscriptions: {
    // 当路由变化时改变title
    changeTitle({ history }) {
      history.listen(location => {
        console.log("location");
        document.title = location.pathname;
      });
    },
    // 监听键盘事件
    keyboard({ dispatch }) {
      keymaster("space", () => {
        dispatch({ type: "add" });
      });
    }
  }
});

app.model({
  namespace: "counter2",
  state: { number: 0 },
  reducers: {
    // store.dispatch({type: 'counter2/add'})
    add(state) {
      return { number: state.number + 1 };
    },
    minus(state) {
      return { number: state.number - 1 };
    }
  }
});

function Counter1(props) {
  return (
    <div>
      <p>{props.name}</p>
      <button onClick={() => props.dispatch({ type: "counter1/add" })}>
        +
      </button>
      <button onClick={() => props.dispatch({ type: "counter1/asyncAdd" })}>
        asyncAdd
      </button>
      <button onClick={() => props.dispatch({ type: "counter1/minus" })}>
        -
      </button>
    </div>
  );
}
let ConnectCounter1 = connect(state => state.counter1)(Counter1);

function Counter2(props) {
  return (
    <div>
      <p>{props.name}</p>
      <button onClick={() => props.dispatch({ type: "counter2/add" })}>
        +
      </button>
      <button onClick={() => props.dispatch({ type: "counter2/minus" })}>
        -
      </button>
    </div>
  );
}
let ConnectCounter1 = connect(state => state.counter2)(Counter2);
app.router(({ history }) => (
  <Router history={history}>
    <>
      <Route path="/counter1" component={ConnectCounter1} />
      <Route path="/counter2" component={ConnectCounter2} />
    </>
  </Router>
));
app.start("#root");
