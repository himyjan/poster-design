/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 palxiao https://xpai.design
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import {
  Odometer,
  Grid,
  Picture,
  Camera,
  CollectionTag,
  Document,
  PictureFilled,
  User,
  Star,
  Setting,
} from '@element-plus/icons-vue'
import type { TNavGroup } from './types'

/** 侧边栏导航结构。key 必须与 Admin.vue 各 pane 的激活键完全一致 */
export const NAV_GROUPS: TNavGroup[] = [
  {
    title: '概览',
    items: [{ key: 'overview', label: '总览', icon: Odometer }],
  },
  {
    title: '内容与资源',
    items: [
      { key: 'templates', label: '模板与组件', icon: Grid },
      { key: 'materials', label: '素材管理', icon: Picture },
      { key: 'photos', label: '照片管理', icon: Camera },
      { key: 'categories', label: '分类管理', icon: CollectionTag },
      { key: 'fonts', label: '字体管理', icon: Document },
    ],
  },
  {
    title: '用户',
    items: [
      { key: 'user-images', label: '用户图片', icon: PictureFilled },
      { key: 'users', label: '用户管理', icon: User },
      { key: 'designs', label: '用户作品', icon: Star },
    ],
  },
  {
    title: '系统',
    items: [{ key: 'ai-settings', label: 'AI 设置', icon: Setting }],
  },
]

/** 各页顶部栏文案：标题 + 一句职责说明 */
export const PAGE_META: Record<string, { title: string; description: string }> = {
  overview: { title: '总览', description: '平台内容规模与常用管理操作入口' },
  templates: { title: '模板与组件', description: '管理可直接使用的完整设计模板，以及可组合到画布中的设计组件' },
  materials: { title: '素材管理', description: '管理素材库中的图片、SVG 矢量元素与 Mask 容器资源' },
  photos: { title: '照片管理', description: '管理照片库资源，可按分组组织与检索' },
  categories: { title: '分类管理', description: '统一管理模板分类、素材分类与照片分类' },
  fonts: { title: '字体管理', description: '维护编辑器可用的字体资源，支持直接上传 woff 文件' },
  'user-images': { title: '用户图片', description: '用户上传的图片记录，删除仅移除记录，不删除文件本体' },
  users: { title: '用户管理', description: '仅展示账号基本信息，密码等敏感字段不会返回' },
  designs: { title: '用户作品', description: '查看用户保存的作品，不展示作品编辑数据' },
  'ai-settings': { title: 'AI 设置', description: '配置后登录用户即可在编辑器中使用文案生成、文生图与智能配色' },
}

/** AI 生图尺寸模式：不同供应商可接受的 size 档位不同，需按供应商选择映射 */
export const AI_SIZE_MODE_OPTIONS: { value: string; label: string }[] = [
  { value: 'zhipu', label: '智谱档位' },
  { value: 'openai', label: 'OpenAI 标准' },
  { value: '1024', label: '统一 1024' },
]
