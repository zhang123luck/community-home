<script setup>
// ============================================================
// 服务类目通用页面：跑腿代办 / 儿童看护 / 陪同就医 / 邻里互助
// 数据来自接口（静态托管时走浏览器本地数据层），发布后立即出现在列表
// ============================================================
import { ref, computed, onMounted, watch } from 'vue'
import { services } from '../data/mock'
import { api } from '../api'
import PublishDemandModal from '../components/PublishDemandModal.vue'

const props = defineProps({
  serviceKey: { type: String, required: true }
})
const emit = defineEmits(['switch-service', 'toast'])

// 当前选中的筛选标签
const active = ref('全部')
// 需求列表
const items = ref([])
const loading = ref(false)
// 发布弹窗
const showPublish = ref(false)
// 正在接单的需求 id（防重复点击）
const taking = ref('')

// 当前服务类目的配置（图标、标题、筛选标签、按钮文案）
const svc = computed(() => services[props.serviceKey])

// 读取该类目的需求列表
async function load() {
  loading.value = true
  try {
    items.value = await api.get(`/demands?type=${props.serviceKey}`)
  } catch (e) {
    // 后端不可用时降级为内置示例（仅展示，不影响其它功能）
    items.value = []
    emit('toast', '数据加载失败：' + e.message)
  } finally {
    loading.value = false
  }
}

onMounted(load)
// 切换类目：重置筛选并重新加载
watch(() => props.serviceKey, () => {
  active.value = '全部'
  load()
})

// 筛选逻辑：
//  - 全部 → 不过滤
//  - 紧急 → 含「紧急」标签
//  - 普通 → 不含「紧急」标签
//  - 邻里互助的分类（教育辅导/宠物照看/其他）→ 按 category 匹配
const filtered = computed(() => {
  const f = active.value
  if (f === '全部') return items.value
  if (f === '紧急') return items.value.filter(i => (i.tags || []).includes('紧急'))
  if (f === '普通') return items.value.filter(i => !(i.tags || []).includes('紧急'))
  return items.value.filter(i => i.category === f)
})

// 标签配色
function tagClass(t) {
  if (t === '紧急') return 'bg-red-50 text-red-500'
  if (t === '有偿') return 'bg-amber-50 text-amber-500'
  if (t === '免费') return 'bg-green-50 text-green-600'
  return 'bg-gray-100 text-gray-500'
}

// 发布需求
async function submitPublish(payload) {
  try {
    await api.post('/demands', payload)
    showPublish.value = false
    emit('toast', '发布成功，已展示在需求列表')
    await load()
  } catch (e) {
    emit('toast', e.message)
  }
}

// 接单
async function take(item) {
  if (taking.value) return
  taking.value = item.id
  try {
    await api.post(`/demands/${item.id}/take`)
    emit('toast', '接单成功，请尽快联系邻居')
    await load()
  } catch (e) {
    emit('toast', e.message)
  } finally {
    taking.value = ''
  }
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
        @click="$emit('switch-service', s.key)"
      >
        <span class="text-lg">{{ s.icon }}</span>{{ s.title }}
      </button>
    </div>

    <!-- 页面标题 -->
    <h2 class="text-xl font-extrabold text-gray-800 flex items-center gap-2 mb-3">
      <span>{{ svc.icon }}</span>{{ svc.title }}
    </h2>

    <!-- 筛选标签行 -->
    <div class="flex gap-2.5 mb-4 flex-wrap">
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
        v-for="item in filtered"
        :key="item.id"
        class="bg-white rounded-2xl p-4 shadow-sm"
      >
        <div class="flex items-start gap-3">
          <span class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-2xl shrink-0">{{ item.icon }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-800 leading-snug">{{ item.title }}</p>
            <p class="text-xs text-gray-400 mt-1.5">{{ item.who }}　{{ item.time }}</p>
            <p v-if="item.desc" class="text-xs text-gray-500 mt-2 leading-relaxed">{{ item.desc }}</p>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full shrink-0" :class="tagClass((item.tags || [])[0])">{{ (item.tags || [])[0] }}</span>
        </div>

        <!-- 底部：分类标签 + 接单按钮 -->
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div class="flex items-center gap-2">
            <span v-if="item.category" class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{{ item.category }}</span>
            <span v-if="item.reward" class="text-xs text-amber-500 font-semibold">悬赏 ¥{{ item.reward }}</span>
            <span class="text-xs" :class="item.status === '已接单' ? 'text-gray-400' : 'text-primary'">{{ item.status || '待接单' }}</span>
          </div>
          <button
            v-if="item.status !== '已接单'"
            class="text-xs px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold active:bg-primary/20"
            @click="take(item)"
          >我来帮忙</button>
          <span v-else class="text-xs text-gray-400">已被邻居接单</span>
        </div>
      </div>

      <p v-if="loading" class="text-center text-gray-400 text-sm py-8">加载中...</p>
      <p v-else-if="!filtered.length" class="text-center text-gray-400 text-sm py-8">暂无相关需求</p>
    </div>

    <!-- 底部发布按钮（绿色大圆角） -->
    <button
      class="w-full mt-5 py-3.5 rounded-full bg-primary text-white font-bold text-[15px] shadow active:bg-primary-dark"
      @click="showPublish = true"
    >＋ {{ svc.publish }}</button>

    <!-- 发布需求弹窗 -->
    <PublishDemandModal
      v-if="showPublish"
      :service-key="serviceKey"
      :service-title="svc.title"
      @close="showPublish = false"
      @submit="submitPublish"
    />
  </div>
</template>
