import { initGlobalApi } from "./globalApi";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watch";

function Vue(options) {
  this._init(options);
}
Vue.prototype.$nextTick = nextTick;
initLifeCycle(Vue);
initMixin(Vue);
initGlobalApi(Vue);

Vue.prototype.$watch = function (expreOrFn, cb) {
  new Watcher(this, expreOrFn, { user: true }, cb);
};

export default Vue;
