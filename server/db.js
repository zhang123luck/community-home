// ============================================================
// 简易 JSON 文件数据库（无需安装数据库，数据存 server/data/db.json）
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'data', 'db.json')

// 空数据结构（文件不存在时使用）
const EMPTY = { announcements: [], repairs: [], votes: [], suggestions: [] }

// 读取整库
export function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    return { ...EMPTY, ...JSON.parse(raw) }
  } catch (e) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY, null, 2), 'utf-8')
    return { ...EMPTY }
  }
}

// 写回整库
export function writeDB(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

// 生成唯一 id
export function uid(prefix = 'id') {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

// 生成「6月16日」这种展示用日期
export function today() {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
