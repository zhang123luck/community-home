<script setup>
// ============================================================
// 合作 tab：社区认证合作（居民投票准入 · 公示式管理 · 差评拉黑）
// 数据来自接口，居民可推荐商户入驻并投票支持
// ============================================================
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'
import MerchantApplyModal from '../components/MerchantApplyModal.vue'

const emit = defineEmits(['toast'])

// 筛选标签与徽章配置
const filters = ['全部', '已认证', '待投票', '已拉黑']
const active = ref('全部')

// 徽章样式映射
const badgeMap = {
  certified: { text: '✅ 已认证', cls: 'bg-green-50 text-green-600 border border-green-200' },
  recommend: { text: '⭐ 居民推荐', cls: 'bg-amber-50 text-amber-500 border border-amber-200' },
  pending:   { text: '🗳 待投票', cls: 'bg-blue-50 text-blue-500 border border-blue-200' },
  blocked:   { text: '🚫 已拉黑', cls: 'bg-red-50 text-red-500 border border-red-200' }
}

// 商户列表
const merchants = ref([])
const loading = ref(false)
// 推荐入驻弹窗
const showApply = ref(false)
// 本机已投过票的商户 id（避免重复投票）
const VOTED_KEY = 'community_merchant_voted'
const votedIds = ref(readVoted())

function readVoted() {
  try { return JSON.parse(localStorage.getItem(VOTED_KEY) || '[]') } catch (e) { return [] }
}
function markVoted(id) {
  votedIds.value = [...new Set([...votedIds.value, id])]
  try { localStorage.setItem(VOTED_KEY, JSON.stringify(votedIds.value)) } catch (e) { /* 忽略 */ }
}

// 读取商户列表
async function load() {
  loading.value = true
  try {
    merchants.value = await api.get('/merchants')
  } catch (e) {
    emit('toast', '商户加载失败：' + e.message)
  } finally {
    loading.value = false
  }
}

onMounted(load)

// 按状态筛选商户
const filtered = computed(() => {
  if (active.value === '全部') return merchants.value
  const key = { 已认证: 'certified', 待投票: 'pending', 已拉黑: 'blocked' }[active.value]
  return merchants.value.filter(m => (m.badges || []).includes(key))
})

// 提交推荐入驻
async function submitApply(payload) {
  try {
    await api.post('/merchants', payload)
    showApply.value = false
    emit('toast', '推荐已提交，等待居民投票')
    await load()
  } catch (e) {
    emit('toast', e.message)
  }
}

// 投票支持
async function support(m) {
  if (votedIds.value.includes(m.id)) {
    emit('toast', '你已经支持过这家商户了')
    return
  }
  try {
    const updated = await api.post(`/merchants/${m.id}/vote`)
    markVoted(m.id)
    if ((updated.badges || []).includes('certified')) {
      emit('toast', `投票成功，${m.name} 已达到 ${updated.stats.votes} 票，转为已认证`)
    } else {
      emit('toast', `投票成功，当前 ${updated.stats.votes} 票 / 满 10 票认证`)
    }
    await load()
  } catch (e) {
    emit('toast', e.message)
  }
}
</script>

<template>
  <div class="px-4 pt-3">
    <!-- 标题与说明 -->
    <h2 class="text-xl font-extrabold text-gray-800 flex items-center gap-2">
      <span>🏢</span>社区认证合作
    </h2>
    <p class="text-xs text-gray-500 mt-2 mb-3">居民推荐投票准入 · 公示式管理 · 差评拉黑公示退出</p>

    <!-- 筛选标签 -->
    <div class="flex gap-2.5 mb-4 flex-wrap">
      <button
        v-for="f in filters"
        :key="f"
        class="px-4 py-1.5 rounded-full text-sm transition-colors"
        :class="active === f ? 'bg-primary text-white' : 'bg-white text-gray-600 shadow-sm'"
        @click="active = f"
      >{{ f }}</button>
    </div>

    <!-- 商户卡片列表 -->
    <div class="space-y-3">
      <div v-for="m in filtered" :key="m.id" class="bg-white rounded-2xl p-4 shadow-sm">
        <!-- 头部：图标 + 名称类目 + 评分 -->
        <div class="flex items-center gap-3">
          <span class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">{{ m.icon }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-800">{{ m.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ m.category }}</p>
          </div>
          <span v-if="m.rating > 0" class="text-amber-500 font-bold text-sm shrink-0">⭐ {{ m.rating.toFixed(1) }}</span>
          <span v-else class="text-xs text-gray-400 shrink-0">暂无评分</span>
        </div>

        <!-- 商户简介 -->
        <p class="text-[13px] text-gray-600 mt-3 leading-relaxed">{{ m.desc }}</p>
        <p v-if="m.reason" class="text-xs text-gray-400 mt-1.5">推荐理由：{{ m.reason }}</p>

        <!-- 状态徽章 -->
        <div class="flex gap-2 mt-3 flex-wrap">
          <span
            v-for="b in m.badges"
            :key="b"
            class="text-xs px-2.5 py-1 rounded-full"
            :class="badgeMap[b]?.cls || 'bg-gray-100 text-gray-500'"
          >{{ badgeMap[b]?.text || b }}</span>
        </div>

        <!-- 底部统计：服务次数 / 推荐票 / 投诉数 -->
        <div class="border-t border-gray-100 mt-3.5 pt-3 grid grid-cols-3 text-center">
          <div>
            <p class="text-primary font-extrabold text-lg">{{ m.stats.services }}</p>
            <p class="text-xs text-gray-400 mt-0.5">服务次数</p>
          </div>
          <div>
            <p class="text-primary font-extrabold text-lg">{{ m.stats.votes }}</p>
            <p class="text-xs text-gray-400 mt-0.5">推荐票</p>
          </div>
          <div>
            <p class="font-extrabold text-lg" :class="m.stats.complaints > 0 ? 'text-red-500' : 'text-primary'">{{ m.stats.complaints }}</p>
            <p class="text-xs text-gray-400 mt-0.5">投诉</p>
          </div>
        </div>

        <!-- 待投票商户：投票支持按钮 -->
        <button
          v-if="(m.badges || []).includes('pending')"
          class="w-full mt-3 py-2 rounded-full text-sm font-semibold"
          :class="votedIds.includes(m.id) ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary active:bg-primary/20'"
          @click="support(m)"
        >{{ votedIds.includes(m.id) ? '已支持' : '👍 投票支持（还需 ' + Math.max(0, 10 - m.stats.votes) + ' 票认证）' }}</button>
      </div>

      <p v-if="loading" class="text-center text-gray-400 text-sm py-8">加载中...</p>
      <p v-else-if="!filtered.length" class="text-center text-gray-400 text-sm py-8">暂无商户</p>
    </div>

    <!-- 推荐商户入驻按钮 -->
    <button
      class="w-full mt-5 py-3.5 rounded-full bg-primary text-white font-bold text-[15px] shadow active:bg-primary-dark"
      @click="showApply = true"
    >＋ 推荐商户入驻</button>

    <!-- 推荐入驻弹窗 -->
    <MerchantApplyModal
      v-if="showApply"
      @close="showApply = false"
      @submit="submitApply"
    />
  </div>
</template>
