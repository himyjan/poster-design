<!--
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 palxiao https://xpai.design
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
-->
<template>
  <div class="admin-page">
    <div class="admin-panel">
      <div class="admin-header">
        <span>后台管理</span>
        <el-button size="small" @click="jump2home">返回首页</el-button>
      </div>

      <div class="admin-summary">
        <div class="summary-card">
          <span class="summary-label">模板</span>
          <strong>{{ templateCount }}</strong>
        </div>
        <div class="summary-card">
          <span class="summary-label">组件</span>
          <strong>{{ componentCount }}</strong>
        </div>
        <div class="summary-card">
          <span class="summary-label">用户图片</span>
          <strong>{{ userImages.length }}</strong>
        </div>
        <div class="summary-card">
          <span class="summary-label">字体</span>
          <strong>{{ fonts.length }}</strong>
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-change="loadTab">
        <el-tab-pane label="模板" name="templates">
          <el-tabs v-model="templateType" type="card">
            <el-tab-pane label="模板管理" name="templates-list">
              <div class="tab-toolbar">
                <span class="tab-description">管理可直接使用的完整设计模板</span>
                <el-button type="primary" size="small" plain @click="openPSDImport()">导入 PSD 创建模板</el-button>
                <el-button size="small" :loading="loading" @click="loadTab">刷新</el-button>
              </div>
              <AdminTemplateTable :rows="templateRows" @delete="onDelTemplate" @remove="onRemoveTemplate" @edit="onEditTemplate" @category="openCategoryEditor" />
            </el-tab-pane>
            <el-tab-pane label="组件管理" name="components-list">
              <div class="tab-toolbar">
                <span class="tab-description">管理可组合到画布中的设计组件</span>
                <el-button type="primary" size="small" plain @click="openPSDImport(1)">导入 PSD 创建组件</el-button>
                <el-button size="small" :loading="loading" @click="loadTab">刷新</el-button>
              </div>
              <AdminTemplateTable :rows="componentRows" @delete="onDelTemplate" @remove="onRemoveTemplate" @edit="onEditTemplate" @category="openCategoryEditor" />
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane label="素材管理" name="materials-assets">
          <div class="tab-toolbar"><el-input v-model="assetQuery.search" size="small" placeholder="搜索素材" style="width: 220px" @keyup.enter="loadTab" /><el-button size="small" @click="loadTab">搜索</el-button><el-button type="primary" size="small" @click="openAssetDialog('materials')">新增上传</el-button></div><el-table :data="materialAssets" size="small" v-loading="loading"><el-table-column prop="category" label="分组" width="120" /><el-table-column prop="type" label="元素类型" width="100" /><el-table-column prop="title" label="名称" min-width="180" /><el-table-column prop="url" label="地址" min-width="280" show-overflow-tooltip /><el-table-column label="操作" width="110"><template #default="{ row }"><el-button type="primary" size="small" link @click="openAssetDialog('materials', row)">编辑</el-button><el-button type="danger" size="small" link @click="onDeleteAsset('materials', row)">删除</el-button></template></el-table-column></el-table>
        </el-tab-pane>
        <el-tab-pane label="照片管理" name="photos-assets">
          <div class="tab-toolbar"><el-input v-model="assetQuery.search" size="small" placeholder="搜索照片" style="width: 220px" @keyup.enter="loadTab" /><el-button size="small" @click="loadTab">搜索</el-button><el-button type="primary" size="small" @click="openAssetDialog('photos')">新增上传</el-button></div><el-table :data="photoAssets" size="small" v-loading="loading">
