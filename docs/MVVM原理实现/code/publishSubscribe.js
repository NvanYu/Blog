// 发布订阅  先有订阅再有发布，订阅事件放进数组 [fn1,fn2,fn3]
// 发布时，循环数组依次执行即可

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

function Watcher(fn) {
  this.fn = fn;
}

let watcher = new Watcher(function() {
  console.log(1);
})

Watcher.prototype.update = function() {
  this.fn();
}

let dep = new Dep();
dep.addSub(watcher); // 将watcher放入数组中
dep.addSub(watcher);
dep.notify();