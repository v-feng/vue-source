import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watch";

function Vue(options) {
  this._init(options);
}
Vue.prototype.$nextTick = nextTick;
initLifeCycle(Vue);
initMixin(Vue);
export default Vue;
