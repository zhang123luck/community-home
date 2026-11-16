<script setup>
// ============================================================
// 推荐商户入驻 —— 底部弹窗
// 提交后进入「待投票」状态，居民可投票支持
// ============================================================
import { ref } from 'vue'

const emit = defineEmits(['close', 'submit'])

const categories = ['装修装饰', '家政保洁', '搬家运输', '家电维修', '教育培训', '餐饮外卖', '美容美发', '其他']

const name = ref('')
const category = ref('装修装饰')
const desc = ref('')
const reason = ref('')
const contact = ref('')
const error = ref('')

function onSubmit() {
  if (!name.value.trim()) {
    error.value = '请填写商户名称'
    return
  }
  if (!desc.value.trim()) {
    error.value = '请简单介绍商户提供的服务'
    return
  }
  emit('submit', {
    name: name.value.trim(),
    category: category.value,
    desc: desc.value.trim(),
    reason: reason.value.trim(),
    contact: contact.value.trim()
  })
}
</script>

<template>
  <Teleport to=".phone-frame">
  <div class="absolute inset-0 bg-black/40 z-40" @click="emit('close')">
    <div class="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl px-5 pt-6 pb-6 max-h-[88%] overflow-y-auto" @click.stop>
      <h3 class="text-center text-lg font-bold text-gray-800 mb-1">推荐商户入驻</h3>
      <p class="text-center text-xs text-gray-400 mb-4">提交后进入「待投票」，居民投票满 10 票即转为已认证</p>

      <label class="block text-sm text-gray-600 mb-1.5">商户名称</label>
      <input
        v-model="name"
        maxlength="20"
        placeholder="例如：小李开锁"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none mb-3"
      />

      <label class="block text-sm text-gray-600 mb-1.5">商户类目</label>
      <div class="relative mb-3">
        <select v-model="category" class="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none">
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">⌄</span>
      </div>

      <label class="block text-sm text-gray-600 mb-1.5">服务介绍</label>
      <textarea
        v-model="desc"
        rows="3"
        placeholder="主营什么、价格区间、服务范围等"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none resize-none mb-3"
      ></textarea>

      <label class="block text-sm text-gray-600 mb-1.5">推荐理由</label>
      <textarea
        v-model="reason"
        rows="2"
        placeholder="说说你为什么推荐这家（选填）"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none resize-none mb-3"
      ></textarea>

      <label class="block text-sm text-gray-600 mb-1.5">联系电话</label>
      <input
        v-model="contact"
        placeholder="选填"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none mb-3"
      />

      <p v-if="error" class="text-red-500 text-xs mb-2">{{ error }}</p>

      <div class="flex gap-3 mt-2">
        <button class="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-semibold" @click="emit('close')">取消</button>
        <button class="flex-1 py-3 rounded-full bg-primary text-white font-semibold" @click="onSubmit">提交推荐</button>
      </div>
    </div>
  </div>
  </Teleport>
</template>
