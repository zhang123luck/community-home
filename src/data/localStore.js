// ============================================================
// 纯静态托管模式的数据层（GitHub Pages 用）
// 后端接口在此模式下由「浏览器 localStorage」模拟，
// 数据只存在当前浏览器里，换设备/清缓存会重置为初始数据。
// ============================================================
export const isStaticMode = import.meta.env?.VITE_STATIC === 'true'

const KEY = 'community_db_v1'

// 初始示例数据（与 server/data/db.json 保持一致）
const seed = {
  announcements: [
    {
      id: 'an-1', tag: '社区公告', title: '本周六社区便民义诊活动',
      desc: '6月21日 9:00-16:00 小区中心广场，免费测血压血糖...',
      active: true, createdAt: '2026-11-10T02:00:00.000Z'
    },
    {
      id: 'an-2', tag: '停水通知', title: '5栋高层二次供水水箱清洗',
      desc: '6月18日 8:00-17:00 停水，请提前储水，给您带来不便敬请谅解。',
      active: false, createdAt: '2026-11-08T02:00:00.000Z'
    }
  ],
  repairs: [
    { id: 'rp-1', title: '厨房水龙头漏水', date: '6月16日', status: '已派单', house: '3栋 2单元 502', contact: '138****6621', content: '厨房洗菜盆水龙头接口处持续滴水。', createdAt: '2026-11-16T01:00:00.000Z' },
    { id: 'rp-2', title: '楼道灯不亮-3栋5楼', date: '6月16日', status: '待处理', house: '3栋 5楼', contact: '138****6621', content: '5楼走廊两盏灯均不亮，晚上出行不便。', createdAt: '2026-11-16T00:30:00.000Z' },
    { id: 'rp-3', title: '单元门门禁故障', date: '6月15日', status: '维修中', house: '3栋 2单元', contact: '139****3308', content: '门禁刷卡无反应，需手动推门。', createdAt: '2026-11-15T03:00:00.000Z' },
    { id: 'rp-4', title: '卫生间下水道堵塞', date: '6月14日', status: '已完成', house: '1栋 1单元 302', contact: '137****1122', content: '卫生间地漏排水缓慢，积水。', createdAt: '2026-11-14T02:00:00.000Z' },
    { id: 'rp-5', title: '客厅插座无电', date: '6月13日', status: '已完成', house: '2栋 3单元 801', contact: '135****7788', content: '客厅电视墙插座全部无电，已排查非电器问题。', createdAt: '2026-11-13T02:00:00.000Z' }
  ],
  votes: [
    {
      id: 'vt-1', title: '关于增设非机动车充电棚的表决',
      desc: '为解决电动车飞线充电安全隐患，物业拟在3栋与5栋之间空地增设带充电桩的非机动车棚，费用由公共维修基金支出，现向全体业主征求意见。',
      options: [{ label: '同意增设', votes: 42 }, { label: '不同意', votes: 8 }, { label: '弃权', votes: 5 }],
      deadline: '3 天 12 小时', status: 'open', createdAt: '2026-11-12T02:00:00.000Z'
    }
  ],
  suggestions: [
    { id: 'sg-1', type: '改进建议', content: '建议在小区南门增设快递柜，目前取件要跑到北门，老人不太方便。', status: '待处理', reply: '', createdAt: '2026-11-15T06:00:00.000Z' },
    { id: 'sg-2', type: '投诉反馈', content: '3栋楼下每晚有人聚集聊天到很晚，希望物业加强夜间巡逻。', status: '处理中', reply: '已安排保安夜间 22:00 后加密巡逻。', createdAt: '2026-11-14T13:00:00.000Z' }
  ]
}

let db = null

