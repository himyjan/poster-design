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
 * 素材 / 照片数据访问
 */
import { getDB } from './index'

/** 获取某分类素材列表，解析失败或无数据返回空数组（静默降级） */
function getCategoryList(table: 'materials' | 'photos', cate: string): any[] {
  const row = getDB().prepare(`SELECT list FROM ${table} WHERE cate = ?`).get(String(cate || ''))
  if (!row || typeof row.list !== 'string') return []
  try {
    const list = JSON.parse(row.list)
    return Array.isArray(list) ? list : []
  } catch (e) {
    console.warn(`[db:materials] ${table}/${cate} 数据损坏，降级返回空列表`)
    return []
  }
}

export function getMaterials(cate: string): any[] {
  return getCategoryList('materials', cate)
}

export function getPhotos(cate: string): any[] {
  return getCategoryList('photos', cate)
}
