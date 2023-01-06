function isReservedTag(tag) {
  return ["a", "div", "ul", "li", "p", "span", "button"].includes(tag);
}

export function createElementVNode(vm, tag, data, ...children) {
  if (data == null) {
    data = {};
  }
  let key = data.key;
  if (key) {
    delete data.key;
  }
  if (isReservedTag(tag)) {
    return vnode(vm, tag, key, data, children);
  } else {
    // 创造组件虚拟节点
    let Ctor = vm.$options.components[tag];
    return createConponentVnode(vm, tag, key, data, children, Ctor);
  }
}
function createConponentVnode(vm, tag, key, data, children, Ctor) {
  if (typeof Ctor === "object") {
    Ctor = vm.$options._base.extend(Ctor);
  }
  data.hook = {
    init() {},
  };
  return vnode(vm, tag, key, data, children, null, { Ctor });
}
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, key, data, children, text, componentOptions) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text,
    componentOptions,
  };
}

export function isSameVnode(vnode1, vnode2) {
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}
