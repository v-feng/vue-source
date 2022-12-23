import { newArrayPrototype } from "./arr";
import Dep from "./dep";

class Observe {
  constructor(data) {
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    if (Array.isArray(data)) {
      // 保留原数组特性并重写部分方法
      data.__proto__ = newArrayPrototype;
      this.observeArr(data); // 数组中放有对象，继续监控对象变化
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    // Object.defineProperty 只能劫持已经存在的属性
    // 重新定义属性
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArr(data) {
    data.forEach((item) => observe(item));
  }
}
// 闭包 value  //属性劫持
function defineReactive(target, key, value) {
  observe(value);
  let dep = new Dep();
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend();
      }
      // 取值的时候
      return value;
    },
    set(newValue) {
      // 设置 修改值
      if (value === newValue) return;
      observe(newValue);
      value = newValue;
      dep.notify();
    },
  });
}
export function observe(data) {
  if (typeof data !== "object" || data === null) return;
  // 如果一个对象被劫持了，就不需要劫持了，可以增加一个实例，实例来判断是否被劫持过
  if (data.__ob__ instanceof Observe) {
    return data.__ob__;
  }
  return new Observe(data);
}
