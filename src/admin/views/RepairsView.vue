<script setup>
// 物业报修管理：查看全部报修单并修改处理状态
import { ref, computed, onMounted } from 'vue'
import { api } from '../../api'

const props = defineProps({ token: String })
const emit = defineEmits(['toast'])

const list = ref([])
const loading = ref(false)
const filter = ref('全部')
const statuses = ['待处理', '已派单', '维修中', '已完成']
const filters = ['全部', ...statuses]

const filtered = computed(() =>
  filter.value === '全部' ? list.value : list.value.filter(r => r.status === filter.value)
)

// 状态统计
const stats = computed(() => ({
  待处理: list.value.filter(r => r.status === '待处理').length,
  已派单: list.value.filter(r => r.status === '已派单').length,
  维修中: list.value.filter(r => r.status === '维修中').length,
  已完成: list.value.filter(r => r.status === '已完成').length
}))

async function load() {
  loading.value = true
  try {
    list.value = await api.get('/repairs')
  } catch (e) {
    emit('toast', e.message)
  } finally {
    loading.value = false
  }
}

// 修改状态（待处理 → 已派单 → 维修中 → 已完成）
async function changeStatus(item, status) {
  const old = item.status
  item.status = status
  try {
    await api.patch(`/repairs/${item.id}`, { status }, props.token)
    emit('toast', `「${item.title}」已标记为 ${status}`)
  } catch (e) {
    item.status = old
    emit('toast', e.message)
  }
}

function dotClass(status) {
  if (status === '待处理') return 'bg-red-500'
  if (status === '已完成') return 'bg-green-500'
  return 'bg-amber-500'
}

onMounted(load)
</script>

<template>
  <div class="max-w-4xl space-y-5">
    <!-- 状态统计 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="(v, k) in stats" :key="k" class="bg-white rounded-2xl p-4 shadow-sm">
        <p class="text-2xl font-extrabold" :class="k === '待处理' ? 'text-red-500' : k === '已完成' ? 'text-primary' : 'text-amber-500'">{{ v }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ k }}</p>
      </div>
    </div>

    <!-- 列表 -->
    <section class="bg-white rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="f in filters"
            :key="f"
            class="px-3 py-1.5 rounded-lg text-sm"
            :class="filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'"
            @click="filter = f"
          >{{ f }}</button>
        </div>
        <button class="text-sm text-gray-400 hover:text-primary" @click="load">刷新</button>
      </div>

      <p v-if="loading" class="text-sm text-gray-400 py-6 text-center">加载中...</p>
      <p v-else-if="!filtered.length" class="text-sm text-gray-400 py-6 text-center">暂无报修单</p>

      <div v-else class="divide-y divide-gray-100">
        <div v-for="item in filtered" :key="item.id" class="py-3.5 flex items-center gap-3">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="dotClass(item.status)"></span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-800 text-sm">{{ item.title }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ item.date }} · {{ item.house || '未填写房号' }} · {{ item.contact || '无联系方式' }}
            </p>
            <p v-if="item.content" class="text-xs text-gray-500 mt-1 truncate">{{ item.content }}</p>
          </div>
          <select
            :value="item.status"
            class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none shrink-0"
            @change="changeStatus(item, $event.target.value)"
          >
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
    </section>
  </div>
</template>
