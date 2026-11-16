// ============================================================
// 社区家园 - 本地静态模拟数据（后续可替换为接口请求）
// ============================================================

// 小区信息
export const community = {
  name: '翡翠花园小区'
}

// 首页公告
export const announcement = {
  tag: '社区公告',
  title: '本周六社区便民义诊活动',
  desc: '6月21日 9:00-16:00 小区中心广场，免费测血压血糖...'
}

// 首页功能宫格入口（8 个）
export const gridEntries = [
  { key: 'errand',     icon: '🏃', label: '跑腿代办', bg: 'bg-red-50' },
  { key: 'child',      icon: '👶', label: '儿童看护', bg: 'bg-amber-50' },
  { key: 'medical',    icon: '🏥', label: '陪同就医', bg: 'bg-pink-50' },
  { key: 'help',       icon: '🤝', label: '邻里互助', bg: 'bg-green-50' },
  { key: 'coop',       icon: '🏢', label: '认证合作', bg: 'bg-blue-50' },
  { key: 'repair',     icon: '🔧', label: '物业报修', bg: 'bg-purple-50' },
  { key: 'vote',       icon: '📋', label: '社区投票', bg: 'bg-rose-50' },
  { key: 'suggestion', icon: '💡', label: '物业建议', bg: 'bg-yellow-50' }
]

// 服务类目（跑腿代办 / 儿童看护 / 陪同就医 / 邻里互助）
export const services = {
  errand: {
    key: 'errand', icon: '🏃', title: '跑腿代办',
    filters: ['全部', '紧急', '普通'],
    publish: '发布跑腿需求',
    items: [
      { icon: '🙋', title: '急需帮忙取处方药',       who: '5栋 张女士', time: '5分钟前', tags: ['紧急'] },
      { icon: '🙋', title: '帮忙去超市代购生活用品', who: '1栋 刘先生', time: '2小时前', tags: ['有偿'] },
      { icon: '🙋', title: '代取快递（大件冰箱）',   who: '3栋 王先生', time: '3小时前', tags: ['有偿'] },
      { icon: '🧓', title: '帮忙打印孩子作业资料',   who: '2栋 李奶奶', time: '5小时前', tags: ['免费'] }
    ]
  },
  child: {
    key: 'child', icon: '👶', title: '儿童看护',
    filters: ['全部', '紧急', '普通'],
    publish: '发布看护需求',
    items: [
      { icon: '👶', title: '临时托管4岁男孩3小时',     who: '4栋 陈妈妈', time: '15分钟前', tags: ['紧急'] },
      { icon: '👶', title: '周末两天托管7岁女孩',      who: '6栋 赵先生', time: '1小时前',  tags: ['有偿'] },
      { icon: '👶', title: '放学后接孩子并辅导作业',   who: '1栋 刘女士', time: '3小时前',  tags: ['有偿'] }
    ]
  },
  medical: {
    key: 'medical', icon: '🏥', title: '陪同就医',
    filters: ['全部', '紧急', '普通'],
    publish: '发布就医需求',
    items: [
      { icon: '🧓', title: '陪同独居老人心内科复查', who: '6栋 陈先生', time: '30分钟前', tags: ['紧急'] },
      { icon: '🧓', title: '年度体检陪同',           who: '4栋 林女士', time: '3小时前',  tags: ['普通'] },
      { icon: '🧓', title: '术后复查陪同',           who: '1栋 何奶奶', time: '昨天',     tags: ['有偿'] }
    ]
  },
  help: {
    key: 'help', icon: '🤝', title: '邻里互助',
    filters: ['全部', '教育辅导', '宠物照看', '其他'],
    publish: '发布互助需求',
    items: [
      { icon: '📚', title: '求三年级数学辅导',   who: '7栋 周妈妈', time: '40分钟前', tags: ['普通'], category: '教育辅导' },
      { icon: '🐱', title: '出差三天，帮忙喂猫', who: '2栋 吴先生', time: '2小时前',  tags: ['有偿'], category: '宠物照看' },
      { icon: '🪛', title: '帮忙组装宜家衣柜',   who: '5栋 郑先生', time: '4小时前',  tags: ['有偿'], category: '其他' }
    ]
  }
}

// 合作 tab - 认证商户
export const merchants = [
  {
    icon: '🎨', name: '佳美装饰', category: '装修装饰', rating: 4.8,
    desc: '专注家装15年，小区已服务30+户业主，口碑良好',
    badges: ['certified', 'recommend'],
    stats: { services: 56, votes: 42, complaints: 1 }
  },
  {
    icon: '🧹', name: '安心家政', category: '家政保洁', rating: 4.6,
    desc: '专业保洁团队，提供日常保洁、深度清洁、开荒保洁等服务',
    badges: ['certified'],
    stats: { services: 48, votes: 35, complaints: 0 }
  },
  {
    icon: '🚚', name: '顺达搬家', category: '搬家运输', rating: 4.3,
    desc: '居民推荐入驻中，正在等待社区投票公示',
    badges: ['pending'],
    stats: { services: 12, votes: 9, complaints: 0 }
  },
  {
    icon: '⚠️', name: '某装修公司', category: '装修装饰', rating: 2.1,
    desc: '因多次收到居民投诉（施工扰民、增项收费），已被社区拉黑公示',
    badges: ['blocked'],
    stats: { services: 15, votes: 3, complaints: 12 }
  }
]

// 物业报修列表
export const repairs = [
  { title: '厨房水龙头漏水',        date: '6月16日', status: '已派单' },
  { title: '楼道灯不亮-3栋5楼',     date: '6月16日', status: '待处理' },
  { title: '单元门门禁故障',        date: '6月15日', status: '维修中' },
  { title: '卫生间下水道堵塞',      date: '6月14日', status: '已完成' },
  { title: '客厅插座无电',          date: '6月13日', status: '已完成' }
]

// 社区投票
export const vote = {
  title: '关于增设非机动车充电棚的表决',
  desc: '为解决电动车飞线充电安全隐患，物业拟在3栋与5栋之间空地增设带充电桩的非机动车棚，费用由公共维修基金支出，现向全体业主征求意见。',
  options: [
    { label: '同意增设', votes: 42 },
    { label: '不同意',   votes: 8 },
    { label: '弃权',     votes: 5 }
  ],
  deadline: '3 天 12 小时',
  joined: 55
}

// 我的 tab - 个人信息
export const profile = {
  name: '邻居小王',
  house: '3栋 2单元 502',
  avatar: '🙂',
  // 已获得奖章标签
  medals: [
    { icon: '🤝', name: '热心邻居' },
    { icon: '⭐', name: '五星好评' },
    { icon: '🏃', name: '跑腿达人' },
    { icon: '👶', name: '看护之星' }
  ],
  // 收入卡片
  income: {
    total: 8560,
    days: 186,
    parts: [
      { label: '跑腿代办', amount: 4200 },
      { label: '儿童看护', amount: 2800 },
      { label: '陪同就医', amount: 1560 }
    ]
  },
  // 奖章收藏馆（earned: true 已获得）
  collection: [
    { icon: '🤝', name: '热心邻居', earned: true },
    { icon: '⭐', name: '五星好评', earned: true },
    { icon: '🏃', name: '跑腿达人', earned: true },
    { icon: '👶', name: '看护之星', earned: true },
    { icon: '🚑', name: '就医天使', earned: false },
    { icon: '🌱', name: '互助新芽', earned: false },
    { icon: '🗳️', name: '投票先锋', earned: false }
  ]
}
