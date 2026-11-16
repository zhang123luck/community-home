<script setup>
// 合作 tab：社区认证合作（居民投票准入 · 公示式管理 · 差评拉黑）
import { ref, computed } from 'vue'
import { merchants } from '../data/mock'

defineEmits(['publish'])

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

// 按状态筛选商户
const filtered = computed(() => {
  if (active.value === '全部') return merchants
  const key = { 已认证: 'certified', 待投票: 'pending', 已拉黑: 'blocked' }[active.value]
  return merchants.filter(m => m.badges.includes(key))
})
</script>

<template>
  <div class="px-4 pt-3">
    <!-- 标题与说明 -->
    <h2 class="text-xl font-extrabold text-gray-800 flex items-center gap-2">
      <span>🏢</span>社区认证合作
    </h2>
    <p class="text-xs text-gray-500 mt-2 mb-3">居民推荐投票准入 · 公示式管理 · 差评拉黑公示退出</p>

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

    <!-- 商户卡片列表 -->
    <div class="space-y-3">
      <div v-for="(m, i) in filtered" :key="i" class="bg-white rounded-2xl p-4 shadow-sm">
        <!-- 头部：图标 + 名称类目 + 评分 -->
        <div class="flex items-center gap-3">
          <span class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">{{ m.icon }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-800">{{ m.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ m.category }}</p>
          </div>
          <span class="text-amber-500 font-bold text-sm shrink-0">⭐ {{ m.rating.toFixed(1) }}</span>
        </div>

        <!-- 商户简介 -->
        <p class="text-[13px] text-gray-600 mt-3 leading-relaxed">{{ m.desc }}</p>

        <!-- 状态徽章 -->
        <div class="flex gap-2 mt-3">
          <span
            v-for="b in m.badges"
            :key="b"
            class="text-xs px-2.5 py-1 rounded-full"
            :class="badgeMap[b].cls"
          >{{ badgeMap[b].text }}</span>
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
      </div>

      <p v-if="!filtered.length" class="text-center text-gray-400 text-sm py-8">暂无商户</p>
    </div>

    <!-- 推荐商户入驻按钮 -->
    <button
      class="w-full mt-5 py-3.5 rounded-full bg-primary text-white font-bold text-[15px] shadow active:bg-primary-dark"
      @click="$emit('publish')"
    >＋ 推荐商户入驻</button>
  </div>
</template>
