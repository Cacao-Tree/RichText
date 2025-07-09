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

  const job = () => {
    newValue = effectFn();
    callback(oldValue, newValue);
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
