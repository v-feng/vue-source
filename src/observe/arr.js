// 监听数组变异方法（修改数组本身）  7个

let oldArrayPrototype = Array.prototype;
export let newArrayPrototype = Object.create(oldArrayPrototype);

const methods = [
  "push",
  "shift",
  "pop",
  "unshift",
  "reverse",
  "sort",
  "splice",
];
methods.forEach((method) => {
  newArrayPrototype[method] = function (...args) {
    let result = oldArrayPrototype[method].call(this, ...args); // 函数劫持   切片编程
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }
    ob.observeArr(inserted);
    ob.dep.notify();
    return result;
  };
});
