// ============================================================
// 社区家园 —— 物业管理后端（Express）
// 本地开发：npm run server       （默认 http://localhost:3001）
// 生产运行：npm start            （前端打包产物 + 接口同一端口）
// 管理后台：/admin.html
// 默认管理员：root / 12345
// ============================================================
import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readDB, writeDB, uid, today } from './db.js'

const app = express()
app.use(express.json())

// 端口：云端会注入 PORT 环境变量；本地默认 3001
const PORT = Number(process.env.PORT) || 3001
const ADMIN_USER = 'root'
const ADMIN_PASS = '12345'
const TOKEN_TTL = 8 * 60 * 60 * 1000 // token 有效期 8 小时

// 维修单允许的状态
const REPAIR_STATUSES = ['待处理', '已派单', '维修中', '已完成']
// 建议单允许的状态
const SUGGESTION_STATUSES = ['待处理', '处理中', '已处理']

// 简易会话表：token -> 过期时间（重启服务后需重新登录）
const sessions = new Map()

// 从请求头取出 token
function getToken(req) {
  return (req.headers.authorization || '').replace('Bearer ', '').trim()
}

// 登录校验中间件（只保护物业管理接口，居民提交接口不校验）
function auth(req, res, next) {
  const token = getToken(req)
  const expire = sessions.get(token)
  if (!expire || expire < Date.now()) {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
  next()
}

// 健康检查
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }))

// ------------------------------------------------------------
// 管理员登录
// ------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {}
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: '账号或密码错误' })
  }
  const token = crypto.randomUUID()
  sessions.set(token, Date.now() + TOKEN_TTL)
  res.json({ token, username: ADMIN_USER })
})

app.post('/api/admin/logout', auth, (req, res) => {
  sessions.delete(getToken(req))
  res.json({ ok: true })
})

// ------------------------------------------------------------
// 社区公告：居民端只取展示中的，后台取全部
// ------------------------------------------------------------
app.get('/api/announcements', (req, res) => {
  const db = readDB()
  const list = req.query.all === '1' ? db.announcements : db.announcements.filter(a => a.active)
  res.json(list)
})

app.post('/api/announcements', auth, (req, res) => {
  const { tag, title, desc } = req.body || {}
  if (!title || !title.trim()) return res.status(400).json({ error: '公告标题不能为空' })
  const db = readDB()
  const item = {
    id: uid('an'),
    tag: tag?.trim() || '社区公告',
    title: title.trim(),
    desc: (desc || '').trim(),
    active: true,
    createdAt: new Date().toISOString()
  }
  db.announcements.unshift(item)
  writeDB(db)
  res.status(201).json(item)
})

// 上架 / 下架
app.patch('/api/announcements/:id', auth, (req, res) => {
  const db = readDB()
  const item = db.announcements.find(a => a.id === req.params.id)
  if (!item) return res.status(404).json({ error: '公告不存在' })
  const { active, title, desc, tag } = req.body || {}
  if (typeof active === 'boolean') item.active = active
  if (title !== undefined) item.title = title
  if (desc !== undefined) item.desc = desc
  if (tag !== undefined) item.tag = tag
  writeDB(db)
  res.json(item)
})

app.delete('/api/announcements/:id', auth, (req, res) => {
  const db = readDB()
  const before = db.announcements.length
  db.announcements = db.announcements.filter(a => a.id !== req.params.id)
  if (db.announcements.length === before) return res.status(404).json({ error: '公告不存在' })
  writeDB(db)
  res.json({ ok: true })
})

// ------------------------------------------------------------
// 物业报修：居民可提交（无需登录），物业可在后台改状态
// ------------------------------------------------------------
app.get('/api/repairs', (req, res) => {
  res.json(readDB().repairs)
})

app.post('/api/repairs', (req, res) => {
  const { title, house, contact, content } = req.body || {}
  if (!title || !title.trim()) return res.status(400).json({ error: '请填写报修标题' })
  const db = readDB()
  const item = {
    id: uid('rp'),
    title: title.trim(),
    date: today(),
    status: '待处理',
    house: (house || '').trim(),
    contact: (contact || '').trim(),
    content: (content || '').trim(),
    createdAt: new Date().toISOString()
  }
  db.repairs.unshift(item)
  writeDB(db)
  res.status(201).json(item)
})

// 物业处理：修改状态（待处理 → 已派单 → 维修中 → 已完成）
app.patch('/api/repairs/:id', auth, (req, res) => {
  const { status } = req.body || {}
  if (!REPAIR_STATUSES.includes(status)) return res.status(400).json({ error: '非法的报修状态' })
  const db = readDB()
  const item = db.repairs.find(r => r.id === req.params.id)
  if (!item) return res.status(404).json({ error: '报修单不存在' })
  item.status = status
  item.updatedAt = new Date().toISOString()
  writeDB(db)
  res.json(item)
})

app.delete('/api/repairs/:id', auth, (req, res) => {
  const db = readDB()
  db.repairs = db.repairs.filter(r => r.id !== req.params.id)
  writeDB(db)
  res.json({ ok: true })
})

