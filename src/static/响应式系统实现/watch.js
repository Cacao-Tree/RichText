import { effect, obj } from './refV4.js';

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return;
  }
  seen.add(value);
  for (let k in value) {
    traverse(value[k], seen);
  }
  return value;
}

function watch(source, callback, options = {}) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(obj);
  }

  let oldValue, newValue;
  let cleanup;

  function onInvalidate(fn) {
    cleanup = fn;
  }

  const job = () => {
    newValue = effectFn();
    cleanup?.(); // 如果有的话就得执行，可以清除遗留副作用函数，这个需要和使用的地方去配合，例如执行之后把某个值改为false，然后不去取值或者return掉
    callback(oldValue, newValue, onInvalidate);
    oldValue = newValue;
  };
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: job,
  });
  if (options.immediately) {
    job();
  } else {
    oldValue = effectFn();
  }
}

watch(obj, () => {
  console.log('变化了', obj.foo);
});

obj.foo = 1;
