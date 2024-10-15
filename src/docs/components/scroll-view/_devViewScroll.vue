<template>
  <div>
    <l-select v-update="rangeStart" :options="selectOptions" />
    <l-select v-update="rangeEnd" :options="selectOptions" />
    <div style="position: relative">
      <div class="container" @scroll.passive="scroll">
        <div class="w-full" style="height: 1000px"></div>
        <div class="target block" @animationstart="start"></div>
      </div>
      <div class="block example">cover</div>
      <div class="vline" style="left: 100px"></div>
      <div class="vline" style="left: 200px"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const rangeStart = ref('cover'),
  rangeEnd = ref('cover'),
  selectOptions = ['cover', 'contain', 'entry', 'exit'];

let ani;
const start = (e) => {
  ani = e.target.getAnimations()[0];
  console.log('start', ani);
};

const scroll = () => {
  console.log('ani', ani);
}
</script>

<style scoped>
@keyframes test {
  from {
    --dev-progress: 0;
  }
  to {
    --dev-progress: 1;
  }
}
@property --dev-progress {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}
.container {
  height: 300px;
  position: relative;
  width: 100%;
  overflow-y: auto;
  border: 1px solid var(--l-gray-a8);
}
.block {
  width: 100px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.target {
  background: var(--l-accent-a5);
  animation: test;
  animation-timeline: view();
  position: absolute;
  top: 500px;
  left: 0;
  transform: scaleX(calc(1 + var(--dev-progress)));
  animation-range: v-bind(rangeStart) v-bind(rangeEnd);
}
.example {
  outline: 1px dashed var(--l-gray-a8);
  transform: translateX(200px);
}
.vline {
  position: absolute;
  width: 1px;
  background: var(--l-gray-a8);
  top: 0;
  height: 300px;
}
.hline {
  position: absolute;
}
</style>
