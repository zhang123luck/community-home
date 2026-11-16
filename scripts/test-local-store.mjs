// 临时自测脚本：模拟浏览器 localStorage，验证静态数据层的增删改查
const store = new Map()
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
}

const { handle } = await import('../src/data/localStore.js')

const ok = (label, cond) => console.log(`${cond ? '✅' : '❌'} ${label}`)

// 登录
const login = handle('POST', '/admin/login', { username: 'root', password: '12345' })
ok('登录返回 token', !!login.token)
try {
  handle('POST', '/admin/login', { username: 'root', password: 'bad' })
  ok('错误密码应报错', false)
} catch (e) { ok('错误密码被拒绝：' + e.message, true) }

// 公告
const before = handle('GET', '/announcements?all=1').length
handle('POST', '/announcements', { tag: '测试', title: '静态版公告', desc: '来自localStorage' })
const list = handle('GET', '/announcements?all=1')
ok(`公告新增成功（${before} → ${list.length}）`, list.length === before + 1 && list[0].title === '静态版公告')
handle('PATCH', `/announcements/${list[0].id}`, { active: false })
ok('公告下架后居民端不可见', handle('GET', '/announcements').every(a => a.id !== list[0].id))
handle('DELETE', `/announcements/${list[0].id}`)
ok('公告删除成功', handle('GET', '/announcements?all=1').length === before)

// 报修
const rp = handle('POST', '/repairs', { title: '静态版报修', house: '9栋 101' })
ok('居民提交报修（默认待处理）', rp.status === '待处理')
handle('PATCH', `/repairs/${rp.id}`, { status: '已完成' })
ok('后台改状态成功', handle('GET', '/repairs').find(r => r.id === rp.id).status === '已完成')

// 投票
const votesBefore = handle('GET', '/votes')[0]
handle('POST', `/votes/${votesBefore.id}/vote`, { optionIndex: 0 })
const votesAfter = handle('GET', '/votes')[0]
ok(`投票票数 +1（${votesBefore.options[0].votes} → ${votesAfter.options[0].votes}）`, votesAfter.options[0].votes === votesBefore.options[0].votes + 1)

// 建议
const sg = handle('POST', '/suggestions', { type: '改进建议', content: '静态版建议' })
ok('居民提交建议', sg.id.startsWith('sg-'))
handle('PATCH', `/suggestions/${sg.id}`, { status: '已处理', reply: '收到' })
const sg2 = handle('GET', '/suggestions').find(s => s.id === sg.id)
ok('后台回复建议', sg2.status === '已处理' && sg2.reply === '收到')

// 邻里服务需求
const dmCount = handle('GET', '/demands?type=errand').length
const dm = handle('POST', '/demands', { type: 'errand', title: '静态版跑腿需求', who: '9栋 测试', urgent: true, paid: true, reward: 20 })
ok(`发布跑腿需求成功（${dmCount} → ${dmCount + 1}）`, handle('GET', '/demands?type=errand').length === dmCount + 1)
ok('紧急需求带"紧急"标签', dm.tags[0] === '紧急')
ok('其他类目不受影响', handle('GET', '/demands?type=child').every(d => d.type === 'child'))
try {
  handle('POST', '/demands', { type: 'help', title: '无分类互助' })
  ok('互助缺分类应报错', false)
} catch (e) { ok('互助缺分类被拒绝：' + e.message, true) }
const taken = handle('POST', `/demands/${dm.id}/take`)
ok('接单成功', taken.status === '已接单')
try {
  handle('POST', `/demands/${dm.id}/take`)
  ok('重复接单应报错', false)
} catch (e) { ok('重复接单被拒绝', true) }

// 商户推荐
const mcCount = handle('GET', '/merchants').length
const mc = handle('POST', '/merchants', { name: '测试商户', category: '家电维修', desc: '修空调', reason: '价格实在' })
ok(`推荐商户成功（${mcCount} → ${mcCount + 1}）`, handle('GET', '/merchants').length === mcCount + 1)
ok('新商户为待投票状态', mc.badges.includes('pending') && mc.stats.votes === 0)
// 连续投票直到满 10 票转认证
let updated = mc
for (let i = 0; i < 10; i++) updated = handle('POST', `/merchants/${mc.id}/vote`)
ok(`投票满 10 票转为已认证（当前 ${updated.stats.votes} 票）`, updated.badges.includes('certified'))
