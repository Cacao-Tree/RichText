// effect函数的嵌套
// 因为activeEffect只有一个，所以当effectFn2执行之后会把activeEffect覆盖，所以修改obj2.foo的时候，触发的trigger函数只会执行effectFn2,所以增加一个栈，用来存储副作用函数，一旦收集之后就会出栈，这样就不会影响到了

const bucket = new WeakMap();

const data = {
  num: 0,
  confirm: true,
};

let activeEffect;

const effectStack = [];

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;

    effectStack.push(effectFn);

    fn(); // 执行副作用函数，读取属性，收集依赖

    effectStack.pop();
    console.log(effectStack.length);

    activeEffect = effectStack[effectStack.length - 1];
  };

  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = []; // 每次副作用执行时，将与这个副作用函数关联的依赖清空
  effectFn();
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
    if (effectFn !== activeEffect) { // 执行的副作用函数与当前的activeEffect相同就不执行了，避免重复执行，无限循环
      effectFn(); // 执行副作用函数
    }
  }); // 新增
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

const component = {
  foo: true,
  bar: true,
};

const obj2 = new Proxy(component, {
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

let temp1, temp2;

effect(function effectFn1() {
  console.log('effectFn1 执行');
  effect(function effectFn2() {
    console.log('effectFn2 执行');
    temp2 = obj2.bar;
  });
  temp1 = obj2.foo;
});

obj2.foo = false;

// obj2.bar = false;
