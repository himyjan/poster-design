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
 * AI 能力接口实现：文案生成 / 文生图 / 智能配色
 * 走智谱 AI 开放平台（OpenAI 兼容格式），密钥由后台配置存储，登录用户可调用。
 */
import { Response } from 'express'
import fs from 'fs'
import axios from '../utils/http'
import imageSize from 'image-size'
import { filePath, staticLink } from '../configs'
import { send, checkCreateFolder, randomCode } from '../utils/tools'
import { getRequestUser } from '../utils/auth'
import { getAiSettings, setSetting } from '../db/settings'
import { addUserImage } from '../db/userImages'

const ZHIPU_BASE = 'https://open.bigmodel.cn/api/paas/v4'

/** 读取 AI 配置并做前置校验，未启用/未配置密钥时抛出带提示的异常 */
function requireAiEnabled(): { apiKey: string; textModel: string; imageModel: string } {
  const config = getAiSettings()
  if (!config.enabled) {
    throw new Error('AI 功能未启用，请联系管理员在后台开启')
  }
  if (!config.zhipu_api_key) {
    throw new Error('AI 服务未配置密钥，请联系管理员')
  }
  return { apiKey: config.zhipu_api_key, textModel: config.text_model, imageModel: config.image_model }
}

/** 调用智谱对话接口（OpenAI 兼容），返回首个候选文本 */
async function chatCompletion(apiKey: string, model: string, system: string, user: string, temperature = 0.8): Promise<string> {
  // 注意：utils/http 的 axios 拦截器已将响应解包为 body，类型断言绕开 AxiosResponse 类型
  const body: any = await axios.post(
    `${ZHIPU_BASE}/chat/completions`,
    {
      model,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    },
    { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30000 }
  )
  const content = body?.choices?.[0]?.message?.content
  return typeof content === 'string' ? content : ''
}

/** 从对象中提取所有字符串字段值（智谱文案常返回 {主标题, 副标题, 宣传语} 结构） */
function collectObjectStrings(item: any): string[] {
  const values: string[] = []
  if (!item || typeof item !== 'object') return values
  for (const key of Object.keys(item)) {
    const value = item[key]
    if (typeof value === 'string' && value.trim()) values.push(value.trim())
    else if (value && typeof value === 'object') values.push(...collectObjectStrings(value))
  }
  return values
}

/** 从 LLM 输出中解析文案列表：兼容字符串数组、对象数组与逐行文本 */
function parseTextList(content: string): string[] {
  if (!content) return []
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      const list: string[] = []
      for (const item of parsed) {
        if (typeof item === 'string' && item.trim()) list.push(item.trim())
        else list.push(...collectObjectStrings(item))
      }
      return list.filter(Boolean).slice(0, 6)
    }
  } catch (e) {}
  const lines = content.split('\n').map((line) => line.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean)
  return lines.slice(0, 6)
}

/** 校验并规范化十六进制色值，非法返回 null */
function normalizeColor(value: string): string | null {
  const match = String(value).trim().match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (!match) return null
  const hex = match[1]
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
  return '#' + full.toUpperCase()
}

/** 从 LLM 输出中解析配色：优先 JSON，其次按 #HEX 正则提取 */
function parseColorList(content: string): { name: string; value: string }[] {
  if (!content) return []
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      const list = parsed
        .map((item) => {
          const name = typeof item?.name === 'string' ? item.name.trim() : ''
          const value = normalizeColor(item?.value ?? item?.color ?? '')
          return value ? { name: name || value, value } : null
        })
        .filter(Boolean) as { name: string; value: string }[]
      if (list.length) return list
    }
  } catch (e) {}
  const matches = content.match(/#[0-9a-fA-F]{3,6}\b/g) || []
  const values = matches.map((m) => normalizeColor(m)).filter((v): v is string => !!v)
  return values.map((value) => ({ name: value, value }))
}

