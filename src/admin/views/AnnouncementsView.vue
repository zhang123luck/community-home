<script setup>
// 社区公告管理：发布 / 上下架 / 删除
import { ref, onMounted } from 'vue'
import { api } from '../../api'

const props = defineProps({ token: String })
const emit = defineEmits(['toast'])

const list = ref([])
const loading = ref(false)
const form = ref({ tag: '社区公告', title: '', desc: '' })
const submitting = ref(false)

async function load() {
  loading.value = true
  try {
    list.value = await api.get('/announcements?all=1', props.token)
  } catch (e) {
    emit('toast', e.message)
  } finally {
    loading.value = false
  }
}

async function create() {
  if (!form.value.title.trim()) return emit('toast', '请填写公告标题')
  submitting.value = true
  try {
    await api.post('/announcements', form.value, props.token)
    form.value = { tag: '社区公告', title: '', desc: '' }
    emit('toast', '公告已发布，居民端首页立即可见')
    await load()
  } catch (e) {
    emit('toast', e.message)
  } finally {
    submitting.value = false
  }
}

async function toggle(item) {
  try {
    await api.patch(`/announcements/${item.id}`, { active: !item.active }, props.token)
    emit('toast', item.active ? '已下架' : '已重新上架')
    await load()
  } catch (e) {
    emit('toast', e.message)
  }
}

async function remove(item) {
  if (!confirm(`确定删除公告「${item.title}」吗？`)) return
  try {
    await api.del(`/announcements/${item.id}`, props.token)
    emit('toast', '已删除')
    await load()
  } catch (e) {
    emit('toast', e.message)
  }
}

onMounted(load)
</script>

<template>
  <div class="max-w-4xl space-y-5">
    <!-- 发布表单 -->
    <section class="bg-white rounded-2xl p-5 shadow-sm">
      <h2 class="font-bold text-gray-800 mb-4">发布社区公告</h2>
      <div class="grid gap-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input v-model="form.tag" class="md:col-span-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="标签，如：社区公告" />
          <input v-model="form.title" class="md:col-span-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="公告标题，如：本周六社区便民义诊活动" />
        </div>
        <textarea
          v-model="form.desc"
          rows="3"
          class="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
          placeholder="摘要内容，如：6月21日 9:00-16:00 小区中心广场，免费测血压血糖..."
        ></textarea>
        <div class="flex justify-end">
          <button class="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60" :disabled="submitting" @click="create">
            {{ submitting ? '发布中...' : '发布公告' }}
          </button>
        </div>
      </div>
    </section>

    <!-- 公告列表 -->
    <section class="bg-white rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-gray-800">公告列表（{{ list.length }}）</h2>
        <button class="text-sm text-gray-400 hover:text-primary" @click="load">刷新</button>
      </div>

      <p v-if="loading" class="text-sm text-gray-400 py-6 text-center">加载中...</p>
      <p v-else-if="!list.length" class="text-sm text-gray-400 py-6 text-center">还没有公告，先发布一条吧</p>

      <div v-else class="space-y-3">
        <div v-for="item in list" :key="item.id" class="border border-gray-100 rounded-xl p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{{ item.tag }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="item.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'">
                  {{ item.active ? '展示中' : '已下架' }}
                </span>
              </div>
              <p class="font-bold text-gray-800 mt-2">{{ item.title }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" @click="toggle(item)">
                {{ item.active ? '下架' : '上架' }}
              </button>
              <button class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" @click="remove(item)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
