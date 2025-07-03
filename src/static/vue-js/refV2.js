const bucket = new WeakMap();

const data = {
  num: 0,
};

let activeEffect;

function effect(fn) {
  activeEffect = fn;
}

function track(target, key) {
  let depsMap = bucket.get(target); // 这个代理对象的副作用依赖
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map())); // 没有就塞一个
  }

  let dep = depsMap.get(key); // 获取当前key的副作用依赖
  if (!dep) {
    depsMap.set(key, (dep = new Set())); // 没有就塞一个
  }

  dep.add(activeEffect);
}

const obj = new Proxy(data, {
  get: (target, key) => {
    if (!activeEffect) return target[key];

    track(target, key);

    return target[key];
  },
  set: (target, key, newVal) => {
    target[key] = newVal;

    const depsMap = bucket.get(target);
    const dep = depsMap?.get(key);

    if (dep) {
      dep.forEach((fn) => fn());
    }
  },
});

function handleAdd() {
  obj.num++;
}
