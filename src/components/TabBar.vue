<script setup>
// 底部固定导航栏：首页 / 服务 / 合作 / 我的
defineProps({
  tab: { type: String, required: true }
})
const emit = defineEmits(['switch'])

// 四个 tab 配置（emoji 图标还原截图视觉）
const tabs = [
  { key: 'home',    icon: '🏠', label: '首页' },
  { key: 'service', icon: '🏃', label: '服务' },
  { key: 'coop',    icon: '🏢', label: '合作' },
  { key: 'profile', icon: '👤', label: '我的' }
]
</script>

<template>
  <nav class="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 flex pt-1.5 pb-5 z-30">
    <button
      v-for="t in tabs"
      :key="t.key"
      class="flex-1 flex flex-col items-center gap-0.5"
      @click="emit('switch', t.key)"
    >
      <span class="text-2xl leading-none">{{ t.icon }}</span>
      <!-- 选中态文字为绿色 -->
      <span
        class="text-xs"
        :class="tab === t.key ? 'text-primary font-semibold' : 'text-gray-500'"
      >{{ t.label }}</span>
    </button>
  </nav>
</template>
