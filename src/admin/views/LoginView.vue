<script setup>
// 物业管理后台登录页：默认账号 root / 密码 12345
import { ref } from 'vue'
import { api, setToken } from '../../api'

const emit = defineEmits(['login'])

const username = ref('root')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  if (loading.value) return
  error.value = ''
  if (!username.value || !password.value) {
    error.value = '请输入账号和密码'
    return
  }
  loading.value = true
  try {
    const res = await api.post('/admin/login', { username: username.value, password: password.value })
    setToken(res.token)
    emit('login', res.token)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
      <div class="text-center mb-7">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">🏘️</div>
        <h1 class="text-xl font-extrabold text-gray-800 mt-3">社区家园 · 物业管理后台</h1>
        <p class="text-xs text-gray-400 mt-1.5">翡翠花园小区</p>
      </div>

      <label class="block text-sm text-gray-600 mb-1.5">账号</label>
      <input
        v-model="username"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-4 outline-none focus:border-primary"
        placeholder="请输入管理员账号"
      />

      <label class="block text-sm text-gray-600 mb-1.5">密码</label>
      <input
        v-model="password"
        type="password"
        class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary"
        placeholder="请输入密码"
        @keyup.enter="submit"
      />

      <p v-if="error" class="text-sm text-red-500 mt-3">{{ error }}</p>

      <button
        class="w-full mt-6 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-60"
        :disabled="loading"
        @click="submit"
      >{{ loading ? '登录中...' : '登 录' }}</button>

      <p class="text-xs text-gray-400 text-center mt-5">默认账号 root ／ 密码 12345</p>
    </div>
  </div>
</template>
