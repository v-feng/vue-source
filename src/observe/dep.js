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
Dep.target = null;
export default Dep;
