<script setup>
// 物业建议 / 问题反馈 —— 底部弹窗
import { ref } from 'vue'

const emit = defineEmits(['close', 'submit'])

// 建议类型下拉选项
const types = ['改进建议', '投诉反馈', '报修相关', '物业服务', '其他']
const type = ref('改进建议')
const content = ref('')

function onSubmit() {
  // 演示：本地校验非空后提交
  if (!content.value.trim()) return
  emit('submit', { type: type.value, content: content.value })
  content.value = ''
}
</script>

<template>
  <!-- 遮罩层 -->
  <div class="absolute inset-0 bg-black/40 z-40" @click="emit('close')">
    <!-- 底部白色圆角弹窗 -->
    <div class="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl px-5 pt-6 pb-8" @click.stop>
      <h3 class="text-center text-lg font-bold text-gray-800 mb-5">物业建议 / 问题反馈</h3>

      <!-- 建议类型下拉选择 -->
      <label class="block text-sm text-gray-600 mb-1.5">建议类型</label>
      <div class="relative mb-4">
        <select v-model="type" class="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none">
          <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
        </select>
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">⌄</span>
      </div>

      <!-- 多行文本输入框 -->
      <label class="block text-sm text-gray-600 mb-1.5">详细内容</label>
      <textarea
        v-model="content"
        rows="4"
        placeholder="请描述你的建议或问题..."
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 outline-none resize-none mb-6"
      ></textarea>

      <!-- 取消 / 提交按钮 -->
      <div class="flex gap-3">
        <button class="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-semibold" @click="emit('close')">取消</button>
        <button class="flex-1 py-3 rounded-full bg-primary text-white font-semibold" @click="onSubmit">提交</button>
      </div>
    </div>
  </div>
</template>
