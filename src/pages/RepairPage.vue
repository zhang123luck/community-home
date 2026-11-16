<script setup>
// 物业报修页面：后端列表 + 状态筛选 + 居民提交报修
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'

const emit = defineEmits(['back', 'toast'])

const filters = ['全部', '处理中', '已完成']
const active = ref('全部')

const list = ref([])
const loading = ref(false)

// 报修提交弹窗
const showForm = ref(false)
const submitting = ref(false)
const form = ref({ title: '', house: '', contact: '', content: '' })

// 状态圆点配色：待处理红 / 已派单·维修中黄 / 已完成绿
function dotClass(status) {
  if (status === '待处理') return 'bg-red-500'
  if (status === '已完成') return 'bg-green-500'
  return 'bg-amber-500'
}

// 筛选：处理中 = 未完成的所有单据
const filtered = computed(() => {
  if (active.value === '全部') return list.value
  if (active.value === '已完成') return list.value.filter(r => r.status === '已完成')
  return list.value.filter(r => r.status !== '已完成')
})

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

// 提交报修到后端
async function submit() {
  if (!form.value.title.trim()) return emit('toast', '请填写报修标题')
  submitting.value = true
  try {
    await api.post('/repairs', form.value)
    form.value = { title: '', house: '', contact: '', content: '' }
    showForm.value = false
    emit('toast', '报修已提交，物业会尽快处理')
    await load()
  } catch (e) {
    emit('toast', e.message)
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="px-4 pt-3">
    <!-- 返回按钮 + 标题 -->
    <button class="text-gray-500 text-sm mb-1" @click="emit('back')">‹ 返回</button>
    <h2 class="text-xl font-extrabold text-gray-800 flex items-center gap-2 mb-3">
      <span>🔧</span>物业报修与服务
    </h2>

    <!-- 筛选标签 -->
    <div class="flex gap-2.5 mb-4">
      <button
        v-for="f in filters"
        :key="f"
        class="px-4 py-1.5 rounded-full text-sm transition-colors"
        :class="active === f ? 'bg-primary text-white' : 'bg-white text-gray-600 shadow-sm'"
        @click="active = f"
      >{{ f }}</button>
    </div>

    <!-- 报修列表：状态圆点 + 标题 + 日期状态 + 箭头 -->
    <div class="space-y-3">
      <div
        v-for="r in filtered"
        :key="r.id"
        class="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
      >
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="dotClass(r.status)"></span>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-gray-800 text-[15px]">{{ r.title }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ r.date }}　{{ r.status }}</p>
        </div>
        <span class="text-gray-300 shrink-0">›</span>
      </div>

      <p v-if="loading" class="text-center text-gray-400 text-sm py-6">加载中...</p>
      <p v-else-if="!filtered.length" class="text-center text-gray-400 text-sm py-8">暂无报修单</p>
    </div>

    <!-- 一键报修按钮 -->
    <button
      class="w-full mt-5 py-3.5 rounded-full bg-primary text-white font-bold text-[15px] shadow active:bg-primary-dark"
      @click="showForm = true"
    >＋ 提交报修</button>
  </div>

  <!-- 报修提交弹窗 -->
  <div v-if="showForm" class="absolute inset-0 bg-black/40 z-40" @click="showForm = false">
    <div class="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl px-5 pt-6 pb-8" @click.stop>
      <h3 class="text-center text-lg font-bold text-gray-800 mb-4">提交报修</h3>
      <input v-model="form.title" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3 outline-none" placeholder="报修事项，如：厨房水龙头漏水" />
      <div class="flex gap-3 mb-3">
        <input v-model="form.house" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" placeholder="房号，如 3栋 502" />
        <input v-model="form.contact" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" placeholder="联系电话" />
      </div>
      <textarea v-model="form.content" rows="3" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5 outline-none resize-none" placeholder="问题描述（选填）"></textarea>
      <div class="flex gap-3">
        <button class="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-semibold" @click="showForm = false">取消</button>
        <button class="flex-1 py-3 rounded-full bg-primary text-white font-semibold disabled:opacity-60" :disabled="submitting" @click="submit">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
      </div>
    </div>
  </div>
</template>
