function Yu(options = {}) {
  /**
   * this.$options = options;
   * 将所有属性挂载到$options
   */
  this.$options = options;
  var data = this._data = options.data;
  observe(data);
  // this代理了this._data
  for(let key in data) {
    Object.defineProperty(this, key, {
      enumerable: true,
      get() {
        return this._data[key];
      },
      set(newVal) {
        this._data[key] = newVal;
      }
    })
  }
  initComputed.call(this);
  new Compile(options.el,this);
}


function initComputed() {
  let ym = this;
  let computed = this.$options.computed;
  Object.keys(computed).forEach(k => {
    Object.defineProperty(ym, k, {
      get:typeof computed[k] === 'function' ? computed[k] : computed[k].get,
      set() {

      }
    })
  })
}


function Compile(el,ym) {
  ym.$el = document.querySelector(el);
  let fragment = document.createDocumentFragment();
  while(child = ym.$el.firstChild) { // 将#app中的内容移入内存
    fragment.appendChild(child);
  }

  function replace(fragment) {
    Array.from(fragment.childNodes).forEach(node => {
      let text = node.textContent;
      let reg = /\{\{(.*)\}\}/;
      if(node.nodeType === 3 && reg.test(text)) {
        let arrs = RegExp.$1.split('.');  // eg: a.a -> [a,a]
        let val = ym;
        arrs.forEach(k => {  // 取this.a.a this.b
          val = val[k];
        })
        new Watcher(ym, RegExp.$1, function(newVal) {
          node.textContent = text.replace(/\{\{(.*)\}\}/, newVal);
        })
        // 替换
        node.textContent = text.replace(/\{\{(.*)\}\}/, val);
      }
      if(node.nodeType === 1) {
        // 元素节点
        let nodeAttrs = node.attributes; // 获取当前dom节点的属性
        Array.from(nodeAttrs).forEach(attr => {
          let name = attr.name; // type='text'
          let exp = attr.value; // v-model='b';
          if(name.indexOf('v-') == 0) { // v-model
            node.value = ym[exp];
          }
          new Watcher(ym, exp, function(newVal){
            node.value = newVal; // watcher触发时会自动将内容放入输入框
          });
          node.addEventListener('input', function(e) {
            let newVal = e.target.value;
            ym[exp] = newVal;
          })
        })
      }
      if(node.childNodes) {
        replace(node);
      }
    })
  }
  replace(fragment);

  ym.$el.appendChild(fragment);
}


function Observe(data) {
  let dep = new Dep();
  for(let key in data) {
    let val = data[key];
    observe(val); // 如果data的属性值还是对象，继续观察设置Object.defineProperty
    Object.defineProperty(data, key, {
      enumerable: true,  // 使其可以打印出来（可循环
      get() {
        Dep.target && dep.addSub(Dep.target); //[watcher]
        return val;
      },
      set(newVal) {
        // 设置值先看旧值和新值相不相同
        if(val === newVal) {
          // 相同就不设置
          return
        }
        // 不相同再设置
        val = newVal;
        // 设置新值时再次进行观察
        observe(newVal);
        dep.notify();  // 让所有watcher的update方法执行
      }
    })
  }
}

/**
 * 将实例中的data通过Object.defineProperty观察对象
 *
 * @param {*} data
 */
function observe(data) {
  if(typeof data !== 'object') return;
  new Observe(data);
}

// 发布订阅
function Dep() {
  this.subs = [];
}
Dep.prototype.addSub = function(sub) {
  // 订阅
  this.subs.push(sub);
}

Dep.prototype.notify = function() {
  this.subs.forEach(sub => sub.update());
}

function Watcher(ym, exp, fn) {
  this.fn = fn;
  this.ym = ym;
  this.exp = exp;  // 添加到订阅中
  Dep.target = this;
  let val = ym;
  let arr = exp.split('.');
  arr.forEach(k => {
    val = val[k];
  })
  Dep.target = null;
}

Watcher.prototype.update = function() {
  let val = this.ym;
  let arr = this.exp.split('.');
  arr.forEach(k => {
    val = val[k];
  })
  this.fn(val);
}