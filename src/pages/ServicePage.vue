<script setup>
// 服务类目通用页面：跑腿代办 / 儿童看护 / 陪同就医 / 邻里互助
import { ref, computed } from 'vue'
import { services } from '../data/mock'

const props = defineProps({
  serviceKey: { type: String, required: true }
})

// 当前选中的筛选标签
const active = ref('全部')

// 当前服务对象（跟随 serviceKey 变化）
const svc = computed(() => services[props.serviceKey])

// 筛选逻辑：
//  - 全部 → 不过滤
//  - 紧急 → 含「紧急」标签
//  - 普通 → 不含「紧急」标签
//  - 邻里互助的分类（教育辅导/宠物照看/其他）→ 按 category 匹配
const filtered = computed(() => {
  const f = active.value
  if (f === '全部') return svc.value.items
  if (f === '紧急') return svc.value.items.filter(i => i.tags.includes('紧急'))
  if (f === '普通') return svc.value.items.filter(i => !i.tags.includes('紧急'))
  return svc.value.items.filter(i => i.category === f)
})

// 切换服务类目时重置筛选
function watchKey() { active.value = '全部' }
defineExpose({ watchKey })

// 标签配色
function tagClass(t) {
  if (t === '紧急') return 'bg-red-50 text-red-500'
  if (t === '有偿') return 'bg-amber-50 text-amber-500'
  if (t === '免费') return 'bg-green-50 text-green-600'
  return 'bg-gray-100 text-gray-500'
}
</script>

<template>
  <div class="px-4 pt-3">
    <!-- 四个服务类目切换入口 -->
    <div class="flex gap-2 mb-3">
      <button
        v-for="s in services"
        :key="s.key"
        class="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl text-[11px] transition-colors"
        :class="s.key === serviceKey ? 'bg-white shadow-sm text-primary font-semibold' : 'text-gray-500'"
        @click="$emit('switch-service', s.key); watchKey()"
      >
        <span class="text-lg">{{ s.icon }}</span>{{ s.title }}
      </button>
    </div>

    <!-- 页面标题 -->
    <h2 class="text-xl font-extrabold text-gray-800 flex items-center gap-2 mb-3">
      <span>{{ svc.icon }}</span>{{ svc.title }}
    </h2>

    <!-- 筛选标签行 -->
    <div class="flex gap-2.5 mb-4">
      <button
        v-for="f in svc.filters"
        :key="f"
        class="px-4 py-1.5 rounded-full text-sm transition-colors"
        :class="active === f ? 'bg-primary text-white' : 'bg-white text-gray-600 shadow-sm'"
        @click="active = f"
      >{{ f }}</button>
    </div>

    <!-- 需求列表卡片 -->
    <div class="space-y-3">
      <div
        v-for="(item, i) in filtered"
        :key="i"
        class="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm"
      >
        <span class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-2xl shrink-0">{{ item.icon }}</span>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-gray-800">{{ item.title }}</p>
          <p class="text-xs text-gray-400 mt-1.5">{{ item.who }}　{{ item.time }}</p>
        </div>
        <!-- 右侧状态标签 -->
        <span class="text-xs px-2.5 py-1 rounded-full shrink-0" :class="tagClass(item.tags[0])">{{ item.tags[0] }}</span>
      </div>

      <p v-if="!filtered.length" class="text-center text-gray-400 text-sm py-8">暂无相关需求</p>
    </div>

    <!-- 底部发布按钮（绿色大圆角） -->
    <button
      class="w-full mt-5 py-3.5 rounded-full bg-primary text-white font-bold text-[15px] shadow active:bg-primary-dark"
      @click="$emit('publish')"
    >＋ {{ svc.publish }}</button>
  </div>
</template>
