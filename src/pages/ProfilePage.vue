<script setup>
// 我的 tab：奖章标签 + 累计收入卡片 + 奖章收藏馆
import { profile } from '../data/mock'
</script>

<template>
  <div class="px-4 pt-3">
    <!-- 个人信息头部 -->
    <div class="flex items-center gap-3 mb-4">
      <span class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-3xl">{{ profile.avatar }}</span>
      <div>
        <p class="font-extrabold text-gray-800 text-lg">{{ profile.name }}</p>
        <p class="text-xs text-gray-400 mt-0.5">📍 {{ profile.house }}</p>
      </div>
    </div>

    <!-- 奖章标签卡片 -->
    <div class="bg-white rounded-2xl p-4 shadow-sm mb-3">
      <div class="flex flex-wrap gap-2.5">
        <span
          v-for="m in profile.medals"
          :key="m.name"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-sm text-gray-700"
        >{{ m.icon }} {{ m.name }}</span>
      </div>
    </div>

    <!-- 累计服务收入绿色卡片 -->
    <div class="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-4 text-white shadow-sm mb-3">
      <div class="flex justify-between items-center">
        <p class="font-semibold text-sm">💰 累计服务收入</p>
        <p class="text-xs text-white/80">加入社区 {{ profile.income.days }} 天</p>
      </div>
      <p class="text-3xl font-extrabold mt-2">¥ {{ profile.income.total.toLocaleString() }}</p>

      <!-- 三类收入小块 -->
      <div class="grid grid-cols-3 gap-2.5 mt-4">
        <div
          v-for="p in profile.income.parts"
          :key="p.label"
          class="bg-white/15 rounded-xl py-2.5 text-center"
        >
          <p class="font-bold">¥ {{ p.amount.toLocaleString() }}</p>
          <p class="text-[11px] text-white/80 mt-0.5">{{ p.label }}</p>
        </div>
      </div>
    </div>

    <!-- 奖章收藏馆 -->
    <div class="bg-white rounded-2xl p-4 shadow-sm">
      <h3 class="font-bold text-gray-800 flex items-center gap-1.5"><span>🏅</span>奖章收藏馆</h3>
      <p class="text-xs text-gray-400 mt-1.5 mb-2">
        已获得 {{ profile.medals.length }}/{{ profile.collection.length }} 枚奖章，继续加油！
      </p>
      <!-- 收集进度条 -->
      <div class="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          class="h-full bg-primary rounded-full"
          :style="{ width: (profile.medals.length / profile.collection.length * 100) + '%' }"
        ></div>
      </div>
      <!-- 横向奖章卡片（已获得彩色 / 未获得灰色锁定） -->
      <div class="flex gap-2.5 overflow-x-auto no-scrollbar">
        <div
          v-for="c in profile.collection"
          :key="c.name"
          class="shrink-0 w-[76px] rounded-xl border py-3 flex flex-col items-center gap-1"
          :class="c.earned ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200 opacity-60'"
        >
          <span class="text-2xl" :class="{ grayscale: !c.earned }">{{ c.earned ? c.icon : '🔒' }}</span>
          <span class="text-[11px]" :class="c.earned ? 'text-gray-700' : 'text-gray-400'">{{ c.name }}</span>
        </div>
      </div>
    </div>

    <!-- 物业管理后台入口（相对路径，兼容 GitHub Pages 子路径部署） -->
    <a
      href="admin.html"
      class="mt-3 flex items-center justify-between bg-white rounded-2xl px-4 py-3.5 shadow-sm text-sm text-gray-600"
    >
      <span>🏢 物业管理后台（物业人员登录）</span>
      <span class="text-gray-300">›</span>
    </a>
  </div>
</template>
