export function mergeOptions(parent, chidren) {
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


