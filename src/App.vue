<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { computed, ref, watch } from 'vue';
const count = ref(0)

const plusOne = computed(() => {
    console.log('computed plusOne:', count.value)
    return count.value + 1
})

watch(count, () => {
    console.log('watch count:', count.value)
    // console.log('watch plusOne:', plusOne.value)
})

// console.log('before inc plusOne:', plusOne.value)
count.value++
// console.log('after inc plusOne:', plusOne.value)

</script>

<template>
    <div>
        <a href="https://vite.dev" target="_blank">
            <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <a href="https://vuejs.org/" target="_blank">
            <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
        </a>
    </div>
    <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
