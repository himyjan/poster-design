/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 palxiao https://xpai.design
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { getDB } from './index'

export type TemplateCategory = { id: number; name: string; type: number; sort: number; created_at: string }

export function listCategories(type: 0 | 1): TemplateCategory[] {
  return getDB().prepare('SELECT id, name, type, sort, created_at FROM template_categories WHERE type = ? ORDER BY sort ASC, id ASC').all(type)
}

export function getCategoryById(id: number, type: 0 | 1): TemplateCategory | undefined {
  return getDB().prepare('SELECT id, name, type, sort, created_at FROM template_categories WHERE id = ? AND type = ?').get(id, type)
}

export function addCategory(name: string, type: 0 | 1, sort = 0): number {
  const result = getDB().prepare('INSERT INTO template_categories (name, type, sort) VALUES (?, ?, ?)').run(name, type, sort)
  return Number(result.lastInsertRowid)
}

export function deleteCategory(id: number): boolean {
  const result = getDB().prepare('DELETE FROM template_categories WHERE id = ?').run(id)
  return result.changes > 0
}

export function renameCategory(id: number, name: string): boolean {
  const db = getDB()
  const category = db.prepare('SELECT name, type FROM template_categories WHERE id = ?').get(id)
  if (!category) return false
  const transaction = db.transaction(() => {
    db.prepare('UPDATE template_categories SET name = ? WHERE id = ?').run(name, id)
    db.prepare('UPDATE templates SET cate = ? WHERE cate = ? AND type = ?').run(name, category.name, category.type)
  })
  transaction()
  return true
}

export function countTemplateUsage(id: number): number {
  const db = getDB()
  const category = db.prepare('SELECT name, type FROM template_categories WHERE id = ?').get(id)
  if (!category) return 0
  return Number(db.prepare('SELECT COUNT(*) AS total FROM templates WHERE cate = ? AND type = ?').get(category.name, category.type)?.total || 0)
}