// ------------------------------------------------------------
// 社区投票：物业发起，居民投票
// ------------------------------------------------------------
app.get('/api/votes', (req, res) => {
  const db = readDB()
  const list = db.votes.map(v => ({ ...v, total: v.options.reduce((s, o) => s + o.votes, 0) }))
  res.json(list)
})

app.post('/api/votes', auth, (req, res) => {
  const { title, desc, options, deadline } = req.body || {}
  if (!title || !title.trim()) return res.status(400).json({ error: '投票主题不能为空' })
  // 选项支持传字符串数组，最少 2 项
  const opts = (Array.isArray(options) ? options : [])
    .map(o => (typeof o === 'string' ? o.trim() : String(o?.label || '').trim()))
    .filter(Boolean)
    .map(label => ({ label, votes: 0 }))
  if (opts.length < 2) return res.status(400).json({ error: '至少需要 2 个投票选项' })

  const db = readDB()
  const item = {
    id: uid('vt'),
    title: title.trim(),
    desc: (desc || '').trim(),
    options: opts,
    deadline: (deadline || '7 天').trim(),
    status: 'open',
    createdAt: new Date().toISOString()
  }
  db.votes.unshift(item)
  writeDB(db)
  res.status(201).json(item)
})

// 居民投票（无需登录，同一浏览器进度前端限制一次）
app.post('/api/votes/:id/vote', (req, res) => {
  const { optionIndex } = req.body || {}
  const db = readDB()
  const item = db.votes.find(v => v.id === req.params.id)
  if (!item) return res.status(404).json({ error: '投票不存在' })
  if (item.status !== 'open') return res.status(400).json({ error: '该投票已结束' })
  const idx = Number(optionIndex)
  if (!Number.isInteger(idx) || idx < 0 || idx >= item.options.length) {
    return res.status(400).json({ error: '非法的投票选项' })
  }
  item.options[idx].votes += 1
  writeDB(db)
  res.json({ ...item, total: item.options.reduce((s, o) => s + o.votes, 0) })
})

// 结束 / 重新开启投票
app.patch('/api/votes/:id', auth, (req, res) => {
  const { status } = req.body || {}
  if (!['open', 'closed'].includes(status)) return res.status(400).json({ error: '非法状态' })
  const db = readDB()
  const item = db.votes.find(v => v.id === req.params.id)
  if (!item) return res.status(404).json({ error: '投票不存在' })
  item.status = status
  writeDB(db)
  res.json(item)
})

// ------------------------------------------------------------
// 物业建议：居民提交，物业查看并回复
// ------------------------------------------------------------
app.get('/api/suggestions', auth, (req, res) => {
  res.json(readDB().suggestions)
})

app.post('/api/suggestions', (req, res) => {
  const { type, content } = req.body || {}
  if (!content || !content.trim()) return res.status(400).json({ error: '请填写建议内容' })
  const db = readDB()
  const item = {
    id: uid('sg'),
    type: type || '改进建议',
    content: content.trim(),
    status: '待处理',
    reply: '',
    createdAt: new Date().toISOString()
  }
  db.suggestions.unshift(item)
  writeDB(db)
  res.status(201).json(item)
})

app.patch('/api/suggestions/:id', auth, (req, res) => {
  const { status, reply } = req.body || {}
  const db = readDB()
  const item = db.suggestions.find(s => s.id === req.params.id)
  if (!item) return res.status(404).json({ error: '建议不存在' })
  if (status !== undefined) {
    if (!SUGGESTION_STATUSES.includes(status)) return res.status(400).json({ error: '非法的处理状态' })
    item.status = status
  }
  if (reply !== undefined) item.reply = reply
  writeDB(db)
  res.json(item)
})

// ------------------------------------------------------------
// 静态资源：生产环境把 vite 打包产物（site 目录）一起托管
// 这样居民端小程序、管理后台、接口全部跑在同一个端口上
// ------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITE_DIR = path.join(__dirname, '..', 'site')

if (fs.existsSync(path.join(SITE_DIR, 'index.html'))) {
  app.use(express.static(SITE_DIR))
  // 前端路由兜底：非 /api 请求都返回首页
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(SITE_DIR, 'index.html'))
  })
} else {
  console.log('ℹ️  未找到前端打包产物 site/，当前仅提供接口（开发模式请用 npm run dev:all）')
}

// 启动服务（端口被占用时给出友好提示而不是报错堆栈）
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 社区家园服务已启动：http://localhost:${PORT}`)
  console.log(`   居民端：/       管理后台：/admin.html`)
  console.log(`   管理员账号：${ADMIN_USER} / ${ADMIN_PASS}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用：服务已经在运行了，不用重复启动！`)
    console.error(`   直接打开 http://localhost:${PORT} 即可使用。`)
    console.error(`   如确实要重启，请先关闭旧的启动窗口（或任务管理器结束 node.exe）。`)
    process.exit(1)
  }
  throw err
})
