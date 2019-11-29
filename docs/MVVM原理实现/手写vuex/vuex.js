let Vue;    // vue的构造函数

const forEach = (obj) => {
  Object.keys(obj).forEach(key => {
    callback(key, obj[key]);
  })
}

class ModuleCollection {
  constructor(options) {
    this.reigster([], options);
  }
  reigster(path, rootModule) {
    let newModule = {
      _raw: rootModule,
      _children: {},
      state: rootModule.state
    }
    if(path.length === 0) {
      this.root = newModule;
    } else {
      let parent = path.slice(0,-1).reduce((root, current) => {
        return this.root._children[current];
      }, this.root);
      parent._root._children[path[path.length - 1]] = newModule;
    }
    if(rootModule.modules) {
      forEach(rootModule.modules, (moduleName, module) => {
        this.reigster(path.concat(moduleName), module)
      })
    }
  }
}

// 需要在递归时 将结果挂载在 getters mutations actions
const installModule = (store, state, path, rootModule) => {
  if(path.length > 0) {  // 把子模块放到父模块上
    let parent = path.slice(0,-1).reduce((state, current) => {
      return state[current];
    },state);
    Vue.set(parent, path[path.length - 1], rootModule.state);
  }
  // 需要先处理根模块的 getters 属性
  let getters = rootModule._raw.getters;
  if(getters) {   // 给 store 添加了 getters 属性
    forEach(getters, (getterName, fn) => {
      Object.defineProperty(store.getters, getterName, {
        get:() => {
          return fn(rootModule.state);
        }
      })
    })
  }
  let mutations = rootModule._raw.mutations;
  if(mutations) {
    forEach(mutations, (mutationName, fn) => {
      let arr = store.mutations[mutationName] || (store.mutations[mutationName] = []);
      arr.push((payload) => {
        fn(rootModule.state, payload);
      })
    })
  }
  let actions = rootModule._raw.actions;
  if(actions) {
    forEach(actions, (actionName, fn) => {
      let arr = store.actions[actionName] || (store.actions[actionName] = []);
      arr.push((payload) => {
        fn(store, payload);
      })
    })
  }
  forEach(rootModule._children, (moduleName, module) => {
    installModule(store, state, path.concat(moduleName), module);
  })
}

class Store {
  constructor(options) {
    this._vm = new Vue({
      data: {
        state: options.state  // 把对象了变成可以监控的对象
      }
    });
    //let getters = options.getters || {};   // 用户传递过来的getters
    this.getters = {};
    // 把 getters 属性定义到 this.getters中，并且根据状态的变化 重新执行函数

    // 代替Object.key（）的复杂写法
    // forEach(getters, (getterName, value) => {
    //   Object.defineProperty(this.getters, getterName, {
    //     get:() => {
    //       return value(this.state);
    //     }
    //   })
    // })

    // Object.keys(getters).forEach((getterName) => {
    //   Object.defineProperty(this.getters, getterName, {
    //     get:() => {
    //       return getters[getterName](this.state);
    //     }
    //   })
    // })

    //let mutations = options.mutations || {};
    this.mutations = {};

    // forEach(mutations, (mutationName, fn) => {
    //     // 先把用户传递过来的 mutaions 放到 store 的实例上
    //     this.mutations[mutationName] = (payload) => {
    //       fn.call(this, this.state, payload);
    //     }
    // })

    // Object.keys(mutations).forEach((mutationName) => {
    //    先把用户传递过来的 mutaions 放到 store 的实例上
    //   this.mutations[mutationName] = (payload) => {
    //     mutations[mutationName](this.state, payload);
    //   }
    // })

    //let actions = options.actions || {};
    this.actions = {};
    // forEach(actions, (actionName, fn) => {
    //   this.actions[actionName] = (payload) => {
    //     fn.call(this, this, payload);
    //   }
    // })

    // 需要先格式化一下当前用户传递来的数据
    // 收集模块
    this.modules = new ModuleCollection(options);
    installModule(this, this.state, [], this.modules.root);  // 安装模块
  }

  dispatch = (type, payload) => {
    this.actions[type].forEach(fn => fn(payload));
  }

  commit = (type, payload) => {  // 找到对应的actions执行
    this.mutations[type].forEach(fn => fn(payload));
  }
  get state() {
    return this._vm.state;
  }
}

const install = (_Vue) => {
  Vue = _Vue
  // 要给每个组件注册一个 this.$store 属性
  Vue.mixin({
    beforeCreate() {
      // 需要先判断是父组件还是子组件,如果是子组件，要把父组件的store传递给子组件
      if(this.$options && this.$options.store) {
        this.$store = this.$options.store;
      } else {
        this.$store = this.$parent && this.$parent.$store;
      }
    }
  })
}

export default {
  install,
  Store
}