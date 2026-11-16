<script setup>
// 首页：公告卡片（来自后端）+ 功能宫格 + 热门跑腿需求
import { ref, onMounted } from 'vue'
import { gridEntries, services, announcement as fallbackAnnouncement } from '../data/mock'
import { api } from '../api'

defineEmits(['nav'])

// 公告：默认用本地数据，接口返回后覆盖（接口挂了也不影响页面）
const announcement = ref(fallbackAnnouncement)

onMounted(async () => {
  try {
    const list = await api.get('/announcements')
    if (list?.length) announcement.value = list[0]
  } catch (e) {
    // 后端未启动时保持本地示例数据
  }
})

// 首页展示前 3 条跑腿需求
const hotErrands = services.errand.items.slice(0, 3)

// 标签配色：紧急红 / 有偿黄 / 免费绿
function tagClass(t) {
  if (t === '紧急') return 'bg-red-50 text-red-500'
  if (t === '有偿') return 'bg-amber-50 text-amber-500'
  return 'bg-green-50 text-green-600'
}
</script>

<template>
  <div class="px-4 pt-3">
    <!-- 社区公告卡片（绿色渐变） -->
    <div class="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-4 text-white relative overflow-hidden shadow-sm">
      <span class="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs">📣 {{ announcement.tag }}</span>
      <h3 class="mt-2.5 text-lg font-bold">{{ announcement.title }}</h3>
      <p class="mt-1.5 text-xs text-white/80">{{ announcement.desc }}</p>
    </div>

    <!-- 8 宫格功能入口（两行四列） -->
    <div class="grid grid-cols-4 gap-2.5 mt-4">
      <button
        v-for="g in gridEntries"
        :key="g.key"
        class="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white shadow-sm active:scale-95 transition-transform"
        @click="$emit('nav', g.key)"
      >
        <span class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="g.bg">{{ g.icon }}</span>
        <span class="text-[11px] text-gray-700">{{ g.label }}</span>
      </button>
    </div>

    <!-- 跑腿代办热门需求区块 -->
    <div class="mt-5">
      <div class="flex items-center justify-between mb-2.5">
        <h3 class="font-bold text-gray-800 flex items-center gap-1.5"><span>🏃</span>跑腿代办</h3>
        <button class="text-primary text-sm" @click="$emit('nav', 'errand')">更多 ›</button>
      </div>

      <div class="space-y-2.5">
        <div
          v-for="(item, i) in hotErrands"
          :key="i"
          class="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm"
        >
          <span class="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-2xl shrink-0">{{ item.icon }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-800 text-[15px] truncate">{{ item.title }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ item.who }}　{{ item.time }}</p>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full shrink-0" :class="tagClass(item.tags[0])">{{ item.tags[0] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
