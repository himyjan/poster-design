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

export type AssetCategoryType = 'materials' | 'photos'
export function listAssetCategories(type: AssetCategoryType) {
  return getDB().prepare('SELECT id, cate, name, type FROM asset_categories WHERE type = ? ORDER BY id').all(type)
}
export function ensureAssetCategory(type: AssetCategoryType, cate: string, name: string): void {
  getDB().prepare('INSERT OR IGNORE INTO asset_categories (cate, name, type) VALUES (?, ?, ?)').run(cate, name, type)
}
export function renameAssetCategory(type: AssetCategoryType, cate: string, name: string): boolean {
  return getDB().prepare('UPDATE asset_categories SET name = ? WHERE type = ? AND cate = ?').run(name, type, cate).changes > 0
}
export function deleteAssetCategory(type: AssetCategoryType, cate: string): boolean {
  return getDB().prepare('DELETE FROM asset_categories WHERE type = ? AND cate = ?').run(type, cate).changes > 0
}
