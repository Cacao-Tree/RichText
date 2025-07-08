import { obj, effect, trigger, track } from './refV4.js';

function computed(getter) {
  let value;
  let dirty = true;

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        trigger(computedVal, 'value');
        dirty = true; // effect 里有调度器，当依赖的foo和bar发生变化的时候，会触发这个副作用函数，也就是getter，然后就会触发调度器，让这个dirty变成true
      }
    },
  });

  const computedVal = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(computedVal, 'value');
      return value;
    },
  };

  return computedVal;
}

const sum = computed(() => {
  return obj.foo + obj.bar;
});

obj.foo = 10;

setTimeout(() => {
  obj.bar = 20;
  console.log(sum.value);
}, 3000);

effect(function effectFn() {
  console.log(sum.value);
});
