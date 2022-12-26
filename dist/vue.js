(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function mergeOptions(parent, chidren) {
    var stracs = {};
    var LIFECYCLE = ["beforeCreate", "created"];
    LIFECYCLE.forEach(function (hook) {
      stracs[hook] = function (p, c) {
        if (c) {
          if (p) {
            return p.concat(c);
          } else {
            return [c];
          }
        } else {
          return p;
        }
      };
    });
    var options = {};
    for (var key in parent) {
      mergeFiled(key);
    }
    for (var _key in chidren) {
      if (!parent.hasOwnProperty(_key)) {
        mergeFiled(_key);
      }
    }
    function mergeFiled(key) {
      // 策略 减少判断逻辑
      if (stracs[key]) {
        options[key] = stracs[key](parent[key], chidren[key]);
      } else {
        options[key] = chidren[key] || parent[key];
      }
    }
    return options;
  }

  function initGlobalApi(Vue) {
    Vue.options = {};
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
  // 第一个分组就是属性的key value 就是 分组3/分组4/分组五
  var startTagClose = /^\s*(\/?)>/; // <div> <br/>

  // vue3 采用的不是使用正则
  // 对模板进行编译处理

  function parseHTML(html) {
    // html最开始肯定是一个  </div>

    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; // 用于存放元素的
    var currentParent; // 指向的是栈中的最后一个
    var root;

    // 最终需要转化成一颗抽象语法树
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    // 利用栈型结构 来构造一颗树
    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); // 创造一个ast节点
      if (!root) {
        // 看一下是否是空树
        root = node; // 如果为空则当前是树的根节点
      }

      if (currentParent) {
        node.parent = currentParent; // 只赋予了parent属性
        currentParent.children.push(node); // 还需要让父亲记住自己
      }

      stack.push(node);
      currentParent = node; // currentParent为栈中的最后一个
    }

    function chars(text) {
      // 文本直接放到当前指向的节点中
      text = text.replace(/\s/g, ''); // 如果空格超过2就删除2个以上的
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      stack.pop(); // 弹出最后一个, 校验标签是否合法
      currentParent = stack[stack.length - 1];
    }
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          // 标签名
          attrs: []
        };
        advance(start[0].length);
        // 如果不是开始标签的结束 就一直匹配下去
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      return false; // 不是开始标签
    }

    while (html) {
      // 如果textEnd 为0 说明是一个开始标签或者结束标签
      // 如果textEnd > 0说明就是文本的结束位置
      var textEnd = html.indexOf("<"); // 如果indexOf中的索引是0 则说明是个标签
      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); // 开始标签的匹配结果
        if (startTagMatch) {
          // 解析到的开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 文本内容
        if (text) {
          chars(text);
          advance(text.length); // 解析到的文本
        }
      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = ""; // {name,value}
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === "style") {
        // color:red;background:red => {color:'red'}
        var obj = {};
        attr.value.split(";").forEach(function (item) {
          // qs 库
          var _item$split = item.split(":"),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // a:b,c:d,
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量
  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      // 文本
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        //_v( _s(name)+'hello' + _s(name))
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        // split
        while (match = defaultTagRE.exec(text)) {
          var index = match.index; // 匹配的位置  {{name}} hello  {{name}} hello
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(",");
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : "null").concat(ast.children.length ? ",".concat(children) : "", ")");
    return code;
  }
  function compileToFunction(template) {
    // 1.就是将template 转化成ast语法树
    var ast = parseHTML(template);

    // 2.生成render方法 (render方法执行后的返回的结果就是 虚拟DOM)

    // 模板引擎的实现原理 就是 with  + new Function

    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); // 根据代码生成render函数
    //  _c('div',{id:'app'},_c('div',{style:{color:'red'}},  _v(_s(vm.name)+'hello'),_c('span',undefined,  _v(_s(age))))

    return render;
  }

  // <xxx
  // <namepsace:xxx
  // color   =   "asdsada"     c= 'asdasd'  d=  asdasdsa

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++;
      this.subs = []; // 存放watch
    }
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        Dep.target.addDep(this);
        // this.subs.push(Dep.target);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watch) {
          return watch.update();
        });
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }]);
    return Dep;
  }();
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var id = 0;
  var Watcher = /*#__PURE__*/function () {
    // 不同组件有不同 watcher
    function Watcher(vm, exprOrfn, options, cb) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.cb = cb;
      this.renderWatcher = options;
      this.user = options.user;
      if (typeof exprOrfn === "string") {
        this.getter = function () {
          return vm[exprOrfn];
        };
      } else {
        this.getter = exprOrfn;
      }
      this.depsId = new Set();
      this.deps = [];
      this.vm = vm;
      this.lazy = options.lazy;
      this.dirty = this.lazy;
      this.value = this.lazy ? undefined : this.get();
    }
    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        pushTarget(this);
        var value = this.getter.call(this.vm);
        popTarget();
        return value;
      }
    }, {
      key: "evatelue",
      value: function evatelue() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get();
        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        while (i--) {
          this.deps[i].depend();
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          this.dirty = true;
        } else {
          queueWatch(this);
        }
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
      }
    }]);
    return Watcher;
  }();
  var queue = [];
  var has = {};
  var pending = false;
  function flushSchedluQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }
  function queueWatch(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;
      if (!pending) {
        nextTick(flushSchedluQueue);
        pending = true;
      }
    }
  }
  var callbacks = [];
  var waiting = false;
  function flushCallback() {
    var cbs = callbacks.slice(0);
    callbacks = [];
    waiting = false;
    cbs.forEach(function (cb) {
      return cb();
    });
  }
  function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) {
      Promise.resolve().then(flushCallback);
      waiting = true;
    }
  }

  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }
  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === "string") {
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el, oldProps, props) {
    /* 
    老的属性中有 要删除老的
    */
    var oldStyles = (oldProps === null || oldProps === void 0 ? void 0 : oldProps.style) || {};
    var newStyles = (props === null || props === void 0 ? void 0 : props.style) || {};
    for (var key in oldStyles) {
      if (!newStyles[key]) {
        el.style[key] = "";
      }
    }
    for (var _key in oldProps) {
      if (!props[_key]) {
        el.removeAttribute(_key);
      }
    }
    for (var _key2 in props) {
      if (_key2 === "style") {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function patch(oldVnode, vnode) {
    var isRealElement = oldVnode.nodeType;
    if (isRealElement) {
      var elm = oldVnode;
      var parentElm = elm.parentNode;
      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      return newElm;
    } else {
      /* 
        1.两个节点不是同一个节点 没有对比直接替换
        2.两个节点是同一个节点
        3.比较儿子
      */
      return patchVnode(oldVnode, vnode);
    }
  }
  function patchVnode(oldVnode, vnode) {
    if (!isSameVnode(oldVnode, vnode)) {
      var _el = createElm(vnode);
      oldVnode.el.parentNode.replaceChild(_el, oldVnode.el);
      return _el;
    }
    // 文本的情况
    var el = vnode.el = oldVnode.el;
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        el.textContext = vnode.text;
      }
    }
    // 是标签 我们需要比对标签的属性
    patchProps(el, oldVnode.data, vnode.data);
    var oldVNodeChildren = oldVnode.children || [];
    var newVNodeChildren = vnode.children || [];
    console.log(oldVnode.children);
    if (oldVNodeChildren.length > 0 && newVNodeChildren.length > 0) {
      updateChildren(el, oldVNodeChildren, newVNodeChildren);
    } else if (oldVNodeChildren.length > 0) {
      el.innerHTML = "";
    } else if (newVNodeChildren.length > 0) {
      // 没有老的 只有新的
      mountChildren(el, newVNodeChildren);
    }
    return el;
  }
  function mountChildren(el, newVNodeChildren) {
    for (var i = 0; i < newVNodeChildren.length; i++) {
      var child = newVNodeChildren[i];
      el.appendChild(createElm(child));
    }
  }
  function updateChildren(el, oldChildren, newChildren) {
    // 我们操作列表 经常会是有  push shift pop unshift reverse sort这些方法  （针对这些情况做一个优化）
    // vue2中采用双指针的方式 比较两个节点
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];
    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }
    var map = makeIndexByKey(oldChildren);

    // 循环的时候为什么要+key
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 有任何一个不满足则停止  || 有一个为true 就继续走
      // 双方有一方头指针，大于尾部指针则停止循环
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode); // 如果是相同节点 则递归比较子节点
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
        // 比较开头节点
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode); // 如果是相同节点 则递归比较子节点
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
        // 比较开头节点
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode);
        // insertBefore 具备移动性 会将原来的元素移动走
        el.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将老的尾巴移动到老的前面去
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode);
        // insertBefore 具备移动性 会将原来的元素移动走
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 将老的尾巴移动到老的前面去
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else {
        // 在给动态列表添加key的时候 要尽量避免用索引，因为索引前后都是从0 开始 ， 可能会发生错误复用
        // 乱序比对
        // 根据老的列表做一个映射关系 ，用新的去找，找到则移动，找不到则添加，最后多余的就删除
        var moveIndex = map[newStartVnode.key]; // 如果拿到则说明是我要移动的索引
        if (moveIndex !== undefined) {
          var moveVnode = oldChildren[moveIndex]; // 找到对应的虚拟节点 复用
          el.insertBefore(moveVnode.el, oldStartVnode.el);
          oldChildren[moveIndex] = undefined; // 表示这个节点已经移动走了
          patchVnode(moveVnode, newStartVnode); // 比对属性和子节点
        } else {
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        }
        newStartVnode = newChildren[++newStartIndex];
      }
    }
    if (newStartIndex <= newEndIndex) {
      // 新的多了 多余的就插入进去
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]);
        // 这里可能是像后追加 ，还有可能是向前追加
        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; // 获取下一个元素
        // el.appendChild(childEl);
        el.insertBefore(childEl, anchor); // anchor 为null的时候则会认为是appendChild
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      // 老的对了，需要删除老的
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i]) {
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    }

    // 我们为了 比较两个儿子的时候 ，增高性能 我们会有一些优化手段
    // 如果批量像页面中修改出入内容 浏览器会自动优化
  }

  function initLifeCycle(Vue) {
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) !== "object") return value;
      return JSON.stringify(value);
    };
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el;
      var preVNode = vm._vnode;
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
  function mountComponent(vm, el) {
    vm.$el = el;
    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    new Watcher(vm, updateComponent, true);
  }
  function callHooks(vm, hook) {
    var handlers = vm.$options[hook];
    if (handlers) {
      handlers.forEach(function (handle) {
        return handle(vm);
      });
    }
  }

  // 监听数组变异方法（修改数组本身）  7个

  var oldArrayPrototype = Array.prototype;
  var newArrayPrototype = Object.create(oldArrayPrototype);
  var methods = ["push", "shift", "pop", "unshift", "reserve", "sort", "splice"];
  methods.forEach(function (method) {
    newArrayPrototype[method] = function () {
      var _oldArrayPrototype$me;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var result = (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args)); // 函数劫持   切片编程
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "splice":
          inserted = args.slice(2);
      }
      ob.observeArr(inserted);
      ob.dep.notify();
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      this.dep = new Dep();
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false
      });
      if (Array.isArray(data)) {
        // 保留原数组特性并重写部分方法
        data.__proto__ = newArrayPrototype;
        this.observeArr(data); // 数组中放有对象，继续监控对象变化
      } else {
        this.walk(data);
      }
    }
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // Object.defineProperty 只能劫持已经存在的属性
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArr",
      value: function observeArr(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observe;
  }();
  function depengArray(value) {
    value.forEach(function (item) {
      var _item$__ob__;
      (_item$__ob__ = item.__ob__) === null || _item$__ob__ === void 0 ? void 0 : _item$__ob__.dep.depend();
      if (Array.isArray(item)) {
        depengArray(item);
      }
    });
  }
  // 闭包 value  //属性劫持
  function defineReactive(target, key, value) {
    var childOb = observe(value);
    var dep = new Dep();
    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              depengArray(value);
            }
          }
        }
        // 取值的时候
        return value;
      },
      set: function set(newValue) {
        // 设置 修改值
        if (value === newValue) return;
        observe(newValue);
        value = newValue;
        dep.notify();
      }
    });
  }
  function observe(data) {
    if (_typeof(data) !== "object" || data === null) return;
    // 如果一个对象被劫持了，就不需要劫持了，可以增加一个实例，实例来判断是否被劫持过
    if (data.__ob__ instanceof Observe) {
      return data.__ob__;
    }
    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options;
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
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initDate(vm) {
    var data = vm.$options.data;
    data = typeof data === "function" ? data.call(vm) : data;
    vm._data = data;
    for (var key in data) {
      proxy(vm, "_data", key);
    }
    observe(data);
  }
  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {};
    for (var key in computed) {
      var userDef = computed[key];
      var fn = typeof userDef === "function" ? userDef : userDef.get;
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }
  function defineComputed(vm, key, userDef) {
    var setter = userDef.set || function () {};
    Object.defineProperty(vm, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }
  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWatchers[key];
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
    var watch = vm.$options.watch;
    for (var key in watch) {
      var handler = watch[key]; // 字符串 数组 函数
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
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
  function initStateMixin(Vue) {
    Vue.prototype.$watch = function (expreOrFn, cb) {
      new Watcher(this, expreOrFn, {
        user: true
      }, cb);
    };
    Vue.prototype.$nextTick = nextTick;
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = mergeOptions(this.constructor.options, options); // 将 用户的选项配置 挂到vm实例上
      callHooks(vm, "beforeCreate");
      initState(vm);
      callHooks(vm, "created");
      if (options.el) {
        vm.$mount(options.el); //数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var opts = vm.$options;
      el = document.querySelector(el);
      if (!opts.render) {
        var template;
        if (!opts.template && el) {
          template = el.outerHTML;
        } else {
          template = opts.template;
        }
        if (template) {
          var render = compileToFunction(template);
          opts.render = render;
        }
      }
      mountComponent(vm, el); // 组建初渲染 挂载
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initLifeCycle(Vue); // 渲染逻辑
  initMixin(Vue); // 扩展 init
  initGlobalApi(Vue); // 全局API
  initStateMixin(Vue); // nextTick

  // a t u n
  // a s u f e

  return Vue;

}));
//# sourceMappingURL=vue.js.map
