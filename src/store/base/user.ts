/*
 * @Author: Jeremy Yu
 * @Date: 2024-03-17 15:00:00
 * @Description: User全局状态管理
 * @LastEditors: Jeremy Yu <https://github.com/JeremyYu-cn>
 * @LastEditTime: 2024-03-18 21:00:00
 */

import { Store, defineStore } from "pinia"

type TUserStoreState = {
  /** 登录状态 */
  online: boolean
  /** 储存用户信息 */
  user: {
    name: string | null
  }
  /**是否为管理员模式 */
  manager: string
  /** 管理员是否正在编辑模板 */
  tempEditing: boolean
}

type TUserAction = {
  /** 修改登录状态 */
  changeOnline: (state: boolean) => void
  /** 修改登录用户 */
  changeUser: (userName: string) => void
  managerEdit: (status: boolean) => void
}

/** 读取本地登录用户信息（由 login-dialog 写入） */
function readLocalUser(): { account?: string; role?: number } | null {
  try {
    return JSON.parse(localStorage.getItem('xp_user') || 'null')
  } catch {
    return null
  }
}

/** User全局状态管理 */
const useUserStore = defineStore<'userStore', TUserStoreState, {}, TUserAction>('userStore', {
  state: () => ({
    online: !!localStorage.getItem('xp_token'), // 登录状态：以是否存在登录 token 为准
    user: {
      name: readLocalUser()?.account ?? null,
    }, // 储存用户信息
    manager: '', // 是否为管理员模式
    tempEditing: false, // 管理员是否正在编辑模板
  }),
  actions: {
    changeOnline(status: boolean) {
      this.online = status
    },
    changeUser(name: string) {
      this.user.name = name
      const info = readLocalUser()
      localStorage.setItem('xp_user', JSON.stringify({ ...(info || {}), account: name }))
    },
    managerEdit(status: boolean) {
      this.tempEditing = status
    },
    
  }
})

export type TUserStore = Store<'userStore', TUserStoreState, {}, TUserAction>

export default useUserStore
