import React from "react";
import ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { Provider, connect } from "react-redux";
import { createHashHistory } from "history";
import { NAMESPACE_SEP } from "./constant";
import createSagaMiddleware from "redux-saga";
import * as sagaEffects from "redux-saga/effects";
import { Router, Route, Link, routerRedux } from "./router";
import Plugin, { filterHooks } from "./plugin";
export { connect };

let { routerMiddleware, connectRouter } = routerRedux;
export default function(opts = {}) {
  let history = opts.history || createHashHistory();
  let app = {
    _history: history,
    _model: [],
    model,
    _router: null,
    router,
    start
  };
  function model(m) {
    const prefixedModel = prefixNameSpace(m); //先添加命名空间的前缀
    // 把model放到数组中
    app._model.push(prefixedModel);
    return prefixedModel;
  }
  function router(router) {
    // 定义路由
    app._router = router;
  }
  // 此对象用来传给combineReducers合并的，每个属性都是字符串，而且代表合并状态的一个分状态属性
  let initialReducers = {
    // 当页面路径发送变化时，会向仓库派发动作，仓库状态会发送变化 router: {location, action}
    router: connectRouter(app._history)
  };
  let plugin = new Plugin();
  plugin.use(filterHooks(opts));
  app.use = plugin.use.bind(plugin);

  function start(container) {
    for (const model of app._model) {
      // initialReducers={counter1:(state, action) => newState}
      initialReducers[model.namespace] = getReducer(
        model,
        plugin._handleActions
      );
    }
    let rootReducer = createReducer();
    let sagas = getSagas(app);
    let sagaMiddleware = createSagaMiddleware();
    const extraMiddleware = plugin.get("onAction");
    const extraEnhancers = plugin.get("extraEnhancers");

    // applyMiddleware返回的是一个enhancer，增强createStore
    const enhancers = [
      ...extraEnhancers,
      applyMiddleware(
        routerMiddleware(history),
        sagaMiddleware,
        ...extraMiddleware
      )
    ];
    // let store = applyMiddleware(
    //   routerMiddleware(history),
    //   sagaMiddleware,
    //   ...extraMiddleware
    // )(createStore)(rootReducer, opts.initialState);
    let store = createStore(
      rootReducer,
      opts.initialState,
      compose(...enhancers)
    );
    app._store = store;
    let onStateChange = plugin.get("onStateChange");
    store.subscribe(() => {
      onStateChange.forEach(listener => listener(store.getState()));
    });
    // subscriptions
    for (const model of app._model) {
      runSubscription(model.subscriptions);
    }
    sagas.forEach(sagaMiddleware.run); // run就是启动saga执行
    ReactDOM.render(
      <Provider store={app._store}>{app._router({ app, history })}</Provider>,
      document.querySelector(container)
    );

    // 向当前应用插入一个模型
    app.model = injectModel.bind(app);
    function injectModel(m) {
      m = model(m); // 给reducers和effects添加命名空间前缀 添加到app_model里
      initialReducers[m.namespace] = getReducer(m, plugin._handleActions);
      store.replaceReducer(createReducer()); // 新的reducer替换老的reducer,派发默认动作，会让reducer执行，执行完之后给user赋默认值
      if (m.effects) {
        sagaMiddleware.run(getSaga(m.effects, m));
      }
      if (m.subscriptions) {
        runSubscription(m.subscriptions);
      }
    }

    function runSubscription(subscriptions = {}) {
      for (let key in subscriptions) {
        let subscription = subscriptions[key];
        subscription({ history, dispatch: app._store.dispatch }, error => {
          let onError = plugin.get("onError");
          onError.forEach(fn => fn(error));
        });
      }
    }

    function createReducer() {
      const reducerEnhancer = plugin.get("onReducer");
      let extraReducers = plugin.get("extraReducers");
      return reducerEnhancer(
        combineReducers({
          ...initialReducers,
          ...extraReducers
        })
      );
    }
    function getSagas(app) {
      let sagas = [];
      for (const model of app._model) {
        // 把effects对象变成一个saga
        sagas.push(getSaga(model.effects, model, plugin.get("onEffect")));
      }
      return sagas;
    }
    function getSaga(effects, model) {
      return function*() {
        // eg: key=asyncAdd
        for (const key in effects) {
          const watcher = getWatcher(
            key,
            effects[key],
            model,
            plugin.get("onEffect"),
            plugin.get("onError")
          );
          // 调用fork是因为fork可单独开一个进程去执行，而不是阻塞当前saga执行
          const task = yield sagaEffects.fork(watcher);
          yield sagaEffects.fork(function*() {
            yield sagaEffects.take(`${model.namespace}/@@CANCEl_EFFECTS`);
            yield sagaEffects.cancel(task);
          });
        }
      };
    }
  }
  return app;
}

// getReducers函数用法解析
// {
//   counter1: function(state, action) {

//   },
//   counter2: function(state, action) {

//   },
// }
// 就是把model中的reducers对象转成管理自己状态的reducer函数，然后他们会进行合并
// 转换后的reducer函数类似如下:
// function reducer(state = { number: 1 }, action) {
//   if (action.type === 'counter1/add') {
//     return add(state, action);
//   } else if (action.type === 'counter1/minus') {
//     return minus(state, action);
//   } else {
//     return state;
//   }
// }

function getReducer(model, handleActions) {
  let { reducers = {}, state: defaultState } = model;
  let reducer = function(state = defaultState, action) {
    let reducer = reducers[action.type];
    if (reducer) {
      return reducer(state, action);
    }
    return state;
  };
  if (handleActions) {
    return handleActions(reducers, defaultState);
  }
  return reducer;
}

function prefixType(type, model) {
  if (type.indexOf("/") === -1) {
    return `${model.namespace}${NAMESPACE_SEP}${type}`;
  } else {
    if (type.startWith(model.namespace)) {
      console.error(
        `Warning: [sagaEffects.put] ${type} should not be prefixed with namespace ${model.namespace}`
      );
    }
  }
  return type;
}

function getWatcher(key, effect, model, onEffect, onError) {
  function put(action) {
    return sagaEffects.put({ ...action, type: prefixType(action.type, model) });
  }
  return function*() {
    if (onEffect) {
      for (const fn of onEffect) {
        effect = fn(effect, { ...sagaEffects, put }, model, key);
      }
    }
    yield sagaEffects.takeEvery(key, function*(...args) {
      try {
        yield effect(...args, { ...sagaEffects, put });
      } catch (error) {
        onError.forEach(fn => fn(error));
      }
    });
  };
}

// 此方法就是把reducer对象的属性名把add变成counter1/add
function prefix(obj, namespace) {
  return Object.keys(obj).reduce((memo, key) => {
    let newKey = `${namespace}${NAMESPACE_SEP}${key}`;
    memo[newKey] = obj[key];
    return memo;
  }, {});
}

function prefixNameSpace(model) {
  if (model.reducers) {
    model.reducers = prefix(model.reducers, model.namespace);
  }
  if (model.effects) {
    model.effects = prefix(model.effects, model.namespace);
  }
  return model;
}
