<script setup>
// ============================================================
// 物业管理后台外壳：登录态管理 + 左侧导航 + 各管理模块
// ============================================================
import { ref, computed, onMounted } from 'vue'
import LoginView from './views/LoginView.vue'
import AnnouncementsView from './views/AnnouncementsView.vue'
import RepairsView from './views/RepairsView.vue'
import VotesView from './views/VotesView.vue'
import SuggestionsView from './views/SuggestionsView.vue'
import { api, getToken, clearToken } from '../api'

// 已登录 token
const token = ref(getToken())
// 当前模块
const menu = ref('announcements')

const menus = [
  { key: 'announcements', icon: '📣', label: '社区公告' },
  { key: 'repairs',       icon: '🔧', label: '物业报修' },
  { key: 'votes',         icon: '📋', label: '社区投票' },
  { key: 'suggestions',   icon: '💡', label: '物业建议' }
]

const currentLabel = computed(() => menus.find(m => m.key === menu.value)?.label || '')

function onLogin(t) {
  token.value = t
  menu.value = 'announcements'
}

async function logout() {
  try { await api.post('/admin/logout', {}, token.value) } catch { /* 忽略 */ }
  clearToken()
  token.value = ''
}

// 全局轻提示（子模块通过 defineExpose 之外的简单方案：事件总线式 props 不需要，直接页面内提示）
const toast = ref('')
let timer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(timer)
  timer = setTimeout(() => (toast.value = ''), 2200)
}

onMounted(() => {
  // 校验本地 token 是否仍有效（无效则回登录页）
  if (token.value) {
    api.get('/suggestions', token.value).catch(() => {
      clearToken()
      token.value = ''
    })
  }
})
</script>

<template>
  <!-- 未登录：登录页 -->
  <LoginView v-if="!token" @login="onLogin" />

  <!-- 已登录：后台布局（宽屏左导航 / 窄屏顶部导航） -->
  <div v-else class="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
    <!-- 导航区 -->
    <aside class="w-full lg:w-56 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col shrink-0">
      <div class="hidden lg:block px-5 py-5 border-b border-gray-100">
        <p class="text-lg font-extrabold text-gray-800 flex items-center gap-1.5">🏘️ 社区家园</p>
        <p class="text-xs text-gray-400 mt-1">物业管理后台 · 翡翠花园小区</p>
      </div>
      <nav class="flex lg:flex-col gap-1.5 p-3 overflow-x-auto lg:overflow-visible lg:flex-1 no-scrollbar">
        <button
          v-for="m in menus"
          :key="m.key"
          class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-colors text-left whitespace-nowrap shrink-0 lg:w-full"
          :class="menu === m.key ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50'"
          @click="menu = m.key"
        ><span>{{ m.icon }}</span>{{ m.label }}</button>
      </nav>
      <div class="hidden lg:block p-3 border-t border-gray-100">
        <p class="text-xs text-gray-400 px-2 mb-2">当前账号：root（物业管理员）</p>
        <button class="w-full text-sm px-3.5 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200" @click="logout">退出登录</button>
      </div>
    </aside>

    <!-- 内容区 -->
    <div class="flex-1 min-w-0 flex flex-col">
      <header class="bg-white border-b border-gray-100 px-4 md:px-6 py-3.5 flex justify-between items-center gap-3">
        <h1 class="text-base md:text-lg font-bold text-gray-800">{{ currentLabel }}</h1>
        <div class="flex items-center gap-3 shrink-0">
          <a href="/" target="_blank" class="text-sm text-primary hover:underline">查看居民端 ↗</a>
          <button class="lg:hidden text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600" @click="logout">退出</button>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <AnnouncementsView v-if="menu === 'announcements'" :token="token" @toast="showToast" />
        <RepairsView v-else-if="menu === 'repairs'" :token="token" @toast="showToast" />
        <VotesView v-else-if="menu === 'votes'" :token="token" @toast="showToast" />
        <SuggestionsView v-else :token="token" @toast="showToast" />
      </main>
    </div>

    <!-- 提示条 -->
    <transition name="fade">
      <div v-if="toast" class="fixed top-5 left-1/2 -translate-x-1/2 bg-gray-900/85 text-white text-sm px-4 py-2 rounded-full z-50">{{ toast }}</div>
    </transition>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
