const bucket = new WeakMap();

const data = {
  foo: 1,
  bar: 2,
};

let activeEffect;

const effectStack = [];

export function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;

    effectStack.push(effectFn);

    const res = fn(); // 执行副作用函数，读取属性，收集依赖

    effectStack.pop();

    activeEffect = effectStack[effectStack.length - 1];

    return res; // 返回副作用函数的执行结果
  };

  effectFn.options = options;

  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = []; // 每次副作用执行时，将与这个副作用函数关联的依赖清空

  if(!options.lazy){
    // 如果不是惰性执行，就立即执行副作用函数
    effectFn();
  }
  
  return effectFn;
}

function cleanup(effectFn) {
  for (let item of effectFn.deps) {
    item.delete(effectFn);
  }
  effectFn.deps.length = 0;
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

  effectsToRun.forEach((effectFn) => {
    if (effectFn !== activeEffect) {
      // 执行的副作用函数与当前的activeEffect相同就不执行了，避免重复执行，无限循环
      if (effectFn.options.scheduler) {
        effectFn.options.scheduler(effectFn); // 如果有调度器就执行调度器
      } else {
        effectFn();
      } // 执行副作用函数
    }
  }); // 新增
}

export const obj = new Proxy(data, {
  get: (target, key) => {
    if (!activeEffect) return target[key];

    track(target, key);

    return target[key];
  },
  set: (target, key, newVal) => {
    target[key] = newVal;

    trigger(target, key);

    return true;
  },
});
