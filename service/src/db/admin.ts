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
 * 后台管理数据访问
 */
import { getDB } from './index'
import { TemplateListItem, UserImageRow } from './types'

/** 管理端模板列表（含已下架 state=0） */
export function listAllTemplates(): TemplateListItem[] {
  return getDB().prepare(`SELECT id, title, cover, width, height, state, type, cate FROM templates ORDER BY id DESC`).all()
}

/** 软删除模板（state=0），返回是否命中 */
export function softDeleteTemplate(id: number): boolean {
  const info = getDB().prepare('UPDATE templates SET state = 0 WHERE id = ? AND state = 1').run(id)
  return info.changes > 0
}

/** 彻底删除模板及其数据库记录。封面文件由清理任务处理，避免误删共享文件。 */
export function deleteTemplate(id: number): boolean {
  return getDB().prepare('DELETE FROM templates WHERE id = ?').run(id).changes > 0
}

/** 删除用户图片记录（仅记录，不联动删文件），返回是否命中 */
export function deleteUserImage(id: number): boolean {
  const info = getDB().prepare('DELETE FROM user_images WHERE id = ?').run(id)
  return info.changes > 0
}

/** 素材 / 照片分类列表 */
export function listCategories(table: 'materials' | 'photos'): { id: number; cate: string; name: string; count: number }[] {
  const rows: { cate: string; list: string }[] = getDB().prepare(`SELECT cate, list FROM ${table}`).all()
  return rows.map((row) => {
    let count = 0
    try {
      const parsed = JSON.parse(row.list)
      count = Array.isArray(parsed) ? parsed.length : 0
    } catch (e) {}
    const category = getDB().prepare('SELECT id, name FROM asset_categories WHERE type = ? AND cate = ?').get(table, row.cate)
    return { id: category?.id || 0, cate: row.cate, name: category?.name || row.cate, count }
  })
}

/** 素材/照片明细列表，统一从分类 JSON 展开供后台管理。 */
export function listAssets(table: 'materials' | 'photos', cate = '', search = ''): any[] {
  const rows: { cate: string; list: string }[] = getDB().prepare(`SELECT cate, list FROM ${table} ${cate ? 'WHERE cate = ?' : ''}`).all(...(cate ? [cate] : []))
  const keyword = String(search || '').trim().toLowerCase()
  const result: any[] = []
  rows.forEach((row) => {
    let list: any[] = []
    try { const parsed = JSON.parse(row.list); list = Array.isArray(parsed) ? parsed : [] } catch (e) {}
    const category = getDB().prepare('SELECT name FROM asset_categories WHERE type = ? AND cate = ?').get(table, row.cate)
    list.forEach((item, index) => {
      const value = { ...item, ...(item.type === 'mask' ? { isContainer: true } : {}), category: row.cate, categoryName: category?.name || row.cate, index }
      if (!keyword || JSON.stringify(value).toLowerCase().includes(keyword)) result.push(value)
    })
  })
  return result
}

export function saveAsset(table: 'materials' | 'photos', cate: string, index: number, asset: any): boolean {
  const db = getDB()
  const row: any = db.prepare(`SELECT list FROM ${table} WHERE cate = ?`).get(cate)
  if (!row) return false
  let list: any[]
  try { const parsed = JSON.parse(row.list); list = Array.isArray(parsed) ? parsed : [] } catch (e) { return false }
  if (!Number.isInteger(index) || index < 0 || index >= list.length) return false
  list[index] = asset
  db.prepare(`UPDATE ${table} SET list = ? WHERE cate = ?`).run(JSON.stringify(list), cate)
  return true
}

export function moveAsset(table: 'materials' | 'photos', fromCate: string, toCate: string, index: number, asset: any): boolean {
  const db = getDB()
  const source: any = db.prepare(`SELECT list FROM ${table} WHERE cate = ?`).get(fromCate)
  const target: any = db.prepare(`SELECT list FROM ${table} WHERE cate = ?`).get(toCate)
  if (!source || !target) return false
  let sourceList: any[]; let targetList: any[]
  try {
    const sourceParsed = JSON.parse(source.list); const targetParsed = JSON.parse(target.list)
    sourceList = Array.isArray(sourceParsed) ? sourceParsed : []; targetList = Array.isArray(targetParsed) ? targetParsed : []
  } catch (e) { return false }
  if (!Number.isInteger(index) || index < 0 || index >= sourceList.length) return false
  sourceList.splice(index, 1); targetList.push(asset)
  const move = db.transaction(() => {
    db.prepare(`UPDATE ${table} SET list = ? WHERE cate = ?`).run(JSON.stringify(sourceList), fromCate)
    db.prepare(`UPDATE ${table} SET list = ? WHERE cate = ?`).run(JSON.stringify(targetList), toCate)
  })
  move()
  return true
}

export function addAsset(table: 'materials' | 'photos', cate: string, asset: any): boolean {
  const db = getDB()
  const row: any = db.prepare(`SELECT list FROM ${table} WHERE cate = ?`).get(cate)
  if (!row) return false
  let list: any[]
  try { const parsed = JSON.parse(row.list); list = Array.isArray(parsed) ? parsed : [] } catch (e) { return false }
  list.push(asset)
  db.prepare(`UPDATE ${table} SET list = ? WHERE cate = ?`).run(JSON.stringify(list), cate)
  return true
}

export function deleteAsset(table: 'materials' | 'photos', cate: string, index: number): boolean {
  const db = getDB()
  const row: any = db.prepare(`SELECT list FROM ${table} WHERE cate = ?`).get(cate)
  if (!row) return false
  let list: any[]
  try { const parsed = JSON.parse(row.list); list = Array.isArray(parsed) ? parsed : [] } catch (e) { return false }
  if (!Number.isInteger(index) || index < 0 || index >= list.length) return false
  list.splice(index, 1)
  db.prepare(`UPDATE ${table} SET list = ? WHERE cate = ?`).run(JSON.stringify(list), cate)
  return true
}

/** 删除素材 / 照片分类（整行），返回是否命中 */
export function deleteCategory(table: 'materials' | 'photos', cate: string): boolean {
  const db = getDB()
  const remove = db.transaction(() => {
    const info = db.prepare(`DELETE FROM ${table} WHERE cate = ?`).run(String(cate || ''))
    db.prepare('DELETE FROM asset_categories WHERE type = ? AND cate = ?').run(table, cate)
    return info.changes > 0
  })
  return remove()
}

export function addCategory(table: 'materials' | 'photos', name: string): boolean {
  const db = getDB()
  const cate = `category_${Date.now()}`
  const insert = db.transaction(() => {
    const info = db.prepare(`INSERT INTO ${table} (cate, list) VALUES (?, '[]')`).run(String(cate || ''))
    db.prepare('INSERT INTO asset_categories (cate, name, type) VALUES (?, ?, ?)').run(cate, name, table)
    return info.changes > 0
  })
  return insert()
}

export function renameCategory(table: 'materials' | 'photos', cate: string, name: string): boolean {
  const db = getDB()
  return db.prepare('UPDATE asset_categories SET name = ? WHERE type = ? AND cate = ?').run(name, table, cate).changes > 0
}
