/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 palxiao https://xpai.design
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * 首次启动初始化：将仓库内置的种子数据集（service/seed）还原到运行时目录。
 * - data/poster.db 不存在时，从 seed/poster.db 复制（以主库文件为准，-wal/-shm 为运行时产物不参与判断）
 * - static/ 中缺失的种子文件逐个补齐（只补缺，不覆盖不删除已有文件）
 * 已有数据的服务启动时此流程不做任何事；如需重置，手动删除 data/poster.db 后重启。
 */
import fs from 'fs'
import path from 'path'

const seedDir = path.resolve(process.cwd(), 'seed')

/** 递归遍历目录，返回所有文件的相对路径 */
function walkFiles(dir: string, base = dir): string[] {
  const out: string[] = []
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    if (name === '.DS_Store') continue
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      out.push(...walkFiles(full, base))
    } else {
      out.push(path.relative(base, full))
    }
  }
  return out
}

/** 还原种子数据库：仅在主库文件不存在时复制 */
function restoreSeedDB(): void {
  const src = path.join(seedDir, 'poster.db')
  const dest = path.resolve(process.cwd(), 'data', 'poster.db')
  if (!fs.existsSync(src) || fs.existsSync(dest)) return
  const destDir = path.dirname(dest)
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(src, dest)
  console.log('[seed] 已从种子数据集还原 data/poster.db')
}

/** 补齐 static/ 中缺失的种子静态文件 */
function restoreSeedStatic(): void {
  const files = walkFiles(path.join(seedDir, 'static'))
  if (!files.length) return
  let count = 0
  for (const rel of files) {
    const dest = path.resolve(process.cwd(), 'static', rel)
    if (fs.existsSync(dest)) continue
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(path.join(seedDir, 'static', rel), dest)
    count++
  }
  if (count) console.log(`[seed] 已补齐 ${count} 个静态文件到 static/`)
}

/** 执行种子数据还原，应在服务启动时、initDB() 之前调用 */
export function restoreSeed(): void {
  if (!fs.existsSync(seedDir)) return
  try {
    restoreSeedDB()
    restoreSeedStatic()
  } catch (e) {
    console.error('[seed] 种子数据还原失败：', e)
  }
}
