import { obj, effect } from './refV4.js';

function computed(getter) {
  const effectFn = effect(getter, {
    lazy: true,
  });

  return {
    get value() {
      return effectFn();
    },
  };
}

const sum = computed(() => {
  return obj.foo + obj.bar;
});

console.log(sum.value); // 3

obj.foo = 10;

console.log(sum.value); // 12

setTimeout(() => {
  obj.bar = 20;
  console.log(sum.value); // 30
}, 1000);