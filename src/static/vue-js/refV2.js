// 首先调整effect函数的实现，增加一个effectFn来收集activeEffect，将这个effectFn赋值给activeEffect，是因为需要增加一个deps数组，来收集与这个副作用函数相关的依赖，和一个清除函数来清除与该副作用函数相关的依赖集合。
// 收集依赖的函数track，增加了一个流程，将当前key的集合push到activeEffect.deps中，这样就能知道这个副作用函数和哪些依赖相关联了，然后在清除中就可以把集合中和这个副作用函数相关的依赖清除掉。


const bucket = new WeakMap();

const data = {
  num: 0,
  confirm: true,
};

let activeEffect;

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    fn();
  };

  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effect.deps = []; // 每次副作用执行时，将与这个副作用函数关联的依赖清空
  effectFn();
}

function cleanup(effectFn) {
  for (let item of effectFn.deps) {
    item.delete(effectFn);
  }
  effectFn.dep.length = 0;
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

  activeEffect.deps.push(dep); // 将与当前副作用函数相关的依赖集合收集起来
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  const dep = depsMap?.get(key);

  const effectsToRun = new Set(dep); // 新增
  effectsToRun.forEach((effectFn) => effectFn()); // 新增
}

const obj = new Proxy(data, {
  get: (target, key) => {
    if (!activeEffect) return target[key];

    track(target, key);

    return target[key];
  },
  set: (target, key, newVal) => {
    target[key] = newVal;

    trigger(target, key);
  },
});

effect(function effectFn() {
  console.log('执行');
  document.getElementById('content').innerText = obj.confirm ? obj.num : 'not';
});

function handleAdd() {
  obj.num++;
}

function handleChange() {
  obj.confirm = !obj.confirm;
}
