<script setup>
// 社区投票管理：发起投票 / 查看票数 / 结束投票
import { ref, onMounted } from 'vue'
import { api } from '../../api'

const props = defineProps({ token: String })
const emit = defineEmits(['toast'])

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
// 选项用换行分隔，提交时拆成数组
const form = ref({ title: '', desc: '', optionsText: '同意增设\n不同意\n弃权', deadline: '7 天' })

async function load() {
  loading.value = true
  try {
    list.value = await api.get('/votes')
  } catch (e) {
    emit('toast', e.message)
  } finally {
    loading.value = false
  }
}

async function create() {
  const options = form.value.optionsText.split('\n').map(s => s.trim()).filter(Boolean)
  if (!form.value.title.trim()) return emit('toast', '请填写投票主题')
  if (options.length < 2) return emit('toast', '至少需要 2 个选项')
  submitting.value = true
  try {
    await api.post('/votes', { ...form.value, options }, props.token)
    form.value = { title: '', desc: '', optionsText: '同意增设\n不同意\n弃权', deadline: '7 天' }
    emit('toast', '投票已发起，居民端可参与')
    await load()
  } catch (e) {
    emit('toast', e.message)
  } finally {
    submitting.value = false
  }
}

async function toggleStatus(v) {
  const next = v.status === 'open' ? 'closed' : 'open'
  try {
    await api.patch(`/votes/${v.id}`, { status: next }, props.token)
    emit('toast', next === 'closed' ? '投票已结束' : '投票已重新开启')
    await load()
  } catch (e) {
    emit('toast', e.message)
  }
}

function percent(o, total) {
  return total ? (o.votes / total) * 100 : 0
}

onMounted(load)
</script>

<template>
  <div class="max-w-4xl space-y-5">
    <!-- 发起投票 -->
    <section class="bg-white rounded-2xl p-5 shadow-sm">
      <h2 class="font-bold text-gray-800 mb-4">发起社区投票</h2>
      <div class="grid gap-3">
        <input v-model="form.title" class="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="投票主题，如：关于增设非机动车充电棚的表决" />
        <textarea v-model="form.desc" rows="2" class="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none" placeholder="投票说明（可选）"></textarea>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <textarea v-model="form.optionsText" rows="4" class="md:col-span-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none" placeholder="每行一个选项"></textarea>
          <div>
            <input v-model="form.deadline" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="截止倒计时文案" />
            <p class="text-xs text-gray-400 mt-2 leading-relaxed">选项每行一个，至少 2 个；倒计时仅用于展示，如「7 天」。</p>
          </div>
        </div>
        <div class="flex justify-end">
          <button class="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60" :disabled="submitting" @click="create">
            {{ submitting ? '提交中...' : '发起投票' }}
          </button>
        </div>
      </div>
    </section>

    <!-- 投票列表 -->
    <section class="bg-white rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-gray-800">投票列表（{{ list.length }}）</h2>
        <button class="text-sm text-gray-400 hover:text-primary" @click="load">刷新</button>
      </div>

      <p v-if="loading" class="text-sm text-gray-400 py-6 text-center">加载中...</p>
      <p v-else-if="!list.length" class="text-sm text-gray-400 py-6 text-center">还没有进行中的投票</p>

      <div v-else class="space-y-4">
        <div v-for="v in list" :key="v.id" class="border border-gray-100 rounded-xl p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-bold text-gray-800">{{ v.title }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ v.desc }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs px-2.5 py-1 rounded-full" :class="v.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'">
                {{ v.status === 'open' ? '进行中' : '已结束' }}
              </span>
              <button class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" @click="toggleStatus(v)">
                {{ v.status === 'open' ? '结束投票' : '重新开启' }}
              </button>
            </div>
          </div>

          <div class="mt-3 space-y-2.5">
            <div v-for="o in v.options" :key="o.label">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600">{{ o.label }}</span>
                <span class="text-gray-500">{{ o.votes }} 票 · {{ Math.round(percent(o, v.total)) }}%</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full" :style="{ width: percent(o, v.total) + '%' }"></div>
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-400 mt-3">共 {{ v.total }} 票 · 截止 {{ v.deadline }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
