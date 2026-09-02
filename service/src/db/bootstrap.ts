/*
 * @Author: ShawnPhang
 * @Date: 2026-08-31 20:11:18
 * @Description:  
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2026-09-01 18:52:24
 */
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
 * 数据库基础初始化：只创建可配置的首个管理员，不导入旧版 mock 业务数据。
 */
import crypto from 'crypto'

function createSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(salt + password).digest('hex')
}

/** 仅在全新数据库中创建管理员；已有数据库不会覆盖任何账号。 */
export default function bootstrapDatabase(db: any): void {
  const categoryDefaults = [
    ['png', '贴纸，图片类型', 'materials'],
    ['svg', 'SVG矢量元素，可改色', 'materials'],
    ['mask', '容器Mask，图形遮罩', 'materials'],
  ]
  const insertCategory = db.prepare('INSERT OR IGNORE INTO asset_categories (cate, name, type) VALUES (?, ?, ?)')
  categoryDefaults.forEach((item) => insertCategory.run(item[0], item[1], item[2]))
  const existing = db.prepare('SELECT cate FROM materials').all()
  existing.forEach((row: { cate: string }) => insertCategory.run(row.cate, row.cate, 'materials'))
  const existingPhotos = db.prepare('SELECT cate FROM photos').all()
  existingPhotos.forEach((row: { cate: string }) => insertCategory.run(row.cate, row.cate, 'photos'))

  const userCount = Number(db.prepare('SELECT COUNT(*) AS n FROM users').get()?.n || 0)
  if (userCount > 0) return

  const account = String(process.env.DEFAULT_ADMIN_ACCOUNT || 'admin').trim()
  const password = String(process.env.DEFAULT_ADMIN_PASSWORD || '123456')
  if (!account || password.length < 6) {
    console.warn('[db:bootstrap] 默认管理员配置无效，请设置 DEFAULT_ADMIN_ACCOUNT / DEFAULT_ADMIN_PASSWORD')
    return
  }
  const salt = createSalt()
  db.prepare('INSERT INTO users (account, password, salt, role) VALUES (?, ?, ?, 1)')
    .run(account, hashPassword(password, salt), salt)
  console.log(`[db:bootstrap] 默认管理员已创建：${account}`)
}
