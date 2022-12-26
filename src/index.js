import { initGlobalApi } from "./globalApi";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";

function Vue(options) {
  this._init(options);
}

initLifeCycle(Vue); // 渲染逻辑
initMixin(Vue); // 扩展 init
initGlobalApi(Vue); // 全局API
initStateMixin(Vue); // nextTick
// const vm1 = new Vue({
//   data() {
//     return {
//       name: "小胡",
//     };
//   },
// });
// const vm2 = new Vue({
//   data() {
//     return {
//       name: "小马",
//     };
//   },
// });
// let render1 = compileToFunction(
//   `<ul style="color: blue;background: black;">
//    <li key='a'>a</li>
//    <li key='b'>b</li>
//    <li key='c'>c</li>
// </ul>`
// );
// let preVNode = render1.call(vm1);
// let el = createElm(preVNode);
// document.body.appendChild(el);
// let render2 = compileToFunction(
//   `<ul style="color: green;background: red;">
//    <li key='a'>a</li>
//    <li key='b'>b</li>
//    <li key='c'>c</li>
//    <li key='d'>d</li>
// </ul>`
// );
// let nextVnode = render2.call(vm2);
// setTimeout(() => {
//   patch(preVNode, nextVnode);
// }, 1000);

export default Vue;


// a t u n
// a s u f e