export default {
  // AI 文案生成：POST /api/ai/text
  async textGenerate(req: any, res: Response) {
    const user = getRequestUser(req)
    if (!user) return send.error(res, '请先登录')
    let config: { apiKey: string; textModel: string }
    try {
      config = requireAiEnabled()
    } catch (e) {
      return send.error(res, e?.message || 'AI 服务未配置')
    }
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : ''
    const style = typeof req.body?.style === 'string' && req.body.style.trim() ? req.body.style.trim() : '营销'
    if (!prompt) return send.error(res, '请输入主题')
    try {
      const system = `你是一个专业的海报文案策划。请围绕用户给出的主题，生成 4 条不同风格的海报文案，整体符合【${style}】风格。要求：每条文案语言简洁有感染力，不出现占位符。仅输出 JSON 字符串数组，如 ["文案一", "文案二", "文案三", "文案四"]，数组元素必须是纯字符串，不要输出其他任何内容。`
      const content = await chatCompletion(config.apiKey, config.textModel, system, prompt)
      const list = parseTextList(content)
      if (!list.length) return send.error(res, 'AI 暂未生成有效文案，请稍后重试')
      send.success(res, { list })
    } catch (e) {
      console.error('[ai] 文案生成失败:', e?.message)
      send.error(res, 'AI 文案生成失败，请稍后重试')
    }
  },

  // AI 文生图：POST /api/ai/image
  async imageGenerate(req: any, res: Response) {
    const user = getRequestUser(req)
    if (!user) return send.error(res, '请先登录')
    let config: { apiKey: string; imageModel: string }
    try {
      config = requireAiEnabled()
    } catch (e) {
      return send.error(res, e?.message || 'AI 服务未配置')
    }
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : ''
    const ratio = typeof req.body?.ratio === 'string' ? req.body.ratio.trim() : '1:1'
    if (!prompt) return send.error(res, '请输入图片描述')
    const sizeMap: Record<string, string> = { '1:1': '1024x1024', '3:4': '768x1024', '4:3': '1024x768', '9:16': '720x1280', '16:9': '1280x720' }
    const size = sizeMap[ratio] || '1024x1024'
    try {
      // 注意：utils/http 的 axios 拦截器已将响应解包为 body，类型断言绕开 AxiosResponse 类型
      const body: any = await axios.post(
        `${ZHIPU_BASE}/images/generations`,
        { model: config.imageModel, prompt, size },
        { headers: { Authorization: `Bearer ${config.apiKey}` }, timeout: 60000 }
      )
      const remoteUrl = body?.data?.[0]?.url
      if (typeof remoteUrl !== 'string' || !remoteUrl) {
        return send.error(res, 'AI 图片生成失败，请稍后重试')
      }
      // 下载生成图到本地 static/ai 目录，避免临时外链失效
      // 注意：utils/http 拦截器会把 arraybuffer 响应解包成 buffer 本体，不能再取 .data
      const imageRes: any = await axios.get(remoteUrl, { responseType: 'arraybuffer', timeout: 60000 })
      const buffer = Buffer.from(imageRes || [])
      if (!buffer || !buffer.length) return send.error(res, 'AI 图片下载失败')
      const folder = 'ai'
      const folderPath = `${filePath}${folder}/`
      checkCreateFolder(folderPath)
      const name = `${Date.now()}-${randomCode(8)}.png`
      const targetPath = `${folderPath}${name}`
      fs.writeFileSync(targetPath, buffer)
      // 落盘前校验图片有效性（imageSize 抛错说明非有效图片）
      let width = 0
      let height = 0
      try {
        const sizeInfo = imageSize(targetPath)
        width = Number(sizeInfo.width)
        height = Number(sizeInfo.height)
      } catch (err) {
        fs.unlinkSync(targetPath)
        return send.error(res, 'AI 生成图片无效，请重试')
      }
      if (!(width > 0) || !(height > 0)) {
        fs.unlinkSync(targetPath)
        return send.error(res, 'AI 生成图片无效，请重试')
      }
      const url = `${staticLink}${folder}/${name}`
      addUserImage(user.id, url, width, height)
      send.success(res, { url, width, height })
    } catch (e) {
      console.error('[ai] 文生图失败:', e?.message)
      send.error(res, 'AI 图片生成失败，请稍后重试')
    }
  },

  // AI 智能配色：POST /api/ai/color
  async colorSuggest(req: any, res: Response) {
    const user = getRequestUser(req)
    if (!user) return send.error(res, '请先登录')
    let config: { apiKey: string; textModel: string }
    try {
      config = requireAiEnabled()
    } catch (e) {
      return send.error(res, e?.message || 'AI 服务未配置')
    }
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : ''
    if (!prompt) return send.error(res, '请输入配色主题')
    try {
      const system = `你是专业的配色设计师。请根据用户给出的主题，输出 5 个搭配和谐的颜色，包含一个主色。仅输出 JSON 数组，每个元素格式 {"name":"颜色名","value":"#RRGGBB"}，不要输出其他内容。`
      const content = await chatCompletion(config.apiKey, config.textModel, system, prompt, 0.7)
      const colors = parseColorList(content)
      if (!colors.length) return send.error(res, 'AI 暂未生成有效配色，请稍后重试')
      send.success(res, { colors })
    } catch (e) {
      console.error('[ai] 配色失败:', e?.message)
      send.error(res, 'AI 配色生成失败，请稍后重试')
    }
  },

  // 获取 AI 配置（密钥脱敏）：GET /api/admin/ai/settings
  async getSettings(req: any, res: Response) {
    const config = getAiSettings()
    const maskKey = config.zhipu_api_key
      ? config.zhipu_api_key.length <= 8
        ? config.zhipu_api_key.slice(0, 2) + '****'
        : config.zhipu_api_key.slice(0, 6) + '****' + config.zhipu_api_key.slice(-4)
      : ''
    send.success(res, {
      zhipu_api_key: maskKey,
      has_key: !!config.zhipu_api_key,
      text_model: config.text_model,
      image_model: config.image_model,
      enabled: config.enabled,
    })
  },

  // 保存 AI 配置：POST /api/admin/ai/settings
  async updateSettings(req: any, res: Response) {
    const apiKey = typeof req.body?.zhipu_api_key === 'string' ? req.body.zhipu_api_key.trim() : ''
    const textModel = typeof req.body?.text_model === 'string' && req.body.text_model.trim() ? req.body.text_model.trim() : 'glm-4-flash'
    const imageModel = typeof req.body?.image_model === 'string' && req.body.image_model.trim() ? req.body.image_model.trim() : 'cogview-3-flash'
    // 写入防御：模型名做基础清洗；密钥为空视为保留原值（避免误清空），如需停用请直接关闭开关
    if (apiKey) setSetting('zhipu_api_key', apiKey)
    setSetting('text_model', textModel.replace(/[^a-zA-Z0-9.\-_]/g, ''))
    setSetting('image_model', imageModel.replace(/[^a-zA-Z0-9.\-_]/g, ''))
    setSetting('enabled', req.body?.enabled ? '1' : '0')
    send.success(res, undefined)
  },

  // 测试连接：POST /api/admin/ai/test
  // 智谱鉴权失败 / 模型不存在 / 网络不通都会在请求层抛错，能拿到响应即视为连接成功
  async testConnection(req: any, res: Response) {
    const config = getAiSettings()
    if (!config.enabled) return send.error(res, 'AI 功能未启用')
    if (!config.zhipu_api_key) return send.error(res, '未配置密钥')
    try {
      const content = await chatCompletion(config.zhipu_api_key, config.text_model, '你是一个连通性测试助手，请直接回复两个字：ok', 'ping', 0.2)
      send.success(res, { content: String(content || '').slice(0, 100) })
    } catch (e) {
      console.error('[ai] 测试连接失败:', e?.message)
      send.error(res, `连接失败：${e?.response?.data?.error?.message || e?.message || '未知错误'}`)
    }
  },
}
