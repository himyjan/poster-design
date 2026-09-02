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
 * AI 能力相关接口（登录用户可用）
 */
import fetch from '@/utils/axios'

export type TAiTextParam = {
  prompt: string
  style?: string
}

// 生成文案
export const textGenerate = (params: TAiTextParam) => fetch<{ list: string[] }>('api/ai/text', params, 'post')

export type TAiImageParam = {
  prompt: string
  ratio?: string
}

// 文生图（出图较慢，可单独传超时与 loading 配置）
export const imageGenerate = (params: TAiImageParam, extra: Record<string, any> = {}) => fetch<{ url: string; width: number; height: number }>('api/ai/image', params, 'post', {}, extra)

export type TAiColorItem = {
  name: string
  value: string
}

export type TAiColorParam = {
  prompt: string
}

// 智能配色
export const colorSuggest = (params: TAiColorParam) => fetch<{ colors: TAiColorItem[] }>('api/ai/color', params, 'post')
