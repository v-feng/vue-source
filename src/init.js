import { initState } from "./state";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    let vm = this;
    vm.$options = options; // 将 用户的选项配置 挂到vm实例上
    initState(vm);
  };
}