<el-table-column prop="categoryName" label="分类" width="120" />
            <el-table-column prop="url" label="地址" min-width="280" show-overflow-tooltip />
             <el-table-column prop="title" label="名称" width="120" />
             <el-table-column label="操作" width="110"><template #default="{ row }"><el-button type="primary" size="small" link @click="openAssetDialog('photos', row)">编辑</el-button><el-button type="danger" size="small" link @click="onDeleteAsset('photos', row)">删除</el-button></template></el-table-column></el-table>
        </el-tab-pane>

         <el-tab-pane label="分类管理" name="categories">
          <div class="tab-toolbar"><el-radio-group v-model="categoryTab" size="small" @change="loadTab"><el-radio-button label="template-categories">模板分类</el-radio-button><el-radio-button label="materials">素材分类</el-radio-button><el-radio-button label="photos">照片分类</el-radio-button></el-radio-group></div>
          <template v-if="categoryTab === 'template-categories'"><div class="tab-toolbar"><el-radio-group v-model="templateCategoryType" size="small" @change="loadTab"><el-radio-button :value="0">模板</el-radio-button><el-radio-button :value="1">组件</el-radio-button></el-radio-group><el-input v-model="newTemplateCategory.name" size="small" placeholder="分类名称" style="width: 180px" /><el-button type="primary" size="small" @click="addTemplateCategory">新增分类</el-button></div><el-table :data="templateCategories" size="small" stripe v-loading="loading"><el-table-column prop="id" label="ID" width="80" /><el-table-column prop="name" label="分类名称" min-width="180" /><el-table-column prop="sort" label="排序" width="90" /><el-table-column label="操作" width="150"><template #default="{ row }"><el-button type="primary" size="small" link @click="onRenameTemplateCategory(row)">重命名</el-button><el-button type="danger" size="small" link @click="onDelTemplateCategory(row)">删除</el-button></template></el-table-column></el-table></template>
          <template v-else-if="categoryTab === 'materials'"><div class="tab-toolbar"><el-button type="primary" size="small" @click="onAddCategory('materials')">新增分类</el-button></div><el-table :data="materialCates" size="small" v-loading="loading"><el-table-column prop="id" label="ID" width="80" /><el-table-column prop="name" label="分类名称" min-width="220" /><el-table-column prop="count" label="数量" width="100" /><el-table-column label="操作" width="150"><template #default="{ row }"><el-button type="primary" size="small" link @click="onRenameCategory('materials', row)">重命名</el-button><el-button type="danger" size="small" link @click="onDelCategory('materials', row)">删除</el-button></template></el-table-column></el-table></template>
          <template v-else><div class="tab-toolbar"><el-button type="primary" size="small" @click="onAddCategory('photos')">新增分类</el-button></div><el-table :data="photoCates" size="small" v-loading="loading"><el-table-column prop="id" label="ID" width="80" /><el-table-column prop="cate" label="分类键" width="150" /><el-table-column prop="name" label="分类名称" min-width="180" /><el-table-column prop="count" label="数量" width="100" /><el-table-column label="操作" width="150"><template #default="{ row }"><el-button type="primary" size="small" link @click="onRenameCategory('photos', row)">重命名</el-button><el-button type="danger" size="small" link @click="onDelCategory('photos', row)">删除</el-button></template></el-table-column></el-table></template>
        </el-tab-pane>

        <!-- 旧分类页已合并到分类管理 -->
        <el-tab-pane v-if="false" label="素材分类" name="materials-old" />

        <el-tab-pane v-if="false" label="模板分类" name="template-categories">
          <div class="tab-toolbar">
            <el-radio-group v-model="templateCategoryType" size="small" @change="loadTab">
              <el-radio-button :value="0">模板分类</el-radio-button>
              <el-radio-button :value="1">组件分类</el-radio-button>
            </el-radio-group>
            <el-input v-model="newTemplateCategory.name" size="small" placeholder="分类名称，如节日海报" style="width: 180px" />
            <el-button type="primary" size="small" @click="addTemplateCategory">新增分类</el-button>
            <el-button size="small" :loading="loading" @click="loadTab">刷新</el-button>
          </div>
          <el-table :data="templateCategories" size="small" stripe v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" :label="templateCategoryType === 0 ? '模板分类名称' : '组件分类名称'" min-width="180" />
            <el-table-column prop="sort" label="排序" width="90" />
            <el-table-column label="操作" width="90">
              <template #default="{ row }"><el-button type="primary" size="small" link @click="onRenameTemplateCategory(row)">重命名</el-button><el-button type="danger" size="small" link @click="onDelTemplateCategory(row)">删除</el-button></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane v-if="false" label="照片分类" name="photos">
          <div class="tab-toolbar"><span class="tab-description">管理照片分类，分类内容由照片接口维护</span><el-button type="primary" size="small" @click="onAddCategory('photos')">新增分类</el-button><el-button size="small" :loading="loading" @click="loadTab">刷新</el-button></div>
          <el-table :data="photoCates" size="small" v-loading="loading">
            <el-table-column prop="cate" label="分类名" min-width="140" />
            <el-table-column prop="count" label="数量" width="100" />
            <el-table-column label="操作" width="90">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="onRenameCategory('photos', row)">重命名</el-button>
                <el-button type="danger" size="small" link @click="onDelCategory('photos', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="用户图片" name="images">
          <el-table :data="userImages" size="small" v-loading="loading">
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column label="预览" width="90">
              <template #default="{ row }">
                <el-image :src="row.url" :preview-src-list="[row.url]" fit="cover" style="width: 64px; height: 36px" preview-teleported />
              </template>
            </el-table-column>
            <el-table-column label="尺寸" width="110">
              <template #default="{ row }">{{ row.width }} × {{ row.height }}</template>
            </el-table-column>
            <el-table-column prop="created_at" label="上传时间" width="170" />
            <el-table-column label="操作" width="90">
              <template #default="{ row }">
                <el-button type="danger" size="small" link @click="onDelUserImage(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="用户管理" name="users">
          <div class="tab-toolbar">
            <span class="tab-description">仅展示账号基本信息，密码等敏感字段不会返回</span>
            <el-button size="small" :loading="loading" @click="loadTab">刷新</el-button>
          </div>
          <el-table :data="users" size="small" stripe v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="account" label="账号" min-width="180" show-overflow-tooltip />
            <el-table-column label="角色" width="100">
              <template #default="{ row }">
                <el-tag :type="row.role === 1 ? 'danger' : 'info'" size="small">{{ row.role === 1 ? '管理员' : '普通用户' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="注册时间" width="180" />
            <el-table-column label="操作" width="90" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.role !== 1" type="danger" size="small" link @click="onDelUser(row)">删除</el-button>
                <span v-else class="muted-text">受保护</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="用户作品" name="designs">
          <div class="tab-toolbar"><span class="tab-description">查看用户保存的作品，不展示作品编辑数据</span><el-button size="small" :loading="loading" @click="loadTab">刷新</el-button></div>
          <el-table :data="designs" size="small" stripe v-loading="loading">
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="account" label="用户" width="140" />
            <el-table-column label="封面" width="90"><template #default="{ row }"><el-image v-if="row.cover" :src="row.cover" :preview-src-list="[row.cover]" fit="cover" style="width: 64px; height: 36px" preview-teleported /><span v-else class="muted-text">暂无</span></template></el-table-column>
            <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
            <el-table-column label="尺寸" width="110"><template #default="{ row }">{{ row.width }} × {{ row.height }}</template></el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="170" />
            <el-table-column label="操作" width="90"><template #default="{ row }"><el-button type="danger" size="small" link @click="onDelDesign(row)">删除</el-button></template></el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="字体" name="fonts">
          <div class="tab-toolbar">
            <el-input v-model="fontQuery.search" size="small" clearable placeholder="搜索字体名称 / value" style="width: 240px" @keyup.enter="loadTab" @clear="loadTab" />
            <el-button size="small" @click="loadTab">搜索</el-button>
            <el-button type="primary" size="small" @click="openFontDialog()">新增字体</el-button>
          </div>
          <el-table :data="fonts" size="small" v-loading="loading">
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="alias" label="名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="value" label="value" min-width="140" show-overflow-tooltip />
            <el-table-column label="语种" width="80">
              <template #default="{ row }">
                <el-tag size="small" :type="row.lang === 'en' ? 'warning' : 'success'">{{ row.lang === 'en' ? '英文' : '中文' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="woff" min-width="220" show-overflow-tooltip>
              <template #default="{ row }">
                <a v-if="row.woff" :href="row.woff" target="_blank" rel="noopener" style="color: #409eff">{{ row.woff }}</a>
                <span v-else style="color: #c0c4cc">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="font_family" label="font-family" min-width="140" show-overflow-tooltip />
            <el-table-column prop="created_at" label="创建时间" width="170" />
            <el-table-column label="操作" width="90" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="openFontDialog(row)">编辑</el-button>
                <el-button type="danger" size="small" link @click="onDelFont(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="fontQuery.total > fontQuery.pageSize"
            class="admin-pagination"
            background
            layout="total, sizes, prev, pager, next"
            :total="fontQuery.total"
            :current-page="fontQuery.page"
            :page-size="fontQuery.pageSize"
            :page-sizes="[10, 20, 50]"
            @current-change="(page: number) => { fontQuery.page = page; loadTab() }"
            @size-change="(size: number) => { fontQuery.pageSize = size; fontQuery.page = 1; loadTab() }"
          />
        </el-tab-pane>

        <el-tab-pane label="AI 设置" name="ai-settings">
          <div class="tab-toolbar">
            <span class="tab-description">配置后登录用户即可在编辑器中使用文案 / 文生图 / 配色，<a href="https://bigmodel.cn/apikey/platform">点击前往智谱 ApiKey</a></span>
            <el-button size="small" :loading="aiTesting" @click="testAiConnection">测试连接</el-button>
          </div>
          <el-form label-width="110px" size="small" style="max-width: 520px; margin-top: 8px">
            <el-form-item label="API Key">
              <el-input v-model="aiForm.zhipu_api_key" :placeholder="aiForm.has_key ? '已配置，输入新值可覆盖' : '智谱开放平台申请的 API Key'" show-password />
            </el-form-item>
            <el-form-item label="文案模型">
              <el-input v-model="aiForm.text_model" placeholder="默认 glm-4-flash（免费）" />
            </el-form-item>
            <el-form-item label="生图模型">
              <el-input v-model="aiForm.image_model" placeholder="默认 cogview-3-flash" />
            </el-form-item>
            <el-form-item label="启用 AI 功能">
              <el-switch v-model="aiForm.enabled" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="aiSaving" @click="saveAiSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <el-pagination v-if="adminTotal > adminPageSize" class="admin-pagination" background layout="total, sizes, prev, pager, next" :total="adminTotal" :current-page="adminPage" :page-size="adminPageSize" :page-sizes="[10, 20, 50]" @current-change="(page: number) => { adminPage = page; loadTab() }" @size-change="(size: number) => { adminPageSize = size; adminPage = 1; loadTab() }" />
    </div>

    <el-dialog v-model="categoryDialog.visible" title="修改分类" width="420px">
      <el-form label-width="80px"><el-form-item label="分类"><el-select v-model="categoryDialog.cate" placeholder="请选择分类" clearable style="width: 100%"><el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.name" /></el-select></el-form-item></el-form>
      <template #footer><el-button @click="categoryDialog.visible = false">取消</el-button><el-button type="primary" :loading="categoryDialog.submitting" @click="saveCategory">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="assetDialog.visible" :title="assetDialog.index >= 0 ? '编辑资源' : '新增资源'" width="520px">
      <el-form label-width="80px"><el-form-item label="分组"><el-select v-model="assetDialog.cate" style="width: 100%"><el-option v-for="item in assetDialog.categories" :key="item.cate" :label="item.name" :value="item.cate" /></el-select></el-form-item><el-form-item v-if="assetDialog.type === 'materials'" label="元素类型"><el-select v-model="assetDialog.assetType" style="width: 100%"><el-option label="Image 图片" value="image" /><el-option label="SVG 矢量元素" value="svg" /><el-option label="Mask 容器" value="mask" /></el-select></el-form-item><el-form-item label="名称"><el-input v-model="assetDialog.title" /></el-form-item><el-form-item label="图片 URL"><el-input v-model="assetDialog.url" placeholder="可填写远程 URL" /></el-form-item><el-form-item label="本地文件"><input type="file" accept="image/*,.svg" @change="onAssetFileChange" /></el-form-item></el-form>
      <template #footer><el-button @click="assetDialog.visible = false">取消</el-button><el-button type="primary" :loading="assetDialog.submitting" @click="submitAsset">保存</el-button></template>
    </el-dialog>

    <!-- 新增字体对话框 -->
    <el-dialog v-model="fontDialog.visible" :title="fontDialog.title" width="560px" @closed="resetFontForm">
      <el-form ref="fontFormRef" :model="fontDialog.form" :rules="fontRules" label-width="92px" size="small">
        <el-form-item label="字体名称" prop="alias">
          <el-input v-model="fontDialog.form.alias" placeholder="例：站酷快乐体" maxlength="40" show-word-limit />
        </el-form-item>
        <el-form-item label="value" prop="value">
          <el-input v-model="fontDialog.form.value" placeholder="CSS 用的 family slug，例：zcool-kuaile-regular" maxlength="60" />
        </el-form-item>
        <el-form-item label="woff 链接" prop="woff">
          <el-input v-model="fontDialog.form.woff" placeholder="https://..." />
          <input type="file" accept=".woff,.woff2" style="margin-top: 6px" @change="onFontFileChange" />
          <span class="muted-text">可直接选择 woff 文件上传，或填写远程链接</span>
        </el-form-item>
        <el-form-item label="ttf 链接">
          <el-input v-model="fontDialog.form.ttf" placeholder="可选" />
        </el-form-item>
        <el-form-item label="预览图">
          <el-input v-model="fontDialog.form.preview" placeholder="可选，预览图 URL" />
        </el-form-item>
        <el-form-item label="语种" prop="lang">
          <el-radio-group v-model="fontDialog.form.lang">
            <el-radio value="zh">中文</el-radio>
            <el-radio value="en">英文</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="font-family">
          <el-input v-model="fontDialog.form.font_family" placeholder="可选" maxlength="80" />
        </el-form-item>
        <el-form-item v-if="!fontDialog.form.id" label="文件大小">
          <el-input-number v-model="fontDialog.form.size" :min="0" :step="1" placeholder="字节，可选" />
        </el-form-item>
        <el-form-item v-if="!fontDialog.form.id" label="woff 大小">
          <el-input-number v-model="fontDialog.form.woff_size" :min="0" :step="1" placeholder="字节，可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fontDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="fontDialog.submitting" @click="submitFont">确认新增</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 palxiao https://xpai.design
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// ElTable / ElTabs 等未全局注册（见 elementConfig.ts），本页手动引入
import { ElMessage, ElMessageBox, ElTable, ElTableColumn, ElTabs, ElTabPane, ElTag, ElButton, ElImage, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElRadioGroup, ElRadio, ElRadioButton, ElPagination, ElSelect, ElOption, ElSwitch, type FormInstance, type FormRules } from 'element-plus'
import { LocalStorageKey } from '@/config'
import * as adminApi from '@/api/admin'
import * as materialApi from '@/api/material'
import AdminTemplateTable from '@/views/components/AdminTemplateTable.vue'

const router = useRouter()
const activeTab = ref('templates')
const categoryTab = ref('template-categories')
const loading = ref(false)
const templates = ref<any[]>([])
const templateType = ref('templates-list')
const userImages = ref<any[]>([])
const users = ref<adminApi.TAdminUserItem[]>([])
const designs = ref<adminApi.TAdminDesignItem[]>([])
const materialCates = ref<any[]>([])
const photoCates = ref<any[]>([])
const materialAssets = ref<any[]>([])
const photoAssets = ref<any[]>([])
const assetQuery = reactive({ search: '' })
const templateCategories = ref<any[]>([])
const newTemplateCategory = reactive({ name: '' })
const templateCategoryType = ref<0 | 1>(0)
const fonts = ref<adminApi.TAdminFontItem[]>([])
const fontQuery = reactive({ page: 1, pageSize: 20, search: '', total: 0 })
// AI 设置
const aiForm = reactive<adminApi.TAiSettings>({ zhipu_api_key: '', has_key: false, text_model: '', image_model: '', enabled: false })
const aiSaving = ref(false)
const aiTesting = ref(false)
const adminPage = ref(1)
const adminPageSize = ref(20)
const adminTotal = ref(0)
const templateRows = computed(() => templates.value.filter((item) => item.type === 0))
const componentRows = computed(() => templates.value.filter((item) => item.type === 1))
const templateCount = computed(() => templateRows.value.length)
const componentCount = computed(() => componentRows.value.length)
const categoryOptions = ref<any[]>([])
const categoryDialog = reactive({ visible: false, submitting: false, row: null as any, cate: '' })
const assetDialog = reactive({ visible: false, submitting: false, type: 'materials' as 'materials' | 'photos', cate: '', sourceCate: '', assetType: 'image', title: '', url: '', index: -1, file: null as File | null, categories: [] as any[] })

/** 字体新增对话框状态 */
const fontDialog = reactive({
  visible: false,
  title: '新增字体',
  submitting: false,
  form: {
    id: 0,
    alias: '',
    value: '',
    woff: '',
    ttf: '',
    preview: '',
    lang: 'zh' as 'zh' | 'en',
    font_family: '',
    size: 0,
    woff_size: 0,
  },
})
const fontFormRef = ref<FormInstance | null>(null)
const fontRules: FormRules = {
  alias: [{ required: true, message: '请输入字体名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字体 value（CSS family slug）', trigger: 'blur' }],
  woff: [{ required: true, message: '请输入 woff 字体链接', trigger: 'blur' }],
  lang: [{ required: true, message: '请选择语种', trigger: 'change' }],
}

/** 重置新增字体表单 */
function resetFontForm() {
  fontDialog.form.id = 0
  fontDialog.form.alias = ''
  fontDialog.form.value = ''
  fontDialog.form.woff = ''
  fontDialog.form.ttf = ''
  fontDialog.form.preview = ''
  fontDialog.form.lang = 'zh'
  fontDialog.form.font_family = ''
  fontDialog.form.size = 0
  fontDialog.form.woff_size = 0
  fontFormRef.value?.clearValidate()
}

function openFontDialog(row?: adminApi.TAdminFontItem) {
  resetFontForm()
  if (row) {
    fontDialog.title = '编辑字体'
    fontDialog.form.id = row.id
    fontDialog.form.alias = row.alias
    fontDialog.form.value = row.value
    fontDialog.form.woff = row.woff
    fontDialog.form.ttf = row.ttf
    fontDialog.form.preview = row.preview
    fontDialog.form.lang = row.lang === 'en' ? 'en' : 'zh'
    fontDialog.form.font_family = row.font_family
  } else {
    fontDialog.title = '新增字体'
  }
  fontDialog.visible = true
}

async function openAssetDialog(type: 'materials' | 'photos', row?: any) {
  assetDialog.type = type; assetDialog.index = row?.index ?? -1; assetDialog.sourceCate = row?.category || ''; assetDialog.title = row?.title || ''; assetDialog.url = row?.url || ''; assetDialog.assetType = row?.type === 'svg' || row?.type === 'mask' ? row.type : 'image'; assetDialog.file = null
  const res: any = await adminApi.getCategories(type, { page: 1, pageSize: 100 }); assetDialog.categories = res?.list || []
  assetDialog.cate = row?.category || assetDialog.categories[0]?.cate || ''
  assetDialog.visible = true
}

function onAssetFileChange(event: Event) { assetDialog.file = (event.target as HTMLInputElement).files?.[0] || null }

async function submitAsset() {
  if (!assetDialog.cate) return ElMessage.warning('请选择分类')
  assetDialog.submitting = true
  try {
    let url = assetDialog.url.trim()
    if (assetDialog.file) {
      const res: any = await materialApi.upload({ file: assetDialog.file, folder: assetDialog.type }, () => {})
      url = res?.url || res?.data?.url || ''
    }
    if (!url) return ElMessage.warning('请填写 URL 或选择文件')
    const asset = { title: assetDialog.title.trim(), url, thumb: url, ...(assetDialog.type === 'materials' ? { type: assetDialog.assetType } : {}) }
    const res: any = assetDialog.index >= 0 ? await adminApi.updateAsset(assetDialog.type, assetDialog.cate, assetDialog.index, asset, assetDialog.sourceCate) : await adminApi.addAsset(assetDialog.type, assetDialog.cate, asset)
    if (res?.code === 200) { ElMessage.success('保存成功'); assetDialog.visible = false; await loadTab() } else ElMessage.error(res?.msg || '保存失败')
  } catch (error: any) { ElMessage.error(error?.message || '保存失败') } finally { assetDialog.submitting = false }
}

async function onDeleteAsset(type: 'materials' | 'photos', row: any) {
  try {
    await ElMessageBox.confirm(`确认删除「${row.title || row.url || '该资源'}」？`, '提示', { type: 'warning' })
    const res: any = await adminApi.deleteAsset(type, row.category, row.index)
    if (res?.code === 200) { ElMessage.success('已删除'); await loadTab() } else ElMessage.error(res?.msg || '删除失败')
  } catch (error) {
    // 忽略取消操作。
  }
}

async function onFontFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  fontDialog.submitting = true
  try {
    const res: any = await materialApi.upload({ file, folder: 'fonts' }, () => {})
    const url = res?.url || res?.data?.url
    if (!url) throw new Error('上传响应缺少字体地址')
    fontDialog.form.woff = url
    fontDialog.form.woff_size = file.size
    ElMessage.success('字体文件上传成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '字体上传失败')
  } finally {
    fontDialog.submitting = false
    input.value = ''
  }
}

/** 无权限 / 登录失效时清掉本地凭据并回首页 */
function deny(msg: string) {
  ElMessage.warning(msg)
  localStorage.removeItem(LocalStorageKey.tokenKey)
  localStorage.removeItem('xp_user')
  setTimeout(() => (window.location.href = './'), 800)
}

/** 前端仅做入口守卫（读本地用户信息），真正的权限由后端 requireAdmin 校验 */
function checkLocalRole(): boolean {
  try {
    const user = JSON.parse(localStorage.getItem('xp_user') || 'null')
    if (user && typeof user.account === 'string' && user.role === 1) return true
  } catch (e) {}
  return false
}

onMounted(() => {
  if (!checkLocalRole()) {
    deny('请使用管理员账号登录')
    return
  }
  loadTab()
})

/** 拉取当前 Tab 数据；接口返回 401（HTTP 200 + code 401）时回首页 */
async function loadTab() {
  if (!checkLocalRole()) return
  loading.value = true
  try {
    let res: any
    adminTotal.value = 0
    if (activeTab.value === 'templates') {
      res = await adminApi.getTemplates({ page: adminPage.value, pageSize: adminPageSize.value })
      templates.value = res?.list || []
    } else if (activeTab.value === 'images') {
      res = await adminApi.getUserImages({ page: adminPage.value, pageSize: adminPageSize.value })
      userImages.value = res?.list || []
    } else if (activeTab.value === 'users') {
      res = await adminApi.getUsers({ page: adminPage.value, pageSize: adminPageSize.value })
      users.value = res?.list || []
    } else if (activeTab.value === 'designs') {
      res = await adminApi.getDesigns({ page: adminPage.value, pageSize: adminPageSize.value })
      designs.value = res?.list || []
    } else if (activeTab.value === 'categories') {
      if (categoryTab.value === 'template-categories') res = await adminApi.getTemplateCategories(templateCategoryType.value, { page: adminPage.value, pageSize: adminPageSize.value })
      else res = await adminApi.getCategories(categoryTab.value as 'materials' | 'photos', { page: adminPage.value, pageSize: adminPageSize.value })
      if (categoryTab.value === 'template-categories') templateCategories.value = res?.list || []
      else if (categoryTab.value === 'materials') materialCates.value = res?.list || []
      else photoCates.value = res?.list || []
    } else if (activeTab.value === 'materials-assets') {
      res = await adminApi.getAssets('materials', { ...assetQuery, page: adminPage.value, pageSize: adminPageSize.value }); materialAssets.value = res?.list || []
    } else if (activeTab.value === 'photos-assets') {
      res = await adminApi.getAssets('photos', { ...assetQuery, page: adminPage.value, pageSize: adminPageSize.value }); photoAssets.value = res?.list || []
    } else if (activeTab.value === 'materials') {
      res = await adminApi.getCategories('materials')
      materialCates.value = res?.list || []
    } else if (activeTab.value === 'template-categories') {
      res = await adminApi.getTemplateCategories(templateCategoryType.value)
      templateCategories.value = res?.list || []
    } else if (activeTab.value === 'photos') {
      res = await adminApi.getCategories('photos')
      photoCates.value = res?.list || []
    } else if (activeTab.value === 'fonts') {
      res = await adminApi.getFonts(fontQuery)
      fonts.value = res?.list || []
      fontQuery.total = Number(res?.total) || 0
    } else if (activeTab.value === 'ai-settings') {
      res = await adminApi.getAiSettings()
      Object.assign(aiForm, res || {})
    }
    if (activeTab.value !== 'fonts') adminTotal.value = Number(res?.total) || 0
    if (res?.code === 401) {
      deny(res?.msg === '请先登录' ? '登录已失效，请重新登录' : '无管理员权限')
    }
  } catch (e: any) {
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

function jump2home() {
  window.location.href = './'
}

/** 在新窗口打开 PSD 导入页；type=1 表示创建组合（组件） */
function openPSDImport(type?: number) {
  const path = type === 1 ? '/psd?type=1' : '/psd'
  window.open(router.resolve(path).href, '_blank')
}

function onEditTemplate(row: any) {
  const href = router.resolve({ path: '/home', query: { tempid: String(row.id), tempType: String(row.type || 0), edit: '1' } }).href
  window.open(href, '_blank')
}

async function openCategoryEditor(row: any) {
  const type = Number(row.type) === 1 ? 1 : 0
  const res: any = await adminApi.getTemplateCategories(type, { page: 1, pageSize: 100 })
  categoryOptions.value = Array.isArray(res?.list) ? res.list : []
  categoryDialog.row = row
  categoryDialog.cate = row.cate || ''
  categoryDialog.visible = true
}

async function saveCategory() {
  const row = categoryDialog.row
  if (!row) return
  categoryDialog.submitting = true
  try {
    const res: any = await adminApi.updateTemplateCategory({ id: row.id, type: Number(row.type) === 1 ? 1 : 0, cate: categoryDialog.cate || '' })
    // 请求封装会解包成功响应的 result：新增返回 { id }，编辑无 result 时返回 { code: 200 }。
    if ((fontDialog.form.id && res?.code === 200) || (!fontDialog.form.id && Number(res?.id) > 0)) {
      row.cate = categoryDialog.cate || ''
      categoryDialog.visible = false
      ElMessage.success('分类已更新')
    } else ElMessage.error(res?.msg || '更新失败')
  } finally { categoryDialog.submitting = false }
}

async function onDelTemplate(row: any) {
  try {
    await ElMessageBox.confirm(`确认下架「${row.title || row.id}」？`, '提示', { type: 'warning' })
    const res: any = await adminApi.deleteTemplate(row.id)
    if (res?.code === 200) { ElMessage.success('已下架'); await loadTab() } else ElMessage.error(res?.msg || '操作失败')
  } catch (error) {
    // 忽略取消操作。
  }
}

async function onRemoveTemplate(row: any) {
  try {
    await ElMessageBox.confirm(`确认永久删除「${row.title || row.id}」？删除后不可恢复。`, '危险操作', { type: 'warning' })
    const res: any = await adminApi.removeTemplate(row.id)
    if (res?.code === 200) { ElMessage.success('已删除'); await loadTab() } else ElMessage.error(res?.msg || '删除失败')
  } catch (error) {
    // 忽略取消操作。
  }
}

async function onDelUserImage(row: any) {
  await ElMessageBox.confirm('确认删除该图片记录？（不会删除文件本体）', '提示', { type: 'warning' })
  const res: any = await adminApi.deleteUserImage(row.id)
  if (res?.code === 200) {
    ElMessage.success('已删除')
    loadTab()
  } else {
    ElMessage.error(res?.msg || '操作失败')
  }
}

async function onDelUser(row: adminApi.TAdminUserItem) {
  await ElMessageBox.confirm(`确认删除用户「${row.account}」？该操作不可恢复。`, '危险操作', { type: 'warning' })
  const res: any = await adminApi.deleteUser(row.id)
  if (res?.code === 200) {
    ElMessage.success('用户已删除')
    loadTab()
  } else {
    ElMessage.error(res?.msg || '删除失败')
  }
}

async function onDelDesign(row: adminApi.TAdminDesignItem) {
  await ElMessageBox.confirm(`确认删除用户「${row.account}」的作品「${row.title || row.id}」？`, '危险操作', { type: 'warning' })
  const res: any = await adminApi.deleteDesign(row.id)
  if (res?.code === 200) { ElMessage.success('作品已删除'); loadTab() } else ElMessage.error(res?.msg || '删除失败')
}

async function onDelCategory(type: 'materials' | 'photos', row: any) {
  try {
    await ElMessageBox.confirm(`确认删除分类「${row.name || row.cate}」？`, '提示', { type: 'warning' })
    const res: any = await adminApi.deleteCategory(type, row.cate)
    if (res?.code === 200) { ElMessage.success('已删除'); await loadTab() } else ElMessage.error(res?.msg || '操作失败')
  } catch (error) {
    // 用户取消确认时，Element Plus 会 reject Promise，这不是业务错误。
  }
}

async function onAddCategory(type: 'materials' | 'photos') {
  try {
    const result = await ElMessageBox.prompt('请输入分类名称', '新增分类', { inputValidator: (value) => value.trim() ? true : '分类名称不能为空' })
    const res: any = await adminApi.addCategory(type, result.value.trim())
    if (res?.code === 200) { ElMessage.success('分类创建成功'); await loadTab() } else ElMessage.error(res?.msg || '分类创建失败')
  } catch (error) {
    // 忽略取消操作，避免触发 Vue 的 unhandled component event handler。
  }
}

async function onRenameCategory(type: 'materials' | 'photos', row: any) {
  try {
    const result = await ElMessageBox.prompt('请输入新的分类名称', '重命名分类', { inputValue: row.name || row.cate, inputValidator: (value) => value.trim() ? true : '分类名称不能为空' })
    const res: any = await adminApi.renameCategory(type, row.cate, result.value.trim())
    if (res?.code === 200) { ElMessage.success('分类已重命名'); await loadTab() } else ElMessage.error(res?.msg || '分类重命名失败')
  } catch (error) {
    // 忽略取消操作。
  }
}

async function addTemplateCategory() {
  if (!newTemplateCategory.name.trim()) return ElMessage.warning('请填写分类名称')
  const res: any = await adminApi.addTemplateCategory({ ...newTemplateCategory, type: templateCategoryType.value })
  if (res?.id) {
    newTemplateCategory.name = ''
    ElMessage.success('分类已创建')
    loadTab()
  } else ElMessage.error(res?.msg || '创建失败')
}

async function onDelTemplateCategory(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除分类「${row.name}」？已有模板不会被删除。`, '提示', { type: 'warning' })
    const res: any = await adminApi.deleteTemplateCategory(row.id)
    res?.code === 200 ? (ElMessage.success('分类已删除'), await loadTab()) : ElMessage.error(res?.msg || '删除失败')
  } catch (error) {
    // 忽略取消操作。
  }
}

async function onRenameTemplateCategory(row: any) {
  try {
    const result = await ElMessageBox.prompt('请输入新的分类名称', '重命名分类', { inputValue: row.name, inputValidator: (value) => value.trim() ? true : '分类名称不能为空' })
    const res: any = await adminApi.renameTemplateCategory({ id: row.id, name: result.value.trim() })
    if (res?.code === 200) { ElMessage.success('分类已重命名'); await loadTab() } else ElMessage.error(res?.msg || '重命名失败')
  } catch (error) {
    // 忽略取消操作。
  }
}

/** 提交新增字体：先过前端表单校验，再调接口 */
async function submitFont() {
  if (!fontFormRef.value) return
  try {
    await fontFormRef.value.validate()
  } catch (e) {
    return
  }
  fontDialog.submitting = true
  try {
    const data = {
      alias: fontDialog.form.alias.trim(),
      value: fontDialog.form.value.trim(),
      woff: fontDialog.form.woff.trim(),
      ttf: fontDialog.form.ttf.trim(),
      preview: fontDialog.form.preview.trim(),
      lang: fontDialog.form.lang,
      font_family: fontDialog.form.font_family.trim(),
      size: Number(fontDialog.form.size) || 0,
      woff_size: Number(fontDialog.form.woff_size) || 0,
    }
    const res: any = fontDialog.form.id
      ? await adminApi.updateFont({ ...data, id: fontDialog.form.id })
      : await adminApi.addFont(data)
    // 成功响应会被请求封装解包：新增返回 { id }，编辑无 result 时返回 { code: 200 }。
    if ((fontDialog.form.id && res?.code === 200) || (!fontDialog.form.id && Number(res?.id) > 0)) {
      ElMessage.success(fontDialog.form.id ? '修改成功' : '新增成功')
      fontDialog.visible = false
      // 清掉旧 localStorage 缓存（虽然当前 font store 已不再用 localStorage，但保留兜底清理）
      localStorage.removeItem('FONTS_VERSION')
      localStorage.removeItem('FONTS')
      await loadTab()
    } else {
      ElMessage.error(res?.msg || '新增失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '新增失败')
  } finally {
    fontDialog.submitting = false
  }
}

async function onDelFont(row: adminApi.TAdminFontItem) {
  await ElMessageBox.confirm(`确认删除字体「${row.alias || row.value || row.id}」？`, '提示', { type: 'warning' })
  const res: any = await adminApi.deleteFont(row.id)
  if (res?.code === 200) {
    ElMessage.success('已删除')
    localStorage.removeItem('FONTS_VERSION')
    localStorage.removeItem('FONTS')
    loadTab()
  } else {
    ElMessage.error(res?.msg || '操作失败')
  }
}

/** 保存 AI 配置：空密钥视为保留原值不清空（仅管理员可调用） */
async function saveAiSettings() {
  aiSaving.value = true
  try {
    const res: any = await adminApi.updateAiSettings({
      zhipu_api_key: aiForm.zhipu_api_key.trim() || undefined,
      text_model: aiForm.text_model.trim(),
      image_model: aiForm.image_model.trim(),
      enabled: aiForm.enabled,
    })
    if (res?.code === 200) {
      ElMessage.success('AI 配置已保存')
      await loadTab()
    } else {
      ElMessage.error(res?.msg || '保存失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    aiSaving.value = false
  }
}

/** 测试智谱连接：复用后台配置实际调一次 */
async function testAiConnection() {
  aiTesting.value = true
  try {
    const res: any = await adminApi.testAiConnection()
    // 成功响应会被请求封装解包为 { content }（无 code），失败则为 { code: 400, msg }
    if (res && typeof res.content === 'string') ElMessage.success('连接成功')
    else ElMessage.error(res?.msg || '连接失败')
  } catch (e: any) {
    ElMessage.error(e?.message || '连接失败')
  } finally {
    aiTesting.value = false
  }
}
</script>

<style lang="less" scoped>
.admin-page {
  height: 100vh;
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
  box-sizing: border-box;
  overflow: auto;
}
.admin-panel {
  max-width: 1080px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  padding: 16px 24px 24px;
  box-sizing: border-box;
}
.admin-panel :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 360px);
  overflow-y: auto;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}
.admin-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 8px 0 20px;
}
.summary-card {
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafcff;
}
.summary-card strong { display: block; margin-top: 6px; color: #303133; font-size: 24px; }
.summary-label { color: #909399; font-size: 13px; }
.tab-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.tab-description { flex: 1; color: #909399; font-size: 13px; }
.muted-text { color: #c0c4cc; font-size: 12px; }
@media (max-width: 720px) {
  .admin-page { padding: 12px; }
  .admin-panel { padding: 12px; }
  .admin-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tab-toolbar { flex-wrap: wrap; }
  .tab-description { flex-basis: 100%; }
}
</style>
