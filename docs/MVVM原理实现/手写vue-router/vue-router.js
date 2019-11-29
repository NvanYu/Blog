class HistoryRoute {
  constructor() {
    this.current = null;
  }
}

class VueRouter {
  constructor(options) {
    this.mode = options.mode || "hash";
    this.routes = options.routes || [];

    // 路由表数组改为{'/home': Home, '/about': About}
    this.routesMap = this.createMap(this.routes);

    // 路由中需要存放当前的路径
    this.history = new HistoryRoute();
    this.init();
  }

  init() {
    if (this.mode === "hash") {
      // 判断用户打开时有没有 hash , 没有就跳到 #/
      location.hash ? "" : (location.hash = "/");
      window.addEventListener("load", () => {
        this.history.current = location.hash.splice(1);
      });
      window.addEventListener("hashchange", () => {
        this.history.current = location.hash.splice(1);
      });
    } else {
      location.pathname ? "" : (location.pathname = "/");
      window.addEventListener("load", () => {
        this.history.current = location.pathname;
      });
      window.addEventListener("popstate", () => {
        this.history.current = location.pathname;
      });
    }
  }

  go() {}

  back() {}

  push() {}

  createMap(routes) {
    return routes.reduce((accumulate, current) => {
      accumulate[current.path] = current.component;
      return accumulate;
    }, {});
  }
}

VueRouter.install = function(Vue, opts) {
  // 每个组件都要有 this.$router  this.$route
  // 在所有组件中获取同一个路由实例
  Vue.mixin({
    // 混合方法
    beforeCreate() {
      if (this.$options && this.$options.router) {
        // 定位根组件
        this._root = this; // 把当前实例挂载在_root上
        this._router = this.$options.router; // 把router实例挂载上_router上
        // 如果history中的current属性变化 也会刷新视图
        Vue.util.defineReactive(this, "xxx", this._router.history);
      } else {
        // vue 组件渲染顺序 父 -> 子 -> 孙子
        this._root = this.$parent._root; // 如果想获取唯一路由实例
      }

      Object.defineProperty(this, "$router", {
        // Router实例
        get() {
          return this._root._router;
        }
      });
      Object.defineProperty(this, "$route", {
        get() {
          return {
            // 当前路由实例
            current: this._root._router.history.current
          };
        }
      });
    }
  });
  Vue.component("router-link", {
    props: {
      to: String,
      tag: String
    },
    methods: {
      handleClick() {
        // 如果是hash ... 如果是history ....
      }
    },
    render(h) {
      let mode = this._self._root._router.mode;
      let tag = this.tag;
      return (
        <tag
          on-click={this.handleClick}
          href={mode === "hash" ? `#${this.to}` : this.to}
        >
          {this.$slots.defalut}
        </tag>
      );
    }
  });

  Vue.component("router-view", {
    // 根据当前状态 current 到路由表 找
    render(h) {
      let current = this._self._root._router.history.current;
      let routerMap = this._self._root._router.routerMap;
      return h(routerMap[current]);
    }
  });
};

export default VueRouter;
