const bucket = new WeakMap();

const data = {
  num: 0,
  confirm: true,
};

let activeEffect;

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = fn;
    fn();
  };

  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effect.deps = []; // 每次副作用执行时，将与这个副作用函数关联的依赖清空
  effectFn();
}

function cleanup(effectFn) {}

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

  activeEffect.deps.push(dep); // 将与当前副作用函数相关的依赖集合收集起来
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

effect(() => {
  console.log('执行');
  document.getElementById('content').innerText = obj.confirm ? obj.num : 'not';
});

function handleAdd() {
  obj.num++;
}

function handleChange() {
  obj.confirm = !obj.confirm;
}
