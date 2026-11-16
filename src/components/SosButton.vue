<script setup>
// 右下角固定 SOS 紧急求助悬浮按钮
const emit = defineEmits(['sos'])
</script>

<template>
  <button
    class="sos-pulse absolute right-4 bottom-24 w-16 h-16 rounded-full bg-[#e2582f] text-white font-extrabold text-lg z-20 border-4 border-[#e2582f]/60 shadow-lg"
    @click="emit('sos')"
  >SOS</button>
</template>
