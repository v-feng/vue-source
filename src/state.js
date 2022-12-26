import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher, { nextTick } from "./observe/watch";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initDate(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}
function initDate(vm) {
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(vm) : data;
  vm._data = data;
  for (let key in data) {
    proxy(vm, "_data", key);
  }
  observe(data);
}
function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatchers = {});
  for (let key in computed) {
    let userDef = computed[key];
    let fn = typeof userDef === "function" ? userDef : userDef.get;

    watchers[key] = new Watcher(vm, fn, { lazy: true });

    defineComputed(vm, key, userDef);
  }
}
function defineComputed(vm, key, userDef) {
  const setter = userDef.set || (() => {});
  Object.defineProperty(vm, key, {
    get: createComputedGetter(key),
    set: setter,
  });
}
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key];
    if (watcher.dirty) {
      watcher.evatelue();
    }
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value;
  };
}

function initWatch(vm) {
  const watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; // 字符串 数组 函数
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatch(vm, key, handler[i]);
      }
    } else {
      createWatch(vm, key, handler);
    }
  }
}

function createWatch(vm, key, handler) {
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  return vm.$watch(key, handler);
}

export function initStateMixin(Vue) {
  Vue.prototype.$watch = function (expreOrFn, cb) {
    new Watcher(this, expreOrFn, { user: true }, cb);
  };
  Vue.prototype.$nextTick = nextTick;
}
