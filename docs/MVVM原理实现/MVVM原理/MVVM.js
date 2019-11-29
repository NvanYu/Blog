/*
 * @Author: Steven Yu 
 * @Date: 2019-09-20 10:23:27 
 * @Last Modified by: Steven Yu
 * @Last Modified time: 2019-09-20 13:20:47
*/

class Dep {
  constructor() {
    // 存放所有 watcher
    this.subs = [];
  }
  // 订阅
  addSub(watcher) {
    this.subs.push(watcher);
  }
  // 发布
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}

// TODO 观察者模式
class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    // 默认先存放一个老值
    this.oldValue = this.get();
  }

  get() {
    Dep.target = this;   //先把自己放到this上

    // 取值 把观察者和数据变化关联起来
    let value = CompileUtil.getVal(this.vm, this.expr);
    Dep.target = null;
    return value;
  }

  // 数据变化后会调用观察者的update方法
  update() {
    let newVal = CompileUtil.getVal(this.vm, this.expr);
    if(newVal === this.oldValue) {
      this.cb(newVal);
    }
  }
}

// 实现数据劫持
class Observer {
  constructor(data) {
    this.data = data;
  }

  observer(data) {
    // 如果是对象才观察
    if(data && typeof data == 'object') {
      // 如果是对象
      for (let key in data) {
        this.defineReactive(data, key, data[key]);
      }
    }
  }

  defineReactive(obj, key, value) {
    this.observer(value);
    let dep = new Dep();  // 给每一个属性都加上一个具有发布订阅的功能
    Object.defineProperty(obj, key, {
      get() {
        // 创建watcher时，会取到对应的内容，并且把watcher放到全局上
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set:(newVal) => {
        if(newVal != value) {
          this.observer(newVal);
          value = newVal;
          dep.notify();
        }
      }
    })
  }
}

class Compiler {
  constructor(el, vm) {
    // 判断el是不是元素，如果是，就获取
    this.el = this.isElementNode(el) ? el : document.querySelector(el);

    // 把当前节点中的元素获取放到内存中
    this.vm = vm;
    let fragment = this.node2fragment(this.el);

    // 把节点中的内容替换

    // 编译模板，用数据编译
    this.compile(fragment);

    // 把内容塞到页面
    this.el.appendChild(fragment);
  }

  isDirective(attrName) {
    return attrName.startWith('v-');
  }

  // 编译元素
  compileElement(node) {
    let attributes = node.attributes;   // 类数组
    [...attributes].forEach(attr => {
      let {name,value:expr} = attr;
      if(this.isDirective(name)) {
        let [, directive] = name.split('-');
        let [direvtiveName, eventName] = directive.split(':');

        // 需要调用不同的指令来处理
        CompileUtil[direvtiveName](node, expr, this.vm, eventName);
      }
    })
  }

  // 编译文本
  compileText(node) {  // 判断当前文本节点内容是否包含 {{}}
    let content = node.textContent;
    if(/\{\{(.+?)\}\}/.test(content)) {
      CompileUtil['text'](node, content, this.vm);
    }
  }


  // 编译内存中的dom节点
  compile(node) {
    let childNodes = node.childNodes;
    [...childNodes].forEach(child => {
      if(this.isElementNode(child)) {
        this.compileElement(child);
        // 如果是元素的话，要把自己传进去，再去遍历子节点
        this.compile(child);
      } else {
        this.compileText(child);
      }
    })
  }

  /**
   * 把节点移动到内存
   * @param {} node 
   */
  node2fragment(node) {
    // 创建一个文档碎片
    let fragment = document.createDocumentFragment();
    let firstChild;
    while(firstChild = node.firstChild) {
      // appendChild 有移动性,每拿一个节点到内存中，页面中就少一个
      fragment.appendChild(firstChild);
    }
    return fragment;
  }

  // 是不是元素节点
  isElementNode(node) {
    return node.nodeType === 1;
  }
}

CompileUtil = {
  // 根据表达式取代对应的数据
  getVal(vm, expr) {  // vm.$data   'school.name'
    return expr.split('.').reduce((data, current) => {
      return data[current];
    }, vm.$data);
  },

  setValue(vm ,expr, value) {
    expr.split('.').reduce((data, current, index, arr) => {
      if(arr.length - 1 == index) {
        return data[current] = value;
      }
      return data[current];
    }, vm.$data);
  },

  // node是节点  expr是表达式  vm是当前实例
  model(node, expr, vm) {
    // 给输入框赋予value属性
    let fn = updater['modelUpdater'];
    // 给输入框加一个观察者，如果稍后数据更新了会触发此方法，会拿新值给输入框赋予值
    new Watcher(vm, expr, (newVal) => { 
      fn(node, newVal);
    })
    node.addEventListener('input', (e) => {
      let value = e.target.value;
      this.setValue(vm, expr, value);
    })
    let value = this.getVal(vm, expr);
    fn(node, value);
  },
  html(node, expr, vm) {
    let fn = updater['htmlUpdater'];
    new Watcher(vm, expr, (newVal) => { 
      fn(node, newVal);
    })
    let value = this.getVal(vm, expr);
    fn(node, value);
  },
  getContentValue(vm, expr) {
    // 遍历表达式 将内容重新替换成一个完整的内容 返还回去
    return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getVal(vm, args[1]);
    })
  },
  on(node, expr, vm, eventName) {
    node.addEventListener(eventName,(e) => {
      vm[expr].call(vm, e);
    })
  },
  text(node, expr, vm) {
    let fn = this.updater['textUpdater'];
    let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      // 给表达式每个{{}}都加上观察者
      new Watcher(vm, args[1], () => {
        fn(node, this.getContentValue(vm, expr)); // 返回一个全新的字符串
      })
      return this.getVal(vm, args[1]);
    })
    fn(node, content);
  },
  updater: {
    modelUpdater(node, value) {
      node.value = value;
    },
    htmlUpdater(node, value) {
      node.innerHTML = value;
    },
    textUpdater(node, value) {
      node.textContent = value;
    }
  }
}

// 基类
class Vue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    let computed = options.computed;
    let methods = options.methods;
    // 这个根元素存在，就编译模板
    if(this.$el) {

      // 把数据全部转化成Object.defineProperty来定义

      new Observer(this.$data);

      

      for(let key in computed) {
        Object.defineProperty(this.$data, key, {
          get:() => {
            return computed[key].call(this);
          }
        })
      }

      for(let key in methods) {
        Object.defineProperty(this.$data, key, {
          get() {
            return methods[key];
          }
        })
      }

      // 把数据获取操作 vm 上的取值操作代理到vm.$data
      this.proxyVm(this.$data);
      new Compiler(this.$el, this);
    }
  }

  proxyVm(data) {
    for(let key in data) {
      Object.defineProperty(this, key, {
        get() {
          data[key];
        },
        set(newVal) {
          data[key] = newVal;
        }
      })
    }
  }
}

