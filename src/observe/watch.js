import Dep from "./dep";

let id = 0;
class Watcher {
  // 不同组件有不同 watcher
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options;
    this.getter = fn;
    this.depsId = new Set();
    this.deps = [];
    this.get();
  }
  get() {
    Dep.target = this; // 静态属性
    this.getter();
    Dep.target = null; // 置空
  }
  update() {
    // console.log("update");
    // this.get();
    queueWatch(this);
  }
  run() {
    this.get();
  }
  addDep(dep) {
    const id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this);
    }
  }
}
let queue = [];
let has = {};
let pending = false;
function flushSchedluQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flushQueue.forEach((q) => q.run());
}
function queueWatch(watcher) {
  let id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    if (!pending) {
      nextTick(flushSchedluQueue, 0);
      pending = true;
    }
  }
}
let callbacks = [];
let waiting = false;
function flushCallback() {
  let cbs = callbacks.slice(0);
  callbacks = [];
  waiting = false;
  cbs.forEach((cb) => cb());
}

export function nextTick(cb) {
  callbacks.push(cb);
  if (!waiting) {
    Promise.resolve().then(flushCallback);
    waiting = true;
  }
}
export default Watcher;
