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
 * 系统设置键值存储（key-value）
 * 用于持久化后台可配置项，如 AI 接口密钥、模型名等。
 */
import { getDB } from './index'

const TABLE = 'ai_settings'

export interface AiSettings {
  zhipu_api_key: string
  text_model: string
  image_model: string
  enabled: boolean
}

/** 读取单个设置项，不存在返回空串 */
export function getSetting(key: string): string {
  const row = getDB().prepare(`SELECT value FROM ${TABLE} WHERE key = ?`).get(key) as { value: string } | undefined
  return row && typeof row.value === 'string' ? row.value : ''
}

/** 写入单个设置项（存在则更新） */
export function setSetting(key: string, value: string): void {
  getDB().prepare(`INSERT INTO ${TABLE} (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value)
}

/** 读取 AI 配置；读取时逐字段做类型校验，缺省/损坏时静默降级为默认值 */
export function getAiSettings(): AiSettings {
  const rows = getDB().prepare(`SELECT key, value FROM ${TABLE}`).all() as { key: string; value: string }[]
  const map: Record<string, string> = {}
  for (const row of rows) {
    if (row && typeof row.key === 'string') map[row.key] = row.value
  }
  const apiKey = typeof map.zhipu_api_key === 'string' ? map.zhipu_api_key.trim() : ''
  const textModel = typeof map.text_model === 'string' && map.text_model.trim() ? map.text_model.trim() : 'glm-4-flash'
  const imageModel = typeof map.image_model === 'string' && map.image_model.trim() ? map.image_model.trim() : 'cogview-3-flash'
  // enabled 兼容 '0'/'1'/'true'/'false' 字符串
  const rawEnabled = map.enabled
  const enabled = rawEnabled === '' || rawEnabled === '0' || rawEnabled === 'false' ? false : true
  return { zhipu_api_key: apiKey, text_model: textModel, image_model: imageModel, enabled }
}