function load() {
  if (db) return db
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { db = JSON.parse(raw); return db }
  } catch (e) { /* 忽略损坏数据 */ }
  db = JSON.parse(JSON.stringify(seed))
  save()
  return db
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch (e) { /* 隐私模式可能禁止写入 */ }
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function today() {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function clone(v) { return JSON.parse(JSON.stringify(v)) }

// 内置管理员（纯前端校验，仅演示用途）
const ADMIN = { username: 'root', password: '12345' }

const REPAIR_STATUSES = ['待处理', '已派单', '维修中', '已完成']
const SUGGESTION_STATUSES = ['待处理', '处理中', '已处理']

/**
 * 模拟后端路由：与 server/index.js 的接口行为保持一致
 * @param {string} method GET/POST/PATCH/DELETE
 * @param {string} path   例如 /announcements?all=1、/repairs/rp-1
 * @param {object} body   请求体
 */
export function handle(method, path, body = {}) {
  const data = load()
  const [rawPath, query] = path.split('?')

  // ---------- 登录 ----------
  if (rawPath === '/admin/login' && method === 'POST') {
    if (body.username !== ADMIN.username || body.password !== ADMIN.password) {
      throw new Error('账号或密码错误')
    }
    return { token: 'static-demo-token', username: ADMIN.username }
  }
  if (rawPath === '/admin/logout') return { ok: true }

  // ---------- 社区公告 ----------
  if (rawPath === '/announcements' && method === 'GET') {
    const all = query === 'all=1'
    return clone(all ? data.announcements : data.announcements.filter(a => a.active))
  }
  if (rawPath === '/announcements' && method === 'POST') {
    if (!body.title || !body.title.trim()) throw new Error('公告标题不能为空')
    const item = {
      id: uid('an'),
      tag: (body.tag || '社区公告').trim(),
      title: body.title.trim(),
      desc: (body.desc || '').trim(),
      active: true,
      createdAt: new Date().toISOString()
    }
    data.announcements.unshift(item)
    save()
    return clone(item)
  }
  let m = rawPath.match(/^\/announcements\/(.+)$/)
  if (m && method === 'PATCH') {
    const item = data.announcements.find(a => a.id === m[1])
    if (!item) throw new Error('公告不存在')
    if (typeof body.active === 'boolean') item.active = body.active
    if (body.title !== undefined) item.title = body.title
    if (body.desc !== undefined) item.desc = body.desc
    if (body.tag !== undefined) item.tag = body.tag
    save()
    return clone(item)
  }
  if (m && method === 'DELETE') {
    data.announcements = data.announcements.filter(a => a.id !== m[1])
    save()
    return { ok: true }
  }

  // ---------- 物业报修 ----------
  if (rawPath === '/repairs' && method === 'GET') return clone(data.repairs)
  if (rawPath === '/repairs' && method === 'POST') {
    if (!body.title || !body.title.trim()) throw new Error('请填写报修标题')
    const item = {
      id: uid('rp'),
      title: body.title.trim(),
      date: today(),
      status: '待处理',
      house: (body.house || '').trim(),
      contact: (body.contact || '').trim(),
      content: (body.content || '').trim(),
      createdAt: new Date().toISOString()
    }
    data.repairs.unshift(item)
    save()
    return clone(item)
  }
  m = rawPath.match(/^\/repairs\/(.+)$/)
  if (m && method === 'PATCH') {
    if (!REPAIR_STATUSES.includes(body.status)) throw new Error('非法的报修状态')
    const item = data.repairs.find(r => r.id === m[1])
    if (!item) throw new Error('报修单不存在')
    item.status = body.status
    save()
    return clone(item)
  }
  if (m && method === 'DELETE') {
    data.repairs = data.repairs.filter(r => r.id !== m[1])
    save()
    return { ok: true }
  }

  // ---------- 社区投票 ----------
  if (rawPath === '/votes' && method === 'GET') {
    return clone(data.votes.map(v => ({ ...v, total: v.options.reduce((s, o) => s + o.votes, 0) })))
  }
  if (rawPath === '/votes' && method === 'POST') {
    if (!body.title || !body.title.trim()) throw new Error('投票主题不能为空')
    const opts = (Array.isArray(body.options) ? body.options : [])
      .map(o => (typeof o === 'string' ? o.trim() : String(o && o.label || '').trim()))
      .filter(Boolean)
      .map(label => ({ label, votes: 0 }))
    if (opts.length < 2) throw new Error('至少需要 2 个投票选项')
    const item = {
      id: uid('vt'),
      title: body.title.trim(),
      desc: (body.desc || '').trim(),
      options: opts,
      deadline: (body.deadline || '7 天').trim(),
      status: 'open',
      createdAt: new Date().toISOString()
    }
    data.votes.unshift(item)
    save()
    return clone(item)
  }
  m = rawPath.match(/^\/votes\/(.+)\/vote$/)
  if (m && method === 'POST') {
    const item = data.votes.find(v => v.id === m[1])
    if (!item) throw new Error('投票不存在')
    if (item.status !== 'open') throw new Error('该投票已结束')
    const idx = Number(body.optionIndex)
    if (!Number.isInteger(idx) || idx < 0 || idx >= item.options.length) throw new Error('非法的投票选项')
    item.options[idx].votes += 1
    save()
    return clone({ ...item, total: item.options.reduce((s, o) => s + o.votes, 0) })
  }
  m = rawPath.match(/^\/votes\/(.+)$/)
  if (m && method === 'PATCH') {
    if (!['open', 'closed'].includes(body.status)) throw new Error('非法状态')
    const item = data.votes.find(v => v.id === m[1])
    if (!item) throw new Error('投票不存在')
    item.status = body.status
    save()
    return clone(item)
  }

  // ---------- 物业建议 ----------
  if (rawPath === '/suggestions' && method === 'GET') return clone(data.suggestions)
  if (rawPath === '/suggestions' && method === 'POST') {
    if (!body.content || !body.content.trim()) throw new Error('请填写建议内容')
    const item = {
      id: uid('sg'),
      type: body.type || '改进建议',
      content: body.content.trim(),
      status: '待处理',
      reply: '',
      createdAt: new Date().toISOString()
    }
    data.suggestions.unshift(item)
    save()
    return clone(item)
  }
  m = rawPath.match(/^\/suggestions\/(.+)$/)
  if (m && method === 'PATCH') {
    const item = data.suggestions.find(s => s.id === m[1])
    if (!item) throw new Error('建议不存在')
    if (body.status !== undefined) {
      if (!SUGGESTION_STATUSES.includes(body.status)) throw new Error('非法的处理状态')
      item.status = body.status
    }
    if (body.reply !== undefined) item.reply = body.reply
    save()
    return clone(item)
  }

  throw new Error(`静态模式未实现的接口：${method} ${path}`)
}
