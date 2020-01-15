const hooks = [
  "onEffect", // 用来增强effect
  "extraReducers", // 添加额外的reducers
  "onAction",
  "onStateChange",
  "onReducer",
  "extraEnhancers",
  "_handleActions",
  "onError"
];

// 把不是hook的属性去掉
export function filterHooks(options) {
  return Object.keys(options).reduce((memo, key) => {
    if (hooks.indexOf(key) > -1) {
      memo[key] = options[key];
    }
    return memo;
  }, {});
}

export default class Plugin {
  constructor() {
    // this.hooks = {onEffect: [], extractReducers: []}
    this.hooks = hooks.reduce((memo, key) => {
      memo[key] = [];
      return memo;
    }, {});
  }
  // 插件就是一个对象，它的属性就是钩子函数
  // use接收钩子函数，然后缓存在当前实例hooks实例上
  use(plugin) {
    const { hooks } = this;
    for (let key in plugin) {
      if (key === "extraEnhancers") {
        hooks[key] = plugin[key];
      } else if (key === "_handleActions") {
        this._handleActions = plugin[key];
      } else {
        hooks[key].push(plugin[key]);
      }
    }
  }
  get(key) {
    // extraReducers
    const { hooks } = this;
    if (key === "extraReducers") {
      return getExtraReducers(hooks[key]);
    } else if (key === "onReducer") {
      return getOnReducer(hooks[key]);
    } else {
      return hooks[key];
    }
  }
}

function getOnReducer(hook) {
  return function(reducer) {
    for (const reducerEnhancer of hook) {
      reducer = reducerEnhancer(reducer);
    }
    return reducer;
  };
}

function getExtraReducers(hook) {
  let ret = {};
  for (let reducerObject of hook) {
    ret = { ...ret, ...reducerObject };
  }
  return ret;
}
