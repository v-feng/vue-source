import Watcher from "./observe/watch";
import { createElementVNode, createTextVNode } from "./vnode";
import { patch } from "./vnode/patch";

export function initLifeCycle(Vue) {
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    if (typeof value !== "object") return value;
    return JSON.stringify(value);
  };
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el;
    const preVNode = vm._vnode;
    vm._vnode = vnode;
    if (preVNode) {
      vm.$el = patch(preVNode, vnode);
    } else {
      vm.$el = patch(el, vnode);
    }
  };
  Vue.prototype._render = function () {
    return this.$options.render.call(this);
  };
}

export function mountComponent(vm, el) {
  vm.$el = el;
  const updateComponent = () => {
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent, true);
}

export function callHooks(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handle) => handle(vm));
  }
}
