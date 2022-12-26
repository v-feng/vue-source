import { isSameVnode } from ".";

export function createElm(vnode) {
  const { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, {}, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}
export function patchProps(el, oldProps, props) {
  /* 
  老的属性中有 要删除老的
*/
  let oldStyles = oldProps?.style || {};
  let newStyles = props?.style || {};
  for (let key in oldStyles) {
    if (!newStyles[key]) {
      el.style[key] = "";
    }
  }
  for (let key in oldProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }
  for (let key in props) {
    if (key === "style") {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}
export function patch(oldVnode, vnode) {
  const isRealElement = oldVnode.nodeType;
  if (isRealElement) {
    const elm = oldVnode;
    const parentElm = elm.parentNode;
    let newElm = createElm(vnode);
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
    let el = createElm(vnode);
    oldVnode.el.parentNode.replaceChild(el, oldVnode.el);
    return el;
  }
  // 文本的情况
  let el = (vnode.el = oldVnode.el);
  if (!oldVnode.tag) {
    if (oldVnode.text !== vnode.text) {
      el.textContext = vnode.text;
    }
  }
  // 是标签 我们需要比对标签的属性
  patchProps(el, oldVnode.data, vnode.data);

  let oldVNodeChildren = oldVnode.children || [];
  let newVNodeChildren = vnode.children || [];
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
  for (let i = 0; i < newVNodeChildren.length; i++) {
    let child = newVNodeChildren[i];
    el.appendChild(createElm(child));
  }
}
function updateChildren(el, oldChildren, newChildren) {
  // 我们操作列表 经常会是有  push shift pop unshift reverse sort这些方法  （针对这些情况做一个优化）
  // vue2中采用双指针的方式 比较两个节点
  let oldStartIndex = 0;
  let newStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let newEndIndex = newChildren.length - 1;

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];

  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  function makeIndexByKey(children) {
    let map = {};
    children.forEach((child, index) => {
      map[child.key] = index;
    });
    return map;
  }

  let map = makeIndexByKey(oldChildren);

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
      let moveIndex = map[newStartVnode.key]; // 如果拿到则说明是我要移动的索引
      if (moveIndex !== undefined) {
        let moveVnode = oldChildren[moveIndex]; // 找到对应的虚拟节点 复用
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
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEl = createElm(newChildren[i]);
      // 这里可能是像后追加 ，还有可能是向前追加
      let anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null; // 获取下一个元素
      // el.appendChild(childEl);
      el.insertBefore(childEl, anchor); // anchor 为null的时候则会认为是appendChild
    }
  }

  if (oldStartIndex <= oldEndIndex) {
    // 老的对了，需要删除老的
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (oldChildren[i]) {
        let childEl = oldChildren[i].el;
        el.removeChild(childEl);
      }
    }
  }

  // 我们为了 比较两个儿子的时候 ，增高性能 我们会有一些优化手段
  // 如果批量像页面中修改出入内容 浏览器会自动优化
}
