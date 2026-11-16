<script setup>
// 社区投票页面：后端投票数据 + 进度条 + 参与投票 + 倒计时
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'

const emit = defineEmits(['back', 'toast'])

const vote = ref(null)
const loading = ref(false)
const voting = ref(false)

// 记录本机已投过的投票（避免重复投票）
const VOTED_KEY = 'voted_votes'
function votedIds() {
  try { return JSON.parse(localStorage.getItem(VOTED_KEY) || '[]') } catch { return [] }
}
function markVoted(id) {
  const ids = votedIds()
  if (!ids.includes(id)) localStorage.setItem(VOTED_KEY, JSON.stringify([...ids, id]))
}
const hasVoted = computed(() => !!(vote.value && votedIds().includes(vote.value.id)))

// 总票数，用于计算进度条宽度
const total = computed(() => vote.value?.options.reduce((s, o) => s + o.votes, 0) || 0)

async function load() {
  loading.value = true
  try {
    const list = await api.get('/votes')
    // 优先展示进行中的投票
    vote.value = list.find(v => v.status === 'open') || list[0] || null
  } catch (e) {
    emit('toast', e.message)
  } finally {
    loading.value = false
  }
}

// 投票
async function cast(index) {
  if (!vote.value || voting.value) return
  if (vote.value.status !== 'open') return emit('toast', '该投票已结束')
  if (hasVoted.value) return emit('toast', '你已经投过票啦')
  voting.value = true
  try {
    await api.post(`/votes/${vote.value.id}/vote`, { optionIndex: index })
    markVoted(vote.value.id)
    emit('toast', '投票成功，感谢参与')
    await load()
  } catch (e) {
    emit('toast', e.message)
  } finally {
    voting.value = false
  }
}

function percent(o) {
  return total.value ? (o.votes / total.value) * 100 : 0
}

onMounted(load)
</script>

<template>
  <div class="px-4 pt-3">
    <button class="text-gray-500 text-sm mb-1" @click="emit('back')">‹ 返回</button>
    <h2 class="text-xl font-extrabold text-gray-800 flex items-center gap-2 mb-4">
      <span>📋</span>社区事项投票
    </h2>

    <p v-if="loading" class="text-center text-gray-400 text-sm py-8">加载中...</p>
    <p v-else-if="!vote" class="text-center text-gray-400 text-sm py-8">暂无进行中的投票</p>

    <!-- 投票主题卡片 -->
    <div v-else class="bg-white rounded-2xl p-4 shadow-sm">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-bold text-gray-800">{{ vote.title }}</h3>
        <span class="text-xs px-2 py-0.5 rounded-full shrink-0" :class="vote.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'">
          {{ vote.status === 'open' ? '进行中' : '已结束' }}
        </span>
      </div>
      <p class="text-[13px] text-gray-500 mt-2 leading-relaxed">{{ vote.desc }}</p>

      <!-- 选项 + 进度条（点击即投票） -->
      <div class="mt-4 space-y-4">
        <button
          v-for="(o, i) in vote.options"
          :key="o.label"
          class="block w-full text-left"
          :disabled="hasVoted || vote.status !== 'open'"
          @click="cast(i)"
        >
          <div class="flex justify-between text-sm mb-1.5">
            <span class="text-gray-700">{{ o.label }}</span>
            <span class="font-bold text-primary">{{ o.votes }} 票 · {{ Math.round(percent(o)) }}%</span>
          </div>
          <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all" :style="{ width: percent(o) + '%' }"></div>
          </div>
        </button>
      </div>

      <p class="text-xs text-gray-400 mt-3">
        {{ hasVoted ? '✅ 你已完成投票' : (vote.status === 'open' ? '点击选项即可投票' : '投票已结束') }}
      </p>

      <!-- 底部：倒计时 + 参与人数 -->
      <div class="border-t border-gray-100 mt-4 pt-3 flex justify-between text-xs text-gray-400">
        <span>⏳ 距投票结束还剩 {{ vote.deadline }}</span>
        <span>{{ total }} 人已参与</span>
      </div>
    </div>
  </div>
</template>
