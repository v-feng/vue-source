const stracs = {};
const LIFECYCLE = ["beforeCreate", "created"];
LIFECYCLE.forEach((hook) => {
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

stracs.components = function (parentVal, childVal) {
  console.log(parentVal, childVal);
  const res = Object.create(parentVal);

  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key]; // 返回的是构造的对象 可以拿到父亲原型上的属性，并且将儿子的都拷贝到自己身上
    }
  }

  return res;
};

export function mergeOptions(parent, chidren) {
  const options = {};
  for (let key in parent) {
    mergeFiled(key);
  }
  for (let key in chidren) {
    if (!parent.hasOwnProperty(key)) {
      mergeFiled(key);
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
