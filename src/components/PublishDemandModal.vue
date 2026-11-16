<script setup>
// ============================================================
// 发布服务需求 —— 底部弹窗（跑腿 / 看护 / 就医 / 互助 共用）
// ============================================================
import { ref, watch } from 'vue'

const props = defineProps({
  serviceKey: { type: String, required: true },
  serviceTitle: { type: String, default: '' }
})
const emit = defineEmits(['close', 'submit'])

// 互助类目才需要选分类
const helpCategories = ['教育辅导', '宠物照看', '其他']

const title = ref('')
const desc = ref('')
const who = ref('')
const contact = ref('')
const urgent = ref(false)
const paid = ref(false)
const reward = ref('')
const category = ref('其他')
const error = ref('')

// 切换类目时重置表单
watch(() => props.serviceKey, () => {
  title.value = ''
  desc.value = ''
  urgent.value = false
  paid.value = false
  reward.value = ''
  category.value = '其他'
  error.value = ''
})

function onSubmit() {
  if (!title.value.trim()) {
    error.value = '请填写需求标题'
    return
  }
  if (props.serviceKey === 'help' && !category.value) {
    error.value = '请选择互助分类'
    return
  }
  emit('submit', {
    type: props.serviceKey,
    title: title.value.trim(),
    desc: desc.value.trim(),
    who: who.value.trim(),
    contact: contact.value.trim(),
    urgent: urgent.value,
    paid: paid.value,
    reward: paid.value ? Number(reward.value) || 0 : 0,
    category: props.serviceKey === 'help' ? category.value : ''
  })
}
</script>

<template>
  <!-- 传送到手机外壳，保证遮罩覆盖整屏且不被列表滚动区裁剪 -->
  <Teleport to=".phone-frame">
  <div class="absolute inset-0 bg-black/40 z-40" @click="emit('close')">
    <div class="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl px-5 pt-6 pb-6 max-h-[88%] overflow-y-auto" @click.stop>
      <h3 class="text-center text-lg font-bold text-gray-800 mb-1">发布{{ serviceTitle }}需求</h3>
      <p class="text-center text-xs text-gray-400 mb-4">填写后立即展示在社区需求列表</p>

      <!-- 标题 -->
      <label class="block text-sm text-gray-600 mb-1.5">需求标题</label>
      <input
        v-model="title"
        maxlength="30"
        placeholder="例如：急需帮忙取处方药"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none mb-3"
      />

      <!-- 详细说明 -->
      <label class="block text-sm text-gray-600 mb-1.5">详细说明</label>
      <textarea
        v-model="desc"
        rows="3"
        placeholder="补充时间、地点、注意事项等"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none resize-none mb-3"
      ></textarea>

      <!-- 楼栋 / 称呼 -->
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label class="block text-sm text-gray-600 mb-1.5">楼栋称呼</label>
          <input v-model="who" placeholder="3栋 王先生" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none placeholder-gray-400" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1.5">联系电话</label>
          <input v-model="contact" placeholder="选填" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none placeholder-gray-400" />
        </div>
      </div>

      <!-- 互助分类 -->
      <template v-if="serviceKey === 'help'">
        <label class="block text-sm text-gray-600 mb-1.5">互助分类</label>
        <div class="flex gap-2 mb-3">
          <button
            v-for="c in helpCategories"
            :key="c"
            class="flex-1 py-2 rounded-xl text-sm transition-colors"
            :class="category === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'"
            @click="category = c"
          >{{ c }}</button>
        </div>
      </template>

      <!-- 紧急程度 -->
      <label class="block text-sm text-gray-600 mb-1.5">紧急程度</label>
      <div class="flex gap-2 mb-3">
        <button
          class="flex-1 py-2 rounded-xl text-sm transition-colors"
          :class="!urgent ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'"
          @click="urgent = false"
        >普通</button>
        <button
          class="flex-1 py-2 rounded-xl text-sm transition-colors"
          :class="urgent ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'"
          @click="urgent = true"
        >紧急</button>
      </div>

      <!-- 费用 -->
      <label class="block text-sm text-gray-600 mb-1.5">费用方式</label>
      <div class="flex gap-2 mb-3">
        <button
          class="flex-1 py-2 rounded-xl text-sm transition-colors"
          :class="!paid ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'"
          @click="paid = false"
        >免费互助</button>
        <button
          class="flex-1 py-2 rounded-xl text-sm transition-colors"
          :class="paid ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'"
          @click="paid = true"
        >有偿</button>
      </div>
      <input
        v-if="paid"
        v-model="reward"
        type="number"
        min="0"
        placeholder="报酬金额（元），选填"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none placeholder-gray-400 mb-3"
      />

      <p v-if="error" class="text-red-500 text-xs mb-2">{{ error }}</p>

      <!-- 取消 / 提交 -->
      <div class="flex gap-3 mt-2">
        <button class="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-semibold" @click="emit('close')">取消</button>
        <button class="flex-1 py-3 rounded-full bg-primary text-white font-semibold" @click="onSubmit">发布</button>
      </div>
    </div>
  </div>
  </Teleport>
</template>
