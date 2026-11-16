<script setup>
// 物业建议管理：查看居民建议、修改处理状态、填写回复
import { ref, computed, onMounted } from 'vue'
import { api } from '../../api'

const props = defineProps({ token: String })
const emit = defineEmits(['toast'])

const list = ref([])
const loading = ref(false)
const filter = ref('全部')
const statuses = ['待处理', '处理中', '已处理']

const filtered = computed(() =>
  filter.value === '全部' ? list.value : list.value.filter(s => s.status === filter.value)
)

// 回复草稿：id -> 文本
const drafts = ref({})

async function load() {
  loading.value = true
  try {
    list.value = await api.get('/suggestions', props.token)
    // 初始化回复草稿
    const d = {}
    list.value.forEach(s => { d[s.id] = s.reply || '' })
    drafts.value = d
  } catch (e) {
    emit('toast', e.message)
  } finally {
    loading.value = false
  }
}

async function save(item, patch) {
  try {
    await api.patch(`/suggestions/${item.id}`, patch, props.token)
    emit('toast', '已保存')
    await load()
  } catch (e) {
    emit('toast', e.message)
  }
}

function timeText(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(load)
</script>

<template>
  <div class="max-w-4xl space-y-5">
    <section class="bg-white rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="f in ['全部', ...statuses]"
            :key="f"
            class="px-3 py-1.5 rounded-lg text-sm"
            :class="filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'"
            @click="filter = f"
          >{{ f }}</button>
        </div>
        <button class="text-sm text-gray-400 hover:text-primary" @click="load">刷新</button>
      </div>

      <p v-if="loading" class="text-sm text-gray-400 py-6 text-center">加载中...</p>
      <p v-else-if="!filtered.length" class="text-sm text-gray-400 py-6 text-center">暂无建议</p>

      <div v-else class="space-y-4">
        <div v-for="s in filtered" :key="s.id" class="border border-gray-100 rounded-xl p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{{ s.type }}</span>
                <span class="text-xs text-gray-400">{{ timeText(s.createdAt) }}</span>
              </div>
              <p class="text-sm text-gray-700 mt-2 leading-relaxed">{{ s.content }}</p>
            </div>
            <select
              :value="s.status"
              class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none shrink-0"
              @change="save(s, { status: $event.target.value })"
            >
              <option v-for="st in statuses" :key="st" :value="st">{{ st }}</option>
            </select>
          </div>

          <!-- 物业回复 -->
          <div class="mt-3 flex gap-2">
            <input
              v-model="drafts[s.id]"
              class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-primary"
              placeholder="填写物业回复内容..."
            />
            <button class="px-4 py-2 rounded-xl bg-primary text-white text-sm" @click="save(s, { reply: drafts[s.id] })">保存回复</button>
          </div>
          <p v-if="s.reply" class="text-xs text-gray-500 mt-2">当前回复：{{ s.reply }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
