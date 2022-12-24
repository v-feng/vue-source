let id = 0;

class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 存放watch
  }
  depend() {
    Dep.target.addDep(this);
    // this.subs.push(Dep.target);
  }
  notify() {
    this.subs.forEach((watch) => watch.update());
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
}
let stack = [];
export function pushTarget(watcher) {
  stack.push(watcher);
  Dep.target = watcher;
}
export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}
export default Dep;
