import { compileToFunction } from "./compiler/index";
import { callHooks, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = mergeOptions(this.constructor.options, options); // 将 用户的选项配置 挂到vm实例上
    callHooks(vm, "beforeCreate");
    initState(vm);
    callHooks(vm, "created");

    if (options.el) {
      vm.$mount(options.el); //数据的挂载
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    let opts = vm.$options;
    el = document.querySelector(el);
    if (!opts.render) {
      let template;
      if (!opts.template && el) {
        template = el.outerHTML;
      } else {
        template = opts.template;
      }
      if (template) {
        const render = compileToFunction(template);
        opts.render = render;
      }
    }
    mountComponent(vm, el); // 组建初渲染 挂载
  };
}
