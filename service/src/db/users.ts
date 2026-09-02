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
 * 用户数据访问
 */
import { getDB } from './index'

export interface UserRow {
  id: number
  account: string
  password: string
  salt: string
  role: number
  created_at: string
}

/** 用户总数（用于判定首个注册用户为管理员） */
export function countUsers(): number {
  const row: { total: number } = getDB().prepare('SELECT COUNT(*) AS total FROM users').get()
  return row?.total || 0
}

export function findUserByAccount(account: string): UserRow | undefined {
  return getDB().prepare('SELECT * FROM users WHERE account = ?').get(String(account || ''))
}

export function findUserById(id: number): UserRow | undefined {
  return getDB().prepare('SELECT * FROM users WHERE id = ?').get(id)
}

export function createUser(account: string, password: string, salt: string, role: number): number {
  const info = getDB().prepare('INSERT INTO users (account, password, salt, role) VALUES (?, ?, ?, ?)').run(account, password, salt, role)
  return Number(info.lastInsertRowid)
}

/** 更新用户密码（含 salt），返回是否更新成功 */
export function updatePassword(id: number, password: string, salt: string): boolean {
  const info = getDB().prepare('UPDATE users SET password = ?, salt = ? WHERE id = ?').run(password, salt, id)
  return info.changes > 0
}

/** 管理端用户列表：只返回展示所需字段，禁止带出密码和 salt */
export function listUsers(): Pick<UserRow, 'id' | 'account' | 'role' | 'created_at'>[] {
  return getDB().prepare('SELECT id, account, role, created_at FROM users ORDER BY id DESC').all()
}

/** 删除普通用户；管理员账号必须通过更高层业务规则保护 */
export function deleteUser(id: number): boolean {
  const info = getDB().prepare('DELETE FROM users WHERE id = ? AND role = 0').run(id)
  return info.changes > 0
}
