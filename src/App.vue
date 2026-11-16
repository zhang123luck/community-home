<script setup>
// ============================================================
// App.vue —— 社区家园（翡翠花园小区）主入口
// 负责：全局头部、tab 切换、子页面路由、弹窗与 Toast
// ============================================================
import { ref, computed, onMounted, onUnmounted } from 'vue'
import HomePage from './pages/HomePage.vue'
import ServicePage from './pages/ServicePage.vue'
import CoopPage from './pages/CoopPage.vue'
import ProfilePage from './pages/ProfilePage.vue'
import RepairPage from './pages/RepairPage.vue'
import VotePage from './pages/VotePage.vue'
import TabBar from './components/TabBar.vue'
import SosButton from './components/SosButton.vue'
import SuggestionModal from './components/SuggestionModal.vue'
import { community } from './data/mock'
import { api } from './api'

// 当前底部 tab
const tab = ref('home')
// 二级页面：null / 'repair' 物业报修 / 'vote' 社区投票
const subPage = ref(null)
// 服务 tab 当前类目（跑腿/看护/就医/互助）
const serviceKey = ref('errand')
// 物业建议弹窗
const showSuggestion = ref(false)
// 全局轻提示
const toast = ref('')
let toastTimer = null

// ---- 模拟手机状态栏时间（每 30 秒刷新） ----
const now = ref(new Date())
let clockTimer
onMounted(() => { clockTimer = setInterval(() => (now.value = new Date()), 30000) })
onUnmounted(() => clearInterval(clockTimer))
const timeText = computed(() => {
  const h = now.value.getHours()
  const m = String(now.value.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})

/**
 * 首页宫格导航分发
 * errand/child/medical/help → 服务类目页；coop → 合作 tab；
 * repair/vote → 二级页面；suggestion → 物业建议弹窗
 */
function nav(target) {
  if (target === 'repair' || target === 'vote') {
    subPage.value = target
    return
  }
  if (target === 'suggestion') {
    showSuggestion.value = true
    return
  }
  if (['errand', 'child', 'medical', 'help'].includes(target)) {
    serviceKey.value = target
    tab.value = 'service'
    subPage.value = null
    return
  }
  if (target === 'coop') {
    tab.value = 'coop'
    subPage.value = null
  }
}

// 切换底部 tab 时关闭二级页面
function switchTab(t) {
  tab.value = t
  subPage.value = null
}

// 轻提示（2 秒后自动消失）
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2000)
}

// 提交物业建议到后端
async function submitSuggestion(payload) {
  showSuggestion.value = false
  try {
    await api.post('/suggestions', payload)
    showToast('建议已提交，物业会尽快查看')
  } catch (e) {
    showToast(e.message)
  }
}
</script>

<template>
  <!-- 手机竖屏外壳 -->
  <div class="phone-frame">
    <!-- 模拟手机状态栏 -->
    <div class="flex justify-between items-center px-5 pt-3 pb-1 text-gray-800">
      <span class="font-semibold text-sm">{{ timeText }}</span>
      <span class="text-sm flex items-center gap-1">🏘️ {{ community.name }}</span>
    </div>

    <!-- 应用全局头部：绿色定位 + 标题 + 铃铛通知 -->
    <header class="flex justify-between items-center px-4 py-2.5">
      <h1 class="text-2xl font-extrabold text-gray-900 flex items-center gap-1.5">
        <span class="text-primary text-xl">📍</span>社区家园
      </h1>
      <button class="text-2xl" @click="showToast('暂无新通知')">🔔</button>
    </header>

    <!-- 主内容滚动区 -->
    <main class="flex-1 overflow-y-auto no-scrollbar pb-28">
      <!-- 二级页面：物业报修 -->
      <RepairPage
        v-if="subPage === 'repair'"
        @back="subPage = null"
        @toast="showToast"
      />
      <!-- 二级页面：社区投票 -->
      <VotePage
        v-else-if="subPage === 'vote'"
        @back="subPage = null"
        @toast="showToast"
      />
      <!-- 四个主 tab -->
      <HomePage v-else-if="tab === 'home'" @nav="nav" />
      <ServicePage
        v-else-if="tab === 'service'"
        :service-key="serviceKey"
        @switch-service="serviceKey = $event"
        @toast="showToast"
      />
      <CoopPage v-else-if="tab === 'coop'" @toast="showToast" />
      <ProfilePage v-else />
    </main>

    <!-- SOS 紧急求助悬浮按钮 -->
    <SosButton @sos="showToast('已发送紧急求助信号（演示）')" />

    <!-- 底部导航栏 -->
    <TabBar :tab="tab" @switch="switchTab" />

    <!-- 物业建议 / 问题反馈弹窗 -->
    <SuggestionModal
      v-if="showSuggestion"
      @close="showSuggestion = false"
      @submit="submitSuggestion"
    />

    <!-- 全局轻提示 Toast -->
    <transition name="fade">
      <div
        v-if="toast"
        class="absolute top-16 left-1/2 -translate-x-1/2 bg-black/75 text-white text-sm px-4 py-2 rounded-full z-50 whitespace-nowrap"
      >{{ toast }}</div>
    </transition>
  </div>
</template>

<style>
/* Toast 淡入淡出 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